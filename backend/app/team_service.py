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
    
    # We no longer add the leader inherently as a TeamMember model
    # because the leader properties exist structurally within User, and TeamMembers are strictly other participants.
    
    return db_team

def get_user_teams(db: Session, user_id: int):
    # Memberships now exist as manual datastores inside Teams.
    # Therefore, user_teams just means teams led by this User.
    return db.query(Team).filter(Team.leader_id == user_id).all()

def add_member_manual(db: Session, team_id: int, leader_id: int, req: "schemas.TeamMemberCreate"):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team or team.leader_id != leader_id:
        raise ValueError("Team not found or unauthorized.")
        
    new_member = TeamMember(
        team_id=team_id,
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        mobile=req.mobile,
        gender=req.gender,
        organization=req.organization,
        location=req.location,
        role=req.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

def edit_member_manual(db: Session, member_id: int, leader_id: int, req: "schemas.TeamMemberUpdate"):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise ValueError("Member not found.")
        
    team = db.query(Team).filter(Team.id == member.team_id).first()
    if not team or team.leader_id != leader_id:
        raise ValueError("Unauthorized to edit this team's members.")
        
    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)
        
    db.commit()
    db.refresh(member)
    return member

def delete_member_manual(db: Session, member_id: int, leader_id: int):
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise ValueError("Member not found.")
        
    team = db.query(Team).filter(Team.id == member.team_id).first()
    if not team or team.leader_id != leader_id:
        raise ValueError("Unauthorized to delete this team's members.")
        
    db.delete(member)
    db.commit()
    return {"detail": "Member deleted successfully"}

def get_team_details(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()
