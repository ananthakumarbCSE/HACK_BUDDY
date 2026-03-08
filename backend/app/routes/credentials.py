from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/credentials", tags=["credentials"])

@router.post("/", response_model=schemas.PlatformCredentialResponse)
def create_platform_credential(
    cred: schemas.PlatformCredentialCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if already exists for this platform
    existing = db.query(models.PlatformCredential).filter(
        models.PlatformCredential.user_id == current_user.id,
        models.PlatformCredential.platform_name == cred.platform_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Credential for this platform already exists")
    
    encrypted_pwd = auth.encrypt_password(cred.password)
    new_cred = models.PlatformCredential(
        user_id=current_user.id,
        platform_name=cred.platform_name,
        email=cred.email,
        encrypted_password=encrypted_pwd
    )
    db.add(new_cred)
    db.commit()
    db.refresh(new_cred)
    return new_cred

@router.get("/", response_model=list[schemas.PlatformCredentialResponse])
def get_platform_credentials(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.PlatformCredential).filter(
        models.PlatformCredential.user_id == current_user.id
    ).all()

@router.put("/{cred_id}", response_model=schemas.PlatformCredentialResponse)
def update_platform_credential(
    cred_id: int,
    cred: schemas.PlatformCredentialCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_cred = db.query(models.PlatformCredential).filter(
        models.PlatformCredential.id == cred_id,
        models.PlatformCredential.user_id == current_user.id
    ).first()
    if not db_cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    
    db_cred.email = cred.email
    db_cred.encrypted_password = auth.encrypt_password(cred.password)
    db.commit()
    db.refresh(db_cred)
    return db_cred

@router.delete("/{cred_id}")
def delete_platform_credential(
    cred_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_cred = db.query(models.PlatformCredential).filter(
        models.PlatformCredential.id == cred_id,
        models.PlatformCredential.user_id == current_user.id
    ).first()
    if not db_cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    
    db.delete(db_cred)
    db.commit()
    return {"message": "Credential deleted"}