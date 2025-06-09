# Manual Setup Instructions for YOLO Detection App

## 🚀 Quick Manual Setup for macOS with Python 3.13

Since you're running Python 3.13.4, some package versions may not be compatible. Here's a manual setup approach that should work reliably.

## 📋 Prerequisites Verified
- ✅ Node.js: v24.1.0
- ✅ npm: 11.3.0  
- ✅ Python: 3.13.4
- ✅ pip: 25.1.1
- ✅ Git: 2.49.0

## 🔧 Backend Setup (Manual)

### Step 1: Create Virtual Environment
```bash
cd "Yolo App/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

### Step 2: Install Dependencies (One by One)
Install packages individually to handle version conflicts:

```bash
# Core FastAPI
pip install fastapi
pip install "uvicorn[standard]"
pip install python-multipart
pip install pydantic

# Essential utilities
pip install python-dotenv
pip install aiofiles
pip install requests

# Computer Vision (install in order)
pip install numpy
pip install Pillow
pip install opencv-python

# PyTorch (latest compatible version)
pip install torch torchvision

# YOLO (after PyTorch)
pip install ultralytics

# Additional utilities
pip install anyio
pip install httpx
```

### Step 3: Test Installation
```bash
python3 -c "
import fastapi
import uvicorn
import torch
import cv2
import ultralytics
print('✅ All core dependencies imported successfully!')
print(f'PyTorch version: {torch.__version__}')
print(f'OpenCV version: {cv2.__version__}')
"
```

### Step 4: Create Environment File
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=8000
HOST=0.0.0.0
DEFAULT_MODEL=yolov8n.pt
CONF_THRESHOLD=0.5
IOU_THRESHOLD=0.45
DEVICE=auto
MAX_FILE_SIZE=50MB
DEBUG=True
RELOAD=True
```

### Step 5: Create Required Directories
```bash
mkdir -p uploads outputs models logs
```

## 🎨 Frontend Setup

### Step 1: Install Dependencies
```bash
cd "../frontend"
npm install
```

### Step 2: Create Environment File
```bash
cp .env.local.example .env.local
```

Edit `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=YOLO Object Detection
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=50000000
VITE_ENABLE_DEBUG=true
VITE_SHOW_API_LOGS=true
```

## 🚀 Running the Application

### Terminal 1: Start Backend
```bash
cd "Yolo App/backend"
source venv/bin/activate
python3 -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
```

### Terminal 2: Start Frontend
```bash
cd "Yolo App/frontend" 
npm run dev
```

Expected output:
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔍 Troubleshooting

### If PyTorch Installation Fails:
```bash
# Try CPU-only version
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### If OpenCV Installation Fails:
```bash
# Try headless version
pip install opencv-python-headless
```

### If Ultralytics Installation Fails:
```bash
# Install with specific constraints
pip install "ultralytics>=8.0.0" --no-deps
pip install PyYAML requests matplotlib seaborn tqdm psutil
```

### If Frontend Build Fails:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🧪 Testing the Setup

### Test Backend API:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu",
  "model_name": "yolov8n.pt"
}
```

### Test File Upload:
1. Open http://localhost:3000
2. Drag and drop an image file
3. Click "Start Detection"
4. View results

## 📦 Creating Your Own Requirements File

If you want to create a requirements.txt with your exact installed versions:

```bash
cd "Yolo App/backend"
source venv/bin/activate
pip freeze > requirements-working.txt
```

## 🔄 Alternative: Docker Setup

If manual setup doesn't work, try Docker:

```bash
cd "Yolo App/backend"
docker build -t yolo-api .
docker run -p 8000:8000 yolo-api
```

## ⚡ Quick Verification Commands

### Backend Health Check:
```bash
cd "Yolo App/backend"
source venv/bin/activate
python3 -c "
from app import app
print('✅ Backend app imports successfully')
"
```

### Frontend Build Test:
```bash
cd "Yolo App/frontend"
npm run build
echo "✅ Frontend builds successfully"
```

## 🎯 What Each Service Does

### Backend (Port 8000):
- Loads YOLO models
- Processes uploaded images/videos
- Returns detection results as JSON
- Serves processed images with bounding boxes

### Frontend (Port 3000):
- Provides user interface
- Handles file uploads
- Displays detection results
- Manages user settings

## 🚨 Common Issues and Solutions

1. **"Module not found" errors**: Ensure virtual environment is activated
2. **CORS errors**: Check that ALLOWED_ORIGINS=* in backend .env
3. **File upload fails**: Check MAX_FILE_SIZE settings
4. **Slow detection**: First run downloads YOLO model (normal)
5. **Memory errors**: Use smaller YOLO model (yolov8n instead of yolov8x)

## 📝 Notes for Your Environment

- Python 3.13 is very new, so some packages might not have pre-built wheels
- Installing from source might take longer
- Consider using Python 3.11 or 3.12 if you encounter persistent issues
- The app will work with CPU-only PyTorch for testing

## ✅ Success Indicators

You'll know setup is complete when:
- Backend shows "Application startup complete" 
- Frontend shows Vite dev server running
- http://localhost:8000/health returns JSON
- http://localhost:3000 shows the upload interface
- API docs are accessible at http://localhost:8000/docs

## 🎉 Ready to Use!

Once both services are running, you can:
1. Upload images or videos
2. Adjust detection settings
3. View results with bounding boxes
4. Export detection data
5. Download processed files