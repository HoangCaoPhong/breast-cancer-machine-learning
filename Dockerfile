# Multi-stage Dockerfile: All-in-One Fullstack Service (React + FastAPI)
# Stage 1: Build React Frontend Production Bundle
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Frontend Static Files
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code and canonical dataset
COPY backend/ ./backend/
COPY data/ ./data/

# Copy built frontend production bundle
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set working directory to backend
WORKDIR /app/backend
ENV PYTHONPATH=/app/backend

# Expose port 3000
EXPOSE 3000

# Start FastAPI server on port 3000 serving both API and Frontend
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
