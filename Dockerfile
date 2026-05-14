# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./
# Build the application
RUN npm run build

# --- Stage 2: Build the FastAPI Backend ---
FROM python:3.10-slim
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Copy backend requirements (assuming you have restored them)
# Note: If requirements.txt is still missing, make sure to recreate it with fastapi, uvicorn, etc.
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the built React files from the frontend-build stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose the port that Cloud Run expects
EXPOSE 8080

# Change working directory to backend so absolute imports work
WORKDIR /app/backend

# Command to start the FastAPI server using the PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
