from sqlalchemy.orm import Session
from datetime import datetime
from .models import Hackathon, Registration, Team, PlatformCredential, PlatformSession
from .schemas import HackathonCreate, RegistrationCreate, RegistrationStatus
from .tinyfish_service import tinyfish_service
from . import auth

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
                name=r.get("hackathon_name", "Unknown Hackathon"),
                domain=r.get("domain"),
                type=r.get("type"),
                location=r.get("location"),
                prize_pool=r.get("prize_pool"),
                registration_link=link,
                description=r.get("description", ""),
                platform="Unstop"
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
    
    # Try to get platform session (cookies) first
    platform_session = db.query(PlatformSession).filter(
        PlatformSession.user_id == team.leader.id,
        PlatformSession.platform_name == "unstop"
    ).first()
    
    # Fall back to credentials if no session
    platform_cred = db.query(PlatformCredential).filter(
        PlatformCredential.user_id == team.leader.id,
        PlatformCredential.platform_name == "unstop"
    ).first()
    
    if not platform_session and not platform_cred:
        raise ValueError("No Unstop session or credentials found for team leader")
    
    # Build registration goal for TinyFish
    members_data = ""
    for idx, m in enumerate(team.members):
        members_data += f"\nMember {idx + 1}:\n"
        members_data += f"- Name: {m.first_name} {m.last_name}\n"
        members_data += f"- Email: {m.email}\n"
        members_data += f"- Mobile: {m.mobile}\n"
        members_data += f"- Gender: {m.gender}\n"
        members_data += f"- Organization: {m.organization}\n"
        members_data += f"- Location: {m.location}\n"
        members_data += f"- Role: {m.role}\n"

    if platform_session:
        # Use cookies - this avoids CAPTCHA!
        # Decrypt the cookies (they were encrypted before storage)
        decrypted_cookies = auth.decrypt_password(platform_session.cookies_json)
        
        goal = f"""
    Register this team for the hackathon at {hackathon.registration_link}.
    
    IMPORTANT: Use the provided session cookies to stay authenticated.
    The user is already logged in - navigate directly to the registration form.
    
    DO NOT attempt to log in again - this will trigger CAPTCHA.
    
    Team Name: {team.name}
    
    Team Leader Details:
    Name: {team.leader.first_name} {team.leader.last_name}
    Email: {team.leader.email}
    Mobile: {team.leader.mobile}
    Gender: {team.leader.gender}
    Organization: {team.leader.organization}
    Location: {team.leader.location}

    Team Members:
    {members_data}
    
    Steps:
    1. Set the provided cookies in the browser context.
    2. Navigate to the registration form at {hackathon.registration_link}.
    3. Fill all required fields for Team Leader and Team Members automatically.
    4. Detect and toggle checkboxes, dropdowns, radio agreements appropriately.
    5. Submit the registration and return success trace.
    """
        
        # Pass DECRYPTED cookies to TinyFish
        tf_result = tinyfish_service.register_team(
            url=hackathon.registration_link,
            instructions=goal,
            cookies_json=decrypted_cookies
        )
    else:
        # Fallback: use credentials (will trigger CAPTCHA)
        decrypted_password = auth.decrypt_password(platform_cred.encrypted_password)
        
        goal = f"""
    Register this team for the hackathon at {hackathon.registration_link}.
    
    WARNING: This will use login credentials (may trigger CAPTCHA).
    For better experience, please save your session cookies first.
    
    Use the following Unstop login credentials:
    Email: {platform_cred.email}
    Password: {decrypted_password}
    
    Team Name: {team.name}
    
    Team Leader Details:
    Name: {team.leader.first_name} {team.leader.last_name}
    Email: {team.leader.email}
    Mobile: {team.leader.mobile}
    Gender: {team.leader.gender}
    Organization: {team.leader.organization}
    Location: {team.leader.location}

    Team Members:
    {members_data}
    
    Steps:
    1. Log in with the provided credentials.
    2. Navigate to the registration form.
    3. Fill all required fields automatically.
    4. Submit the registration and return success trace.
    """
        
        tf_result = tinyfish_service.register_team(url=hackathon.registration_link, instructions=goal)
    
    new_reg.status = RegistrationStatus.REGISTERED if tf_result.get("status") == "success" else RegistrationStatus.FAILED
    new_reg.logs = tf_result.get("logs", "")
    new_reg.tinyfish_run_id = tf_result.get("run_id", "")
    
    db.commit()
    db.refresh(new_reg)
    return new_reg
