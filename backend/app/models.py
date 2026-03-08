from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    teams_led = relationship("Team", back_populates="leader")
    memberships = relationship(
        "TeamMember",
        back_populates="user",
        cascade="all, delete"
    )
    platform_credentials = relationship("PlatformCredential", back_populates="user", cascade="all, delete")
    platform_sessions = relationship("PlatformSession", back_populates="user", cascade="all, delete")

class PlatformCredential(Base):
    __tablename__ = "platform_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    encrypted_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="platform_credentials")

class PlatformSession(Base):
    __tablename__ = "platform_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform_name = Column(String, nullable=False)
    cookies_json = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="platform_sessions")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    leader_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    leader = relationship("User", back_populates="teams_led")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete")
    registrations = relationship("Registration", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    location = Column(String, nullable=True)
    role = Column(String, default="Member")
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    domain = Column(String) # AI, Web3, etc
    type = Column(String) # Online/Offline
    location = Column(String)
    prize_pool = Column(String)
    deadline = Column(DateTime)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    registration_link = Column(String, nullable=False)
    description = Column(Text)
    platform = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("Registration", back_populates="hackathon")

class RegistrationStatus(str, enum.Enum):
    PENDING = "PENDING"
    REGISTERING = "REGISTERING"
    REGISTERED = "REGISTERED"
    FAILED = "FAILED"

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"))
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    tinyfish_run_id = Column(String, nullable=True)
    logs = Column(Text, nullable=True)

    team = relationship("Team", back_populates="registrations")
    hackathon = relationship("Hackathon", back_populates="registrations")
