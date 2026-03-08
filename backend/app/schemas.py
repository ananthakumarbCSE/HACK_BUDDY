from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import RegistrationStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    mobile: Optional[str] = None
    gender: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Platform Credential Schemas
class PlatformCredentialBase(BaseModel):
    platform_name: str
    email: str
    password: str

class PlatformCredentialCreate(PlatformCredentialBase):
    pass

class PlatformCredentialResponse(BaseModel):
    id: int
    platform_name: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

# Platform Session Schemas
class PlatformSessionCreate(BaseModel):
    platform_name: str
    cookies_json: str
    expires_at: Optional[datetime] = None

class PlatformSessionResponse(BaseModel):
    id: int
    platform_name: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Team Schemas
class TeamMemberBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile: Optional[str] = None
    gender: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    role: str = "Member"

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None

class TeamMemberResponse(TeamMemberBase):
    id: int
    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    leader_id: int
    created_at: datetime
    members: List[TeamMemberResponse] = []
    class Config:
        from_attributes = True

# Hackathon Schemas
class HackathonBase(BaseModel):
    name: str
    domain: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    prize_pool: Optional[str] = None
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_link: str
    description: Optional[str] = None
    platform: Optional[str] = None

class HackathonCreate(HackathonBase):
    pass

class HackathonResponse(HackathonBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SearchHackathonRequest(BaseModel):
    query: str

# Registration Schemas
class RegistrationBase(BaseModel):
    team_id: int
    hackathon_id: int

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationResponse(RegistrationBase):
    id: int
    status: RegistrationStatus
    created_at: datetime
    tinyfish_run_id: Optional[str] = None
    logs: Optional[str] = None
    class Config:
        from_attributes = True
