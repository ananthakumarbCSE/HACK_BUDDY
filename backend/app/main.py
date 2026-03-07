from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, hackathons, teams

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HackBuddy API")

# Setup CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default port
    "*" # In production, lock this down
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hackathons.router)
app.include_router(teams.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to HackBuddy API"}
