from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import RegistrationStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Team Schemas
class TeamMemberBase(BaseModel):
    user_id: int
    role: str

class TeamMemberResponse(TeamMemberBase):
    id: int
    class Config:
        orm_mode = True

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
        orm_mode = True

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

class HackathonCreate(HackathonBase):
    pass

class HackathonResponse(HackathonBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

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
        orm_mode = True
