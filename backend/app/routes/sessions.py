from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/platform/session", tags=["sessions"])

@router.post("/", response_model=schemas.PlatformSessionResponse)
def save_platform_session(
    session_data: schemas.PlatformSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Save platform session cookies (encrypted)"""
    
    # Check if session already exists for this platform
    existing = db.query(models.PlatformSession).filter(
        models.PlatformSession.user_id == current_user.id,
        models.PlatformSession.platform_name == session_data.platform_name
    ).first()
    
    # Encrypt the cookies before storing
    encrypted_cookies = auth.encrypt_password(session_data.cookies_json)
    
    if existing:
        # Update existing session
        existing.cookies_json = encrypted_cookies
        existing.expires_at = session_data.expires_at
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new session
    new_session = models.PlatformSession(
        user_id=current_user.id,
        platform_name=session_data.platform_name,
        cookies_json=encrypted_cookies,
        expires_at=session_data.expires_at
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/{platform_name}", response_model=schemas.PlatformSessionResponse)
def get_platform_session(
    platform_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Retrieve platform session cookies (decrypted for use)"""
    session = db.query(models.PlatformSession).filter(
        models.PlatformSession.user_id == current_user.id,
        models.PlatformSession.platform_name == platform_name
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session

@router.get("/", response_model=list[schemas.PlatformSessionResponse])
def get_all_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all platform sessions for current user"""
    return db.query(models.PlatformSession).filter(
        models.PlatformSession.user_id == current_user.id
    ).all()

@router.delete("/{platform_name}")
def delete_platform_session(
    platform_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete platform session"""
    session = db.query(models.PlatformSession).filter(
        models.PlatformSession.user_id == current_user.id,
        models.PlatformSession.platform_name == platform_name
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": f"Session for {platform_name} deleted"}
