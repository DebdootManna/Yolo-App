#!/bin/bash

# Start script for YOLO Detection API

# Set environment variables
export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}

# Create necessary directories
mkdir -p uploads
mkdir -p outputs
mkdir -p models

# Download pretrained models if not already present
echo "Checking and downloading pretrained models..."
cd models
wget -nc https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8s.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8l.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8x.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov9c.pt
wget -nc https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov9e.pt
cd ..

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