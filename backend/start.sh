#!/bin/bash

# Start Celery Worker in background
echo "Starting Celery Worker..."
celery -A app.worker.celery_app worker --loglevel=info &

# Start FastAPI application
echo "Starting Uvicorn..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
