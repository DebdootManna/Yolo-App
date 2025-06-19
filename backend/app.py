import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import os
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import uuid
from datetime import datetime
import json
from typing import Optional, List
import shutil
from pathlib import Path
import base64
from io import BytesIO
from PIL import Image
import asyncio
import threading
import time

app = FastAPI(title="YOLO Detection API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories if they don't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("labels", exist_ok=True)
os.makedirs("batch", exist_ok=True)

# Mount static files
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/labels", StaticFiles(directory="labels"), name="labels")
app.mount("/batch", StaticFiles(directory="batch"), name="batch")

# Global variables for model management
current_model = None
model_path = None
processing_status = {}
batch_status = {}

# Default COCO class names (80 classes)
COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
    'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
    'hair drier', 'toothbrush'
]

class YOLODetector:
    def __init__(self, model_name="yolov8n.pt", conf_threshold=0.5, iou_threshold=0.45):
        self.model_name = model_name
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.model = None
        self.class_names = COCO_CLASSES
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()

    def load_model(self):
        try:
            print(f"Loading YOLO model: {self.model_name}")

            # Check if model file exists locally
            if os.path.exists(self.model_name):
                self.model = YOLO(self.model_name)
                print(f"Loaded custom model from: {self.model_name}")
            else:
                # Use predefined model (will download if not exists)
                self.model = YOLO(self.model_name)
                print(f"Loaded predefined model: {self.model_name}")

            # Set model parameters
            self.model.conf = self.conf_threshold
            self.model.iou = self.iou_threshold

            print(f"Model loaded successfully on {self.device}")
            print(f"Available classes: {len(self.class_names)}")

        except Exception as e:
            print(f"Error loading model: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

    def detect(self, image, selected_classes=None):
        if self.model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")

        try:
            # Perform inference
            results = self.model(image, verbose=False)

            # Process results
            detections = []
            annotated_image = image.copy()
            yolo_labels = []  # For YOLO format labels

            # Get image dimensions for YOLO format
            img_height, img_width = image.shape[:2]

            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i in range(len(boxes)):
                        # Extract detection data
                        x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy() if boxes.xyxy[i].is_cuda else boxes.xyxy[i].numpy()
                        conf = boxes.conf[i].cpu().item() if boxes.conf[i].is_cuda else boxes.conf[i].item()
                        cls = int(boxes.cls[i].cpu().item() if boxes.cls[i].is_cuda else boxes.cls[i].item())

                        # Get class name
                        class_name = self.class_names[cls] if cls < len(self.class_names) else f"class_{cls}"

                        # Filter by selected classes if specified
                        if selected_classes and class_name not in selected_classes:
                            continue

                        # Add detection to list
                        detection = {
                            "class": class_name,
                            "confidence": float(conf),
                            "bbox": [float(x1), float(y1), float(x2), float(y2)]
                        }
                        detections.append(detection)

                        # Create YOLO format label (class_id x_center y_center width height)
                        x_center = ((x1 + x2) / 2) / img_width
                        y_center = ((y1 + y2) / 2) / img_height
                        width = (x2 - x1) / img_width
                        height = (y2 - y1) / img_height
                        yolo_labels.append(f"{cls} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")

                        # Draw bounding box and label
                        cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                        # Draw label
                        label = f"{class_name}: {conf:.2f}"
                        text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                        cv2.rectangle(annotated_image, (int(x1), int(y1) - text_size[1] - 10),
                                    (int(x1) + text_size[0], int(y1)), (0, 255, 0), -1)
                        cv2.putText(annotated_image, label, (int(x1), int(y1) - 5),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

            return detections, annotated_image, yolo_labels

        except Exception as e:
            print(f"Detection error: {e}")
            raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

# Initialize detector
detector = YOLODetector()

@app.get("/")
async def root():
    return {"message": "YOLO Detection API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": detector.model is not None,
        "device": detector.device,
        "model_name": detector.model_name,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/classes")
async def get_classes():
    return {
        "classes": COCO_CLASSES,
        "total": len(COCO_CLASSES)
    }

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45),
    selected_classes: Optional[str] = Form(None)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Update processing status
        file_id = str(uuid.uuid4())
        processing_status[file_id] = {"status": "processing", "progress": 0, "message": "Starting detection..."}

        # Update detector thresholds
        detector.conf_threshold = conf_threshold
        detector.iou_threshold = iou_threshold
        if detector.model:
            detector.model.conf = conf_threshold
            detector.model.iou = iou_threshold

        # Parse selected classes
        classes_list = None
        if selected_classes:
            try:
                classes_list = json.loads(selected_classes)
            except:
                classes_list = [cls.strip() for cls in selected_classes.split(',') if cls.strip()]

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        input_filename = f"{file_id}_input{file_extension}"
        output_filename = f"{file_id}_output{file_extension}"
        labels_filename = f"{file_id}_labels.txt"

        input_path = os.path.join("uploads", input_filename)
        output_path = os.path.join("outputs", output_filename)
        labels_path = os.path.join("labels", labels_filename)

        # Update status
        processing_status[file_id] = {"status": "processing", "progress": 20, "message": "Saving uploaded file..."}

        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Update status
        processing_status[file_id] = {"status": "processing", "progress": 40, "message": "Loading image..."}

        # Read and process image
        image = cv2.imread(input_path)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Update status
        processing_status[file_id] = {"status": "processing", "progress": 60, "message": "Running YOLO detection..."}

        # Perform detection
        detections, annotated_image, yolo_labels = detector.detect(image, classes_list)

        # Update status
        processing_status[file_id] = {"status": "processing", "progress": 80, "message": "Saving results..."}

        # Save annotated image
        cv2.imwrite(output_path, annotated_image)

        # Save YOLO format labels
        with open(labels_path, 'w') as f:
            f.write('\n'.join(yolo_labels))

        # Get image dimensions
        height, width = image.shape[:2]

        # Clean up input file
        os.remove(input_path)

        # Update status
        processing_status[file_id] = {"status": "completed", "progress": 100, "message": "Detection completed!"}

        return {
            "success": True,
            "file_id": file_id,
            "detections": detections,
            "total_detections": len(detections),
            "image_info": {
                "width": width,
                "height": height,
                "filename": file.filename
            },
            "output_image_url": f"/outputs/{output_filename}",
            "labels_txt_url": f"/labels/{labels_filename}",
            "parameters": {
                "conf_threshold": conf_threshold,
                "iou_threshold": iou_threshold,
                "selected_classes": classes_list
            },
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        processing_status[file_id] = {"status": "error", "progress": 0, "message": f"Error: {str(e)}"}
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict_video")
async def predict_video(
    file: UploadFile = File(...),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45),
    selected_classes: Optional[str] = Form(None),
    max_frames: int = Form(30)  # Limit frames for demo
):
    # Validate file type
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")

    try:
        # Update detector thresholds
        detector.conf_threshold = conf_threshold
        detector.iou_threshold = iou_threshold
        if detector.model:
            detector.model.conf = conf_threshold
            detector.model.iou = iou_threshold

        # Parse selected classes
        classes_list = None
        if selected_classes:
            try:
                classes_list = json.loads(selected_classes)
            except:
                classes_list = [cls.strip() for cls in selected_classes.split(',') if cls.strip()]

        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        input_filename = f"{file_id}_input{file_extension}"
        output_filename = f"{file_id}_output.mp4"

        input_path = os.path.join("uploads", input_filename)
        output_path = os.path.join("outputs", output_filename)

        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process video
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Invalid video file")

        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Limit frames for processing
        process_frames = min(max_frames, total_frames)

        # Video writer with better codec
        fourcc = cv2.VideoWriter_fourcc(*'H264')  # Better codec for web compatibility
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Check if video writer opened successfully
        if not out.isOpened():
            # Fallback to mp4v codec
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        all_detections = []
        frame_count = 0

        # Update processing status
        processing_status[file_id] = {"status": "processing", "progress": 60, "message": f"Processing video frames (0/{process_frames})..."}

        while frame_count < process_frames:
            ret, frame = cap.read()
            if not ret:
                break

            # Update progress
            progress = 60 + (frame_count / process_frames) * 30
            processing_status[file_id] = {"status": "processing", "progress": int(progress), "message": f"Processing frame {frame_count + 1}/{process_frames}..."}

            # Perform detection on frame
            detections, annotated_frame, _ = detector.detect(frame, classes_list)

            # Add frame info to detections
            frame_detections = {
                "frame": frame_count,
                "timestamp": frame_count / fps,
                "detections": detections
            }
            all_detections.append(frame_detections)

            # Ensure frame is properly formatted
            if annotated_frame is not None and annotated_frame.shape[:2] == (height, width):
                out.write(annotated_frame)
            else:
                # Resize frame if dimensions don't match
                annotated_frame = cv2.resize(annotated_frame, (width, height))
                out.write(annotated_frame)

            frame_count += 1

        cap.release()
        out.release()

        # Verify output file was created and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise HTTPException(status_code=500, detail="Failed to create output video")

        # Clean up input file
        os.remove(input_path)

        # Update final status
        processing_status[file_id] = {"status": "completed", "progress": 100, "message": "Video processing completed!"}

        return {
            "success": True,
            "file_id": file_id,
            "video_info": {
                "width": width,
                "height": height,
                "fps": fps,
                "total_frames": total_frames,
                "processed_frames": frame_count,
                "duration": total_frames / fps,
                "filename": file.filename
            },
            "detections": all_detections,
            "total_detections": sum(len(fd["detections"]) for fd in all_detections),
            "output_video_url": f"/outputs/{output_filename}",
            "parameters": {
                "conf_threshold": conf_threshold,
                "iou_threshold": iou_threshold,
                "selected_classes": classes_list,
                "max_frames": max_frames
            },
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Video prediction error: {e}")
        processing_status[file_id] = {"status": "error", "progress": 0, "message": f"Error: {str(e)}"}
        raise HTTPException(status_code=500, detail=f"Video prediction failed: {str(e)}")

@app.post("/predict_batch")
async def predict_batch(
    files: List[UploadFile] = File(...),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45),
    selected_classes: Optional[str] = Form(None)
):
    # Validate file types
    for file in files:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} must be an image")

    try:
        # Generate batch ID
        batch_id = str(uuid.uuid4())
        batch_status[batch_id] = {
            "status": "processing",
            "progress": 0,
            "message": "Starting batch processing...",
            "total_files": len(files),
            "processed_files": 0,
            "results": []
        }

        # Update detector thresholds
        detector.conf_threshold = conf_threshold
        detector.iou_threshold = iou_threshold
        if detector.model:
            detector.model.conf = conf_threshold
            detector.model.iou = iou_threshold

        # Parse selected classes
        classes_list = None
        if selected_classes:
            try:
                classes_list = json.loads(selected_classes)
            except:
                classes_list = [cls.strip() for cls in selected_classes.split(',') if cls.strip()]

        batch_results = []
        batch_dir = os.path.join("batch", batch_id)
        os.makedirs(batch_dir, exist_ok=True)

        for idx, file in enumerate(files):
            try:
                # Update progress
                progress = int((idx / len(files)) * 100)
                batch_status[batch_id]["progress"] = progress
                batch_status[batch_id]["message"] = f"Processing {file.filename} ({idx + 1}/{len(files)})"
                batch_status[batch_id]["processed_files"] = idx

                # Generate unique filename for this file
                file_id = f"{batch_id}_{idx}"
                file_extension = os.path.splitext(file.filename)[1]
                input_filename = f"{file_id}_input{file_extension}"
                output_filename = f"{file_id}_output{file_extension}"
                labels_filename = f"{file_id}_labels.txt"

                input_path = os.path.join("uploads", input_filename)
                output_path = os.path.join(batch_dir, output_filename)
                labels_path = os.path.join(batch_dir, labels_filename)

                # Save uploaded file
                with open(input_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)

                # Read and process image
                image = cv2.imread(input_path)
                if image is None:
                    continue

                # Perform detection
                detections, annotated_image, yolo_labels = detector.detect(image, classes_list)

                # Save annotated image
                cv2.imwrite(output_path, annotated_image)

                # Save YOLO format labels
                with open(labels_path, 'w') as f:
                    f.write('\n'.join(yolo_labels))

                # Get image dimensions
                height, width = image.shape[:2]

                # Clean up input file
                os.remove(input_path)

                result = {
                    "file_id": file_id,
                    "filename": file.filename,
                    "detections": detections,
                    "total_detections": len(detections),
                    "image_info": {
                        "width": width,
                        "height": height
                    },
                    "output_image_url": f"/batch/{batch_id}/{output_filename}",
                    "labels_txt_url": f"/batch/{batch_id}/{labels_filename}"
                }

                batch_results.append(result)
                batch_status[batch_id]["results"].append(result)

            except Exception as e:
                print(f"Error processing {file.filename}: {e}")
                continue

        # Update final status
        batch_status[batch_id]["status"] = "completed"
        batch_status[batch_id]["progress"] = 100
        batch_status[batch_id]["message"] = "Batch processing completed!"
        batch_status[batch_id]["processed_files"] = len(files)

        return {
            "success": True,
            "batch_id": batch_id,
            "total_files": len(files),
            "processed_files": len(batch_results),
            "results": batch_results,
            "batch_url": f"/batch/{batch_id}",
            "parameters": {
                "conf_threshold": conf_threshold,
                "iou_threshold": iou_threshold,
                "selected_classes": classes_list
            },
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Batch prediction error: {e}")
        if batch_id in batch_status:
            batch_status[batch_id]["status"] = "error"
            batch_status[batch_id]["message"] = f"Error: {str(e)}"
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    if file_id in processing_status:
        return processing_status[file_id]
    elif file_id in batch_status:
        return batch_status[file_id]
    else:
        raise HTTPException(status_code=404, detail="File ID not found")

@app.get("/batch_status/{batch_id}")
async def get_batch_status(batch_id: str):
    if batch_id in batch_status:
        return batch_status[batch_id]
    else:
        raise HTTPException(status_code=404, detail="Batch ID not found")

@app.delete("/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    try:
        # Remove output files for this file_id
        output_dir = "outputs"
        removed_files = []

        for filename in os.listdir(output_dir):
            if filename.startswith(file_id):
                file_path = os.path.join(output_dir, filename)
                os.remove(file_path)
                removed_files.append(filename)

        return {
            "success": True,
            "file_id": file_id,
            "removed_files": removed_files,
            "message": f"Cleaned up {len(removed_files)} files"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@app.post("/update_model")
async def update_model(
    model_name: str = Form("yolov8n.pt"),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45)
):
    try:
        global detector
        # Check if model exists in models/ directory
        model_path = os.path.join("models", model_name)
        classes_path = os.path.join("models", os.path.splitext(model_name)[0] + ".txt")
        if os.path.exists(model_path) and os.path.exists(classes_path):
            # Load custom classes
            with open(classes_path, "r") as f:
                custom_classes = [line.strip() for line in f if line.strip()]
            class CustomYOLODetector(YOLODetector):
                def __init__(self, model_name, conf_threshold=0.5, iou_threshold=0.45, class_names=None):
                    self.model_name = model_name
                    self.conf_threshold = conf_threshold
                    self.iou_threshold = iou_threshold
                    self.model = None
                    self.class_names = class_names if class_names else COCO_CLASSES
                    self.device = "cuda" if torch.cuda.is_available() else "cpu"
                    self.load_model()
            detector = CustomYOLODetector(model_path, conf_threshold, iou_threshold, class_names=custom_classes)
            used_classes = custom_classes
            used_model = model_path
        else:
            # Use predefined model and COCO classes
            detector = YOLODetector(model_name, conf_threshold, iou_threshold)
            used_classes = COCO_CLASSES
            used_model = model_name
        return {
            "success": True,
            "model_name": model_name,
            "conf_threshold": conf_threshold,
            "iou_threshold": iou_threshold,
            "device": detector.device,
            "total_classes": len(used_classes),
            "message": "Model updated successfully",
            "custom_model": os.path.exists(model_path) and os.path.exists(classes_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model update failed: {str(e)}")

@app.post("/upload_model")
async def upload_model(
    model_file: UploadFile = File(...),
    classes_file: UploadFile = File(...)
):
    # Validate file types
    if not model_file.filename.endswith(".pt"):
        raise HTTPException(status_code=400, detail="Model file must be a .pt file")
    if not classes_file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Classes file must be a .txt file")

    # Save model file
    model_save_path = os.path.join("models", model_file.filename)
    with open(model_save_path, "wb") as f:
        shutil.copyfileobj(model_file.file, f)

    # Save classes file
    classes_save_path = os.path.join("models", classes_file.filename)
    with open(classes_save_path, "wb") as f:
        shutil.copyfileobj(classes_file.file, f)

    # Read class names from classes.txt
    try:
        with open(classes_save_path, "r") as f:
            custom_classes = [line.strip() for line in f if line.strip()]
        if not custom_classes:
            raise ValueError("No classes found in classes.txt")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read classes.txt: {str(e)}")

    # Update detector to use the new model and classes
    global detector
    class CustomYOLODetector(YOLODetector):
        def __init__(self, model_name, conf_threshold=0.5, iou_threshold=0.45, class_names=None):
            self.model_name = model_name
            self.conf_threshold = conf_threshold
            self.iou_threshold = iou_threshold
            self.model = None
            self.class_names = class_names if class_names else COCO_CLASSES
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.load_model()
    detector = CustomYOLODetector(model_save_path, class_names=custom_classes)

    return {
        "success": True,
        "model_name": model_file.filename,
        "classes_file": classes_file.filename,
        "total_classes": len(custom_classes),
        "message": "Custom model and classes uploaded and loaded successfully."
    }

@app.post("/predict_stream")
async def predict_stream(
    stream_url: str = Form(...),
    conf_threshold: float = Form(0.5),
    iou_threshold: float = Form(0.45),
    max_frames: int = Form(10)
):
    try:
        # Update detector thresholds
        detector.conf_threshold = conf_threshold
        detector.iou_threshold = iou_threshold
        if detector.model:
            detector.model.conf = conf_threshold
            detector.model.iou = iou_threshold

        cap = cv2.VideoCapture(stream_url)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open stream. Check the URL and network.")

        frame_detections = []
        frame_count = 0
        while frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            detections, _ = detector.detect(frame)
            frame_detections.append({
                "frame": frame_count,
                "detections": detections
            })
            frame_count += 1
        cap.release()

        return {
            "success": True,
            "stream_url": stream_url,
            "frames_processed": frame_count,
            "detections_per_frame": frame_detections,
            "total_detections": sum(len(fd["detections"]) for fd in frame_detections),
            "parameters": {
                "conf_threshold": conf_threshold,
                "iou_threshold": iou_threshold,
                "max_frames": max_frames
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Stream prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
