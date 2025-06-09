#!/bin/bash

# Start script for YOLO Detection API

# Set environment variables
export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}

# Create necessary directories
mkdir -p uploads
mkdir -p outputs
mkdir -p models

# Start the FastAPI application with uvicorn
echo "Starting YOLO Detection API..."
echo "Host: $HOST"
echo "Port: $PORT"

# Check if we're in development or production
if [ "$DEBUG" = "True" ]; then
    echo "Running in development mode with auto-reload"
    uvicorn app:app --host $HOST --port $PORT --reload
else
    echo "Running in production mode"
    uvicorn app:app --host $HOST --port $PORT --workers 1
fi