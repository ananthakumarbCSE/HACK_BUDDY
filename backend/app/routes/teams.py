from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth
from ..database import get_db
from ..team_service import create_team, get_user_teams, get_team_details

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

@router.post("/{team_id}/members", response_model=schemas.TeamMemberResponse)
def add_team_member(team_id: int, req: schemas.TeamMemberCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        from ..team_service import add_member_manual
        return add_member_manual(db, team_id, current_user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/members/{member_id}", response_model=schemas.TeamMemberResponse)
def update_team_member(member_id: int, req: schemas.TeamMemberUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        from ..team_service import edit_member_manual
        return edit_member_manual(db, member_id, current_user.id, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/members/{member_id}")
def delete_team_member(member_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        from ..team_service import delete_member_manual
        return delete_member_manual(db, member_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
