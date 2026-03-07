from sqlalchemy.orm import Session
from datetime import datetime
from .models import Hackathon, Registration, Team
from .schemas import HackathonCreate, RegistrationCreate, RegistrationStatus
from .tinyfish_service import tinyfish_service

def search_and_store_hackathons(db: Session, platform_url: str, goal: str):
    """
    Search for hackathons using TinyFish and store them in the DB.
    """
    results = tinyfish_service.search_hackathons(url=platform_url, goal=goal)
    saved_hackathons = []
    
    for r in results:
        # Check if already exists
        link = r.get("registration_link")
        if not link:
            continue
            
        existing = db.query(Hackathon).filter(Hackathon.registration_link == link).first()
        if not existing:
            # Parse dates if possible (for simplicity assuming None or valid strings from agent)
            # In a real app we'd need robust date parsing
            new_h = Hackathon(
                name=r.get("name", "Unknown Hackathon"),
                domain=r.get("domain"),
                type=r.get("type"),
                location=r.get("location"),
                prize_pool=r.get("prize_pool"),
                registration_link=link,
                description=r.get("description", "")
            )
            db.add(new_h)
            saved_hackathons.append(new_h)
            
    if saved_hackathons:
        db.commit()
        for h in saved_hackathons:
            db.refresh(h)
    return saved_hackathons

def get_hackathons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Hackathon).offset(skip).limit(limit).all()

def register_team_for_hackathon(db: Session, reg_data: RegistrationCreate):
    team = db.query(Team).filter(Team.id == reg_data.team_id).first()
    hackathon = db.query(Hackathon).filter(Hackathon.id == reg_data.hackathon_id).first()
    
    if not team or not hackathon:
        raise ValueError("Team or Hackathon not found")
        
    registration = db.query(Registration).filter(
        Registration.team_id == team.id,
        Registration.hackathon_id == hackathon.id
    ).first()
    
    if registration:
        return registration
        
    new_reg = Registration(
        team_id=team.id,
        hackathon_id=hackathon.id,
        status=RegistrationStatus.REGISTERING
    )
    db.add(new_reg)
    db.commit()
    db.refresh(new_reg)
    
    # Trigger TinyFish Registration (ideally async with Celery/BackgroundTasks)
    # Constructing goal for TinyFish
    goal = f"""
    Register for the hackathon at {hackathon.registration_link}.
    Leader name: {team.leader.name}.
    Leader Email: {team.leader.email}.
    Team Name: {team.name}.
    Team Members: {[m.user.name for m in team.members]}.
    Submit the form and return confirmation.
    """
    
    tf_result = tinyfish_service.register_team(url=hackathon.registration_link, instructions=goal)
    
    new_reg.status = RegistrationStatus.REGISTERED if tf_result.get("status") == "success" else RegistrationStatus.FAILED
    new_reg.logs = tf_result.get("logs", "")
    new_reg.tinyfish_run_id = tf_result.get("run_id", "")
    
    db.commit()
    db.refresh(new_reg)
    return new_reg
