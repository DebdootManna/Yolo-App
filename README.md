# YOLO Object Detection Full-Stack Application

A modern, full-stack web application for AI-powered object detection using YOLO (You Only Look Once) models. Built with React frontend and FastAPI backend for real-time object detection in images and videos.

![YOLO Detection Demo](https://img.shields.io/badge/Demo-Live-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)
![License](https://img.shields.io/badge/License-MIT-purple)

## 🚀 Features

### 🤖 AI-Powered Detection
- **Multiple YOLO Models**: Support for YOLOv8, YOLOv9, YOLOv10, and YOLOv11
- **80+ Object Classes**: Detect people, vehicles, animals, and everyday objects
- **Real-time Processing**: Fast inference with GPU acceleration support
- **Confidence Scoring**: Accurate confidence scores for each detection

### 📁 Multi-Format Support
- **Images**: JPEG, PNG, WebP, BMP
- **Videos**: MP4, AVI, MOV, MKV
- **Batch Processing**: Handle multiple files efficiently
- **Preview**: Real-time preview before processing

### ⚙️ Customizable Settings
- **Detection Thresholds**: Adjustable confidence and IoU thresholds
- **Class Filtering**: Select specific object classes to detect
- **Video Processing**: Configurable frame limits for demo purposes
- **Export Options**: JSON and CSV export for detection data

### 🌐 Modern Web Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Updates**: Progress tracking and status indicators
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend │    │  YOLO Models    │
│                 │    │                  │    │                 │
│ • File Upload   │◄──►│ • REST API       │◄──►│ • YOLOv8/9/10/11│
│ • Results View  │    │ • Obj Detection  │    │ • GPU/CPU       │
│ • Settings UI   │    │ • File Processing│    │ • Pre-trained   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   Vercel        │    │ Railway/Render   │
│   (Frontend)    │    │   (Backend)      │
└─────────────────┘    └──────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Dropzone** - File upload interface
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **Ultralytics YOLO** - State-of-the-art object detection
- **OpenCV** - Computer vision library
- **PyTorch** - Machine learning framework
- **Uvicorn** - ASGI web server
- **Pydantic** - Data validation and settings

### Deployment
- **Vercel** - Frontend hosting and deployment
- **Railway/Render** - Backend deployment options
- **Docker** - Containerization support
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **Python** 3.9+ and pip
- **Git** for version control

### 🖥️ Local Development Setup

#### 1. Clone the Repository
```bash
git clone <https://github.com/DebdootManna/Yolo-App>
cd "Yolo-App"
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Backend .env Configuration:**
```env
# Backend Configuration
PORT=8000
HOST=0.0.0.0

# Model Configuration
DEFAULT_MODEL=yolov8n.pt
CONF_THRESHOLD=0.5
IOU_THRESHOLD=0.45
DEVICE=auto

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs

# CORS Configuration
ALLOWED_ORIGINS=*

# Video Processing Configuration
MAX_VIDEO_FRAMES=30
MAX_VIDEO_SIZE=100MB

# Development
DEBUG=True
RELOAD=True
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local file
nano .env.local
```

**Frontend .env.local Configuration:**
```env
# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=YOLO Object Detection
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=50000000
VITE_SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/bmp
VITE_SUPPORTED_VIDEO_TYPES=video/mp4,video/avi,video/mov,video/mkv

# Feature Flags
VITE_ENABLE_VIDEO_UPLOAD=true
VITE_ENABLE_BATCH_PROCESSING=true

# UI Configuration
VITE_DEFAULT_CONF_THRESHOLD=0.5
VITE_DEFAULT_IOU_THRESHOLD=0.45

# Development
VITE_ENABLE_DEBUG=true
VITE_SHOW_API_LOGS=true
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Prepare for Deployment:**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts to configure your deployment
```

3. **Environment Variables in Vercel:**
- Set production environment variables in Vercel dashboard
- Update `VITE_API_BASE_URL` to your backend URL

### Backend Deployment Options

#### Option 1: Railway
1. **Create Railway Account** at https://railway.app
2. **Connect GitHub Repository**
3. **Configure Environment Variables**
4. **Deploy**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 2: Render
1. **Create Render Account** at https://render.com
2. **Connect GitHub Repository**
3. **Configure Build and Start Commands:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Option 3: Docker Deployment
```bash
cd backend

# Build Docker image
docker build -t yolo-detection-api .

# Run container
docker run -d -p 8000:8000 --name yolo-api yolo-detection-api
```

#### Option 4: Manual VPS Deployment
```bash
# On your server
git clone <repository-url>
cd "Yolo App/backend"

# Install dependencies
pip install -r requirements.txt

# Run with production settings
chmod +x start.sh
./start.sh
```

## 📖 API Documentation

### Health Check
```http
GET /health
```

### Predict Image
```http
POST /predict
Content-Type: multipart/form-data

Parameters:
- file: Image file
- conf_threshold: Confidence threshold (0.0-1.0)
- iou_threshold: IoU threshold (0.0-1.0)
- selected_classes: JSON array of class names (optional)
```

### Predict Video
```http
POST /predict_video
Content-Type: multipart/form-data

Parameters:
- file: Video file
- conf_threshold: Confidence threshold (0.0-1.0)
- iou_threshold: IoU threshold (0.0-1.0)
- max_frames: Maximum frames to process
- selected_classes: JSON array of class names (optional)
```

### Get Classes
```http
GET /classes
```

### Update Model
```http
POST /update_model
Content-Type: multipart/form-data

Parameters:
- model_name: YOLO model name
- conf_threshold: Confidence threshold
- iou_threshold: IoU threshold
```

### Cleanup Files
```http
DELETE /cleanup/{file_id}
```

## 🎯 Usage Guide

### 1. Upload File
- Drag and drop an image or video file
- Or click to browse and select a file
- Supported formats: JPG, PNG, WebP, BMP (images), MP4, AVI, MOV, MKV (videos)

### 2. Configure Settings (Optional)
- **Confidence Threshold**: Minimum confidence for detections (0-100%)
- **IoU Threshold**: Non-maximum suppression threshold (0-100%)
- **Class Filter**: Select specific object classes to detect
- **Max Frames**: Limit video processing for faster results

### 3. Run Detection
- Click "Start Detection" to begin processing
- View real-time progress during upload and processing
- Results will be displayed automatically upon completion

### 4. View Results
- **Detection Image/Video**: Annotated output with bounding boxes
- **Detection List**: Detailed list of all detected objects
- **Statistics**: Summary of detection results
- **Export Options**: Download results as JSON or CSV

## 🧪 Supported Object Classes

The application can detect 80+ object classes from the COCO dataset:

**People & Animals:** Person, Bird, Cat, Dog, Horse, Sheep, Cow, Elephant, Bear, Zebra, Giraffe

**Vehicles:** Car, Motorcycle, Airplane, Bus, Train, Truck, Boat, Bicycle

**Everyday Objects:** Chair, Couch, Bed, Dining Table, Toilet, TV, Laptop, Cell Phone, Book, Clock

**Food & Kitchen:** Bottle, Cup, Fork, Knife, Spoon, Bowl, Banana, Apple, Sandwich, Pizza

**Sports & Recreation:** Sports Ball, Kite, Baseball Bat, Skateboard, Surfboard, Tennis Racket

**And many more...** See the full list in the application's About page.

## 🔧 Configuration

### Backend Configuration
The backend can be configured through environment variables:

- `DEFAULT_MODEL`: YOLO model to use (default: yolov8n.pt)
- `CONF_THRESHOLD`: Default confidence threshold (default: 0.5)
- `IOU_THRESHOLD`: Default IoU threshold (default: 0.45)
- `MAX_FILE_SIZE`: Maximum upload file size (default: 50MB)
- `MAX_VIDEO_FRAMES`: Maximum video frames to process (default: 30)

### Frontend Configuration
The frontend can be configured through environment variables:

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_MAX_FILE_SIZE`: Maximum file size for uploads
- `VITE_DEFAULT_CONF_THRESHOLD`: Default confidence threshold
- `VITE_ENABLE_VIDEO_UPLOAD`: Enable/disable video upload

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **Model Loading Errors**
   - Ensure you have sufficient memory (GPU/CPU)
   - Check if PyTorch is properly installed
   - Verify CUDA installation for GPU support

2. **File Upload Errors**
   - Check file size limits
   - Verify supported file formats
   - Ensure sufficient disk space

3. **CORS Errors**
   - Update CORS settings in backend
   - Check frontend API URL configuration

#### Frontend Issues
1. **API Connection Errors**
   - Verify backend is running
   - Check API URL in environment variables
   - Confirm network connectivity

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Performance Optimization

1. **GPU Acceleration**
   - Install CUDA for NVIDIA GPUs
   - Use appropriate PyTorch version
   - Monitor GPU memory usage

2. **File Size Optimization**
   - Compress large images/videos before upload
   - Use appropriate file formats
   - Implement chunked upload for large files

3. **Model Selection**
   - Use smaller models (YOLOv8n) for faster inference
   - Use larger models (YOLOv8x) for higher accuracy
   - Balance speed vs accuracy based on requirements

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ultralytics** - For the amazing YOLO models
- **FastAPI** - For the excellent web framework
- **React Team** - For the powerful UI library
- **Vercel** - For seamless frontend deployment
- **Railway/Render** - For reliable backend hosting

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Documentation** - Most common issues are covered here
2. **Search Existing Issues** - Someone might have already solved your problem
3. **Create New Issue** - Provide detailed information about your problem
4. **Join Community** - Connect with other users and developers

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time webcam detection
- [ ] Batch file processing
- [ ] Custom model training interface
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and authentication
- [ ] Mobile app development
- [ ] Integration with cloud storage services

### Performance Improvements
- [ ] Model optimization and quantization
- [ ] Caching mechanisms
- [ ] Background job processing
- [ ] Horizontal scaling support

---

**Built with ❤️ by the Debdoot Manna**

For more information, visit our [website](https://your-website.com) or follow us on [GitHub](https://github.com/your-username/yolo-detection).
