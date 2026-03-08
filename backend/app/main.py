from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path
from .database import engine, Base
from .routes import auth, hackathons, teams, credentials, sessions

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HackBuddy API")

# Setup CORS - allow all origins in production
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://localhost:8001",
    "*",  # Allow all origins for frontend flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hackathons.router)
app.include_router(teams.router)
app.include_router(credentials.router)
app.include_router(sessions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to HackBuddy API"}

# Serve static frontend files
static_path = Path(__file__).parent.parent.parent / "static"
if static_path.exists():
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
