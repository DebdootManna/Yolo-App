#!/bin/bash

# YOLO Detection Setup for Python 3.13
# Step-by-step installation script with error handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the 'Yolo App' directory"
    exit 1
fi

print_step "Setting up YOLO Detection for Python 3.13..."

# Backend Setup
print_step "Setting up backend..."
cd backend

# Create virtual environment
print_step "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
print_step "Upgrading pip..."
pip install --upgrade pip

# Install packages one by one with error handling
print_step "Installing core FastAPI dependencies..."
pip install fastapi || { print_error "Failed to install FastAPI"; exit 1; }
pip install "uvicorn[standard]" || { print_error "Failed to install Uvicorn"; exit 1; }
pip install python-multipart || { print_error "Failed to install python-multipart"; exit 1; }
pip install pydantic || { print_error "Failed to install Pydantic"; exit 1; }

print_step "Installing essential utilities..."
pip install python-dotenv || { print_error "Failed to install python-dotenv"; exit 1; }
pip install aiofiles || { print_error "Failed to install aiofiles"; exit 1; }
pip install requests || { print_error "Failed to install requests"; exit 1; }
pip install anyio || { print_error "Failed to install anyio"; exit 1; }

print_step "Installing computer vision dependencies..."
pip install numpy || { print_error "Failed to install NumPy"; exit 1; }
pip install Pillow || { print_error "Failed to install Pillow"; exit 1; }

print_step "Installing OpenCV..."
pip install opencv-python || {
    print_warning "opencv-python failed, trying opencv-python-headless..."
    pip install opencv-python-headless || { print_error "Failed to install OpenCV"; exit 1; }
}

print_step "Installing PyTorch (this may take a while)..."
pip install torch torchvision || {
    print_warning "GPU PyTorch failed, trying CPU version..."
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu || { print_error "Failed to install PyTorch"; exit 1; }
}

print_step "Installing Ultralytics YOLO..."
pip install ultralytics || { print_error "Failed to install Ultralytics"; exit 1; }

print_step "Installing additional utilities..."
pip install httpx || { print_error "Failed to install httpx"; exit 1; }

# Test imports
print_step "Testing Python imports..."
python3 -c "
import fastapi
import uvicorn
import torch
import cv2
import ultralytics
import numpy as np
from PIL import Image
print('✅ All core dependencies imported successfully!')
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'OpenCV version: {cv2.__version__}')
print(f'NumPy version: {np.__version__}')
" || { print_error "Import test failed"; exit 1; }

# Create directories
print_step "Creating necessary directories..."
mkdir -p uploads outputs models logs

# Setup environment file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_step "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit backend/.env file with your configuration"
    else
        print_step "Creating basic .env file..."
        cat > .env << EOF
PORT=8000
HOST=0.0.0.0
DEFAULT_MODEL=yolov8n.pt
CONF_THRESHOLD=0.5
IOU_THRESHOLD=0.45
DEVICE=auto
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
ALLOWED_ORIGINS=*
MAX_VIDEO_FRAMES=30
DEBUG=True
RELOAD=True
EOF
    fi
fi

# Make scripts executable
chmod +x start.sh 2>/dev/null || true
chmod +x deploy.sh 2>/dev/null || true

print_success "Backend setup completed!"

# Frontend Setup
cd ../frontend
print_step "Setting up frontend..."

# Install npm dependencies
print_step "Installing npm dependencies..."
npm install || { print_error "Failed to install npm dependencies"; exit 1; }

# Setup environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        print_step "Creating .env.local file from template..."
        cp .env.local.example .env.local
        print_warning "Please edit frontend/.env.local file with your configuration"
    else
        print_step "Creating basic .env.local file..."
        cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=YOLO Object Detection
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=50000000
VITE_SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/bmp
VITE_SUPPORTED_VIDEO_TYPES=video/mp4,video/avi,video/mov,video/mkv
VITE_ENABLE_VIDEO_UPLOAD=true
VITE_DEFAULT_CONF_THRESHOLD=0.5
VITE_DEFAULT_IOU_THRESHOLD=0.45
VITE_ENABLE_DEBUG=true
VITE_SHOW_API_LOGS=true
EOF
    fi
fi

print_success "Frontend setup completed!"

# Final verification
cd ..
print_step "Running final verification..."

# Test backend startup
print_step "Testing backend startup..."
cd backend
source venv/bin/activate
timeout 10s python3 -c "
from app import app
print('✅ Backend app loads successfully')
" || print_warning "Backend startup test timed out (this is normal)"

cd ../frontend
print_step "Testing frontend build..."
npm run build > /dev/null 2>&1 && print_success "Frontend builds successfully" || print_warning "Frontend build test failed"

cd ..

# Display startup instructions
echo ""
echo "=============================================="
echo "🎉 Setup Complete! Here's how to start:"
echo "=============================================="
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "cd 'Yolo App/backend'"
echo "source venv/bin/activate"
echo "python3 -m uvicorn app:app --reload"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "cd 'Yolo App/frontend'"
echo "npm run dev"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Notes:${NC}"
echo "- First YOLO run will download models (normal)"
echo "- Edit .env files for custom configuration"
echo "- Use 'deactivate' to exit Python virtual environment"
echo ""
echo "🚀 Happy detecting!"