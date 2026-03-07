from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth
from ..database import get_db
from ..team_service import create_team, get_user_teams, add_member, get_team_details

router = APIRouter(prefix="/teams", tags=["teams"])

@router.post("/", response_model=schemas.TeamResponse)
def create_new_team(team: schemas.TeamCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        return create_team(db, team, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.TeamResponse])
def read_my_teams(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return get_user_teams(db, current_user.id)

@router.get("/{team_id}", response_model=schemas.TeamResponse)
def read_team(team_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    team = get_team_details(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

class AddMemberRequest(schemas.BaseModel):
    email: str
    role: str = "Member"

@router.post("/{team_id}/members", response_model=schemas.TeamMemberResponse)
def add_team_member(team_id: int, req: AddMemberRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        return add_member(db, team_id, current_user.id, req.email, req.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
