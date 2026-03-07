# HackBuddy

HackBuddy is an AI agent web platform that automatically finds hackathons and registers a team using the TinyFish Web Agent API. This project consists of a React frontend and a FastAPI backend with PostgreSQL.

## Features
- **User Authentication**: Secure login with JWT and bcrypt password hashing.
- **Team Management**: Create teams, invite members, and manage rosters.
- **AI Hackathon Discovery**: Use TinyFish to scrape Devpost, HackerEarth, etc.
- **Auto-Registration**: Automatically fill out Hackathon registration forms using TinyFish.
- **Dashboard**: Track upcoming registered hackathons and their statuses.

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd hackbuddy
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root directory (or just set them in your terminal):
   ```
   TINYFISH_API_KEY=your_tinyfish_key_here
   ```

3. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the applications:
   - **Frontend**: http://localhost:3000
   - **Backend API Docs**: http://localhost:8000/docs
   - **Database**: localhost:5432

## Cloud Deployment (Free Tier)

### Deploying to Render (Free Tier)

1. **PostgreSQL Database**:
   - Create a free PostgreSQL instance on Render.
   - Copy the internal Database URL.

2. **Backend (FastAPI)**:
   - Create a new "Web Service" tied to your GitHub repo.
   - Set the Root Directory to `backend`.
   - Environment: `Docker`.
   - Set Environment Variables:
     - `DATABASE_URL`: Add your Render PostgreSQL internal URL.
     - `TINYFISH_API_KEY`: Add your TinyFish secret.
     - `SECRET_KEY`: A random strong string.
   - Click Deploy. Copy the live API URL.

3. **Frontend (Vite + React)**:
   - Create a new "Static Site" on Render tied to your GitHub repo.
   - Set the Root Directory to `frontend`.
   - Build Command: `npm run build`.
   - Publish Directory: `dist`.
   - Set Environment Variables:
     - `VITE_API_URL`: Set this to your live Backend API URL from Step 2.
   - Click Deploy.

### Deploying to Railway (Alternative Free Tier)

1. Connect your repo to Railway.
2. Add a PostgreSQL plugin to your project.
3. Deploy the Backend from the `/backend` directory. Railway will detect the Dockerfile automatically. Set the `DATABASE_URL` reference variable.
4. Deploy the Frontend from the `/frontend` directory. Set `VITE_API_URL` to your Railway Backend URL.
