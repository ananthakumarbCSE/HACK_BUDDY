from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth
from ..database import get_db
from ..hackathon_service import get_hackathons, search_and_store_hackathons, register_team_for_hackathon

router = APIRouter(prefix="/hackathons", tags=["hackathons"])

PLATFORMS = [
    "https://unstop.com/competitions"
]

@router.get("/", response_model=List[schemas.HackathonResponse])
def read_hackathons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_hackathons(db, skip=skip, limit=limit)

@router.post("/search", response_model=List[schemas.HackathonResponse])
def trigger_hackathon_search(req: schemas.SearchHackathonRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        results = []
        goal = f"""
Find hackathons on Unstop that match the following request:

{req.query}

Only include hackathons that match the criteria.

Return ONLY the best 5 hackathons.

Extract the following fields:
- hackathon_name
- prize_pool
- deadline
- location
- domain
- registration_link

Return results as JSON array.
"""

        for url in PLATFORMS:
            try:
                hacks = search_and_store_hackathons(db, url, goal)
                if hacks:
                    results.extend(hacks)
            except Exception as e:
                print(f"Failed to scan {url}: {e}")

        if not results:
            raise HTTPException(status_code=500, detail={"error": "Failed to extract hackathons or no new hackathons were found."})
        
        results = results[:5]
        return results
    except HTTPException:
        raise
    except Exception as e:
        # Prevent 500 crash traces
        raise HTTPException(status_code=500, detail={"error": f"TinyFish search failed totally: {str(e)}"})

@router.post("/register", response_model=schemas.RegistrationResponse)
def register_for_hackathon(
    reg_req: schemas.RegistrationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    team = db.query(models.Team).filter(models.Team.id == reg_req.team_id).first()
    if not team or team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to register this team.")

    try:
        # For a better UX, registration can be executed synchronously here,
        # but TinyFish agents can take 10-30 seconds.
        # Background task processing isn't strictly requested to be async API so we do it sync.
        reg = register_team_for_hackathon(db, reg_req)
        return reg
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/registered", response_model=List[schemas.RegistrationResponse])
def user_registrations(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    team_ids = list(set([t.id for t in current_user.teams_led] + [m.team_id for m in current_user.memberships]))
    registrations = db.query(models.Registration).filter(models.Registration.team_id.in_(team_ids)).all()
    return registrations
