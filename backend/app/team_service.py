from sqlalchemy.orm import Session
from .models import Team, TeamMember, User
from .schemas import TeamCreate

def create_team(db: Session, team: TeamCreate, leader_id: int):
    # Check if a team with name already exists
    existing = db.query(Team).filter(Team.name == team.name).first()
    if existing:
        raise ValueError("Team name already taken.")
        
    db_team = Team(name=team.name, leader_id=leader_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    # Add leader as a member
    db_member = TeamMember(team_id=db_team.id, user_id=leader_id, role="Leader")
    db.add(db_member)
    db.commit()
    
    return db_team

def get_user_teams(db: Session, user_id: int):
    memberships = db.query(TeamMember).filter(TeamMember.user_id == user_id).all()
    team_ids = [m.team_id for m in memberships]
    return db.query(Team).filter(Team.id.in_(team_ids)).all()

def add_member(db: Session, team_id: int, leader_id: int, email: str, role: str = "Member"):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team or team.leader_id != leader_id:
        raise ValueError("Team not found or unauthorized.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError("User not found by email.")
        
    existing_mem = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user.id
    ).first()
    
    if existing_mem:
        raise ValueError("User is already a member of this team.")
        
    new_member = TeamMember(team_id=team_id, user_id=user.id, role=role)
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

def get_team_details(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()
