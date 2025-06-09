# YOLO Detection - Quick Start Guide

Welcome to the YOLO Object Detection full-stack application! This guide will get you up and running in minutes.

## 🚀 Quick Setup (5 Minutes)

### 1. Prerequisites Check
```bash
# Check if you have the required tools
node --version    # Should be 16+
python --version  # Should be 3.9+
git --version
```

### 2. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd "Yolo App"

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup (in new terminal)
cd frontend
npm install
```

### 3. Environment Configuration
```bash
# Backend - Copy and edit .env
cp backend/.env.example backend/.env

# Frontend - Copy and edit .env.local
cp frontend/.env.local.example frontend/.env.local
```

### 4. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn app:app --reload

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 5. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 First Detection

1. **Upload a File**: Drag and drop an image or video
2. **Configure (Optional)**: Adjust confidence threshold and select classes
3. **Run Detection**: Click "Start Detection"
4. **View Results**: See detected objects with bounding boxes

## 📁 Project Structure

```
Yolo App/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── vercel.json         # Vercel deployment config
├── backend/                # FastAPI backend
│   ├── app.py              # Main API application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   └── deploy.sh           # Deployment script
├── app.py                  # Original PyQt5 application
├── custom_best_ptfile.py   # Custom model handler
├── yolov8n.pt              # Pre-trained YOLO model
└── README.md               # Comprehensive documentation
```

## 🔧 Configuration

### Backend Environment (.env)
```env
PORT=8000
HOST=0.0.0.0
DEFAULT_MODEL=yolov8n.pt
CONF_THRESHOLD=0.5
IOU_THRESHOLD=0.45
DEVICE=auto
MAX_FILE_SIZE=50MB
DEBUG=True
```

### Frontend Environment (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MAX_FILE_SIZE=50000000
VITE_DEFAULT_CONF_THRESHOLD=0.5
VITE_DEFAULT_IOU_THRESHOLD=0.45
VITE_ENABLE_DEBUG=true
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway)
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

### Alternative: Docker
```bash
cd backend
docker build -t yolo-api .
docker run -p 8000:8000 yolo-api
```

## 📱 Supported Formats

### Images
- JPEG, JPG
- PNG
- WebP
- BMP

### Videos
- MP4
- AVI
- MOV
- MKV

### Object Classes (80+)
- **People**: Person
- **Vehicles**: Car, Truck, Bus, Motorcycle, Bicycle
- **Animals**: Dog, Cat, Bird, Horse, Cow, Sheep
- **Objects**: Chair, Table, Laptop, Phone, Book, Bottle
- **And many more...**

## 🛠️ Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Check model file
ls -la *.pt
```

**Frontend build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 16+
```

**API connection errors:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check CORS settings
# Update VITE_API_BASE_URL in .env.local
```

**Memory issues:**
```bash
# For large files, increase limits
# Edit MAX_FILE_SIZE in .env
# Use smaller YOLO models (yolov8n vs yolov8x)
```

### Performance Tips

1. **GPU Acceleration**: Install CUDA for faster processing
2. **Model Selection**: Use yolov8n for speed, yolov8x for accuracy
3. **File Size**: Compress large videos before upload
4. **Thresholds**: Lower confidence threshold finds more objects

## 🎨 Customization

### Add New Models
```python
# In backend/app.py
detector = YOLODetector("your-model.pt")
```

### Modify UI Theme
```css
/* In frontend/src/index.css */
:root {
  --primary-color: #your-color;
}
```

### Add Custom Classes
```python
# Update COCO_CLASSES in backend/app.py
COCO_CLASSES = ["your", "custom", "classes"]
```

## 📊 API Endpoints

### Health Check
```bash
GET /health
```

### Image Detection
```bash
POST /predict
Content-Type: multipart/form-data
Body: file, conf_threshold, iou_threshold, selected_classes
```

### Video Detection
```bash
POST /predict_video
Content-Type: multipart/form-data
Body: file, conf_threshold, iou_threshold, max_frames
```

### Get Classes
```bash
GET /classes
```

## 🔐 Security Notes

- **File Upload**: Size limits enforced
- **CORS**: Configure for production domains
- **Environment**: Use environment variables for secrets
- **Validation**: Input validation on both frontend and backend

## 📞 Need Help?

1. **Check Documentation**: README.md has detailed info
2. **API Docs**: Visit http://localhost:8000/docs
3. **Issues**: Check GitHub issues
4. **Community**: Join our Discord/Slack

## 🎯 Next Steps

- [ ] Try different YOLO models
- [ ] Experiment with video detection
- [ ] Deploy to production
- [ ] Customize the UI
- [ ] Add new features
- [ ] Integrate with your projects

## 📈 Performance Benchmarks

| Model | Speed (ms) | Accuracy | Use Case |
|-------|------------|----------|----------|
| YOLOv8n | ~50ms | Good | Real-time |
| YOLOv8s | ~100ms | Better | Balanced |
| YOLOv8m | ~200ms | High | Quality |
| YOLOv8l | ~300ms | Higher | Precision |
| YOLOv8x | ~500ms | Highest | Research |

*Times approximate on modern CPU. GPU acceleration significantly faster.*

---

🎉 **Congratulations!** You now have a fully functional YOLO detection system.

**Happy Detecting!** 🚀🎯