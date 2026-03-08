# This is a multi-stage root Dockerfile for Railway
# Railway will use this for the main service

FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend service
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Copy frontend dist from build stage
COPY --from=frontend-build /app/frontend/dist ./static

# Run backend with frontend served as static files
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
