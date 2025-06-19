import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Settings,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Trash2,
  Camera,
  FileText,
  Zap,
  Target,
} from "lucide-react";

// Services
import { apiService } from "../services/api";

// Utils
import { fileUtils, validationUtils, uiUtils } from "../utils/helpers";

// Components
import LivestreamModal from "../components/LivestreamModal";

const HomePage = ({ apiHealth }) => {
  const navigate = useNavigate();

  // State management
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Detection settings
  const [confThreshold, setConfThreshold] = useState(
    parseFloat(import.meta.env.VITE_DEFAULT_CONF_THRESHOLD) || 0.5,
  );
  const [iouThreshold, setIouThreshold] = useState(
    parseFloat(import.meta.env.VITE_DEFAULT_IOU_THRESHOLD) || 0.45,
  );
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [maxFrames, setMaxFrames] = useState(30);

  // Model selection and custom model upload
  const pretrainedModels = [
    "yolov8n.pt",
    "yolov8s.pt",
    "yolov8m.pt",
    "yolov8l.pt",
    "yolov8x.pt",
    "yolov9c.pt",
    "yolov9e.pt",
    "yolov10n.pt",
    "yolov10s.pt",
    "yolov10m.pt",
    "yolov11n.pt",
    "yolov11s.pt",
    "yolov11m.pt",
  ];
  const [selectedModel, setSelectedModel] = useState("yolov8n.pt");
  const [customModelFile, setCustomModelFile] = useState(null);
  const [customClassesFile, setCustomClassesFile] = useState(null);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  // Livestream detection
  const [livestreamUrl, setLivestreamUrl] = useState("");
  const [isProcessingStream, setIsProcessingStream] = useState(false);
  const [streamResults, setStreamResults] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [showLivestreamModal, setShowLivestreamModal] = useState(false);

  // Load available classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesData = await apiService.getClasses();
        setAvailableClasses(classesData.classes || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
        toast.error("Failed to load detection classes");
      }
    };

    if (apiHealth?.status === "healthy") {
      loadClasses();
    }
  }, [apiHealth]);

  // File drop handler for batch upload
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        toast.error(`File rejected: ${rejection.errors[0]?.message}`);
        return;
      }

      if (acceptedFiles.length === 0) return;

      const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50000000; // 50MB
      const validFiles = [];
      const previews = [];

      // Process each file
      acceptedFiles.forEach((file) => {
        // Validate file size
        if (!fileUtils.validateFileSize(file, maxSize)) {
          toast.error(
            `File ${file.name} is too large. Maximum size: ${fileUtils.formatFileSize(maxSize)}`,
          );
          return;
        }

        validFiles.push(file);
        const previewUrl = fileUtils.createPreviewUrl(file);
        previews.push({
          file: file,
          url: previewUrl,
          type: fileUtils.isVideo(file) ? "video" : "image",
        });
      });

      if (validFiles.length === 0) return;

      // Set files and previews
      if (isBatchMode || validFiles.length > 1) {
        setSelectedFiles(validFiles);
        setFilePreviews(previews);
        setIsBatchMode(true);
      } else {
        setSelectedFiles([validFiles[0]]);
        setFilePreviews([previews[0]]);
        setIsBatchMode(false);
      }
      setResults(null);
      setError(null);

      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    },
    [isBatchMode],
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp", ".bmp"],
        "video/*": [".mp4", ".avi", ".mov", ".mkv"],
      },
      maxFiles: isBatchMode ? 20 : 1,
      multiple: isBatchMode,
    });

  // Remove selected files
  const removeFiles = () => {
    filePreviews.forEach((preview) => {
      if (preview.url) {
        fileUtils.revokePreviewUrl(preview.url);
      }
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setResults(null);
    setError(null);
    setUploadProgress(0);
    setProcessingStatus("");
  };

  // Remove single file from batch
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviews];

    // Revoke preview URL
    if (newPreviews[index]?.url) {
      fileUtils.revokePreviewUrl(newPreviews[index].url);
    }

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);

    if (newFiles.length === 0) {
      setIsBatchMode(false);
    }
  };

  // Poll for processing status
  const pollProcessingStatus = async (fileId, isBatch = false) => {
    const endpoint = isBatch ? `batch_status/${fileId}` : `status/${fileId}`;
    try {
      const status = await apiService.getProcessingStatus(endpoint);
      setProcessingStatus(status.message || "Processing...");
      setUploadProgress(status.progress || 0);

      if (status.status === "completed") {
        return true;
      } else if (status.status === "error") {
        throw new Error(status.message);
      }
      return false;
    } catch (err) {
      console.error("Status polling error:", err);
      return false;
    }
  };

  // Handle detection
  const handleDetection = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files first");
      return;
    }

    if (!apiHealth || apiHealth.status !== "healthy") {
      toast.error("API is not available");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);
    setProcessingStatus("Starting detection...");

    try {
      const options = {
        confThreshold,
        iouThreshold,
        selectedClasses: selectedClasses.length > 0 ? selectedClasses : null,
      };

      let result;

      if (isBatchMode && selectedFiles.length > 1) {
        // Batch processing
        result = await apiService.predictBatch(selectedFiles, options);

        // Poll for batch status
        const pollInterval = setInterval(async () => {
          const completed = await pollProcessingStatus(result.batch_id, true);
          if (completed) {
            clearInterval(pollInterval);
            setProcessingStatus("Batch processing completed!");
          }
        }, 1000);
      } else {
        // Single file processing
        const file = selectedFiles[0];
        if (fileUtils.isVideo(file)) {
          options.maxFrames = maxFrames;
          result = await apiService.predictVideoWithProgress(
            file,
            options,
            (progress) => {
              setUploadProgress(progress);
              setProcessingStatus(`Processing video... ${progress}%`);
            },
          );
        } else {
          result = await apiService.predictImageWithProgress(
            file,
            options,
            (progress) => {
              setUploadProgress(progress);
              setProcessingStatus(`Processing image... ${progress}%`);
            },
          );
        }
      }

      setResults(result);
      toast.success(
        `Detection completed! Found ${result.total_detections || result.processed_files} objects/files`,
      );

      // Navigate to results page with data
      navigate("/results", {
        state: {
          results: result,
          files: selectedFiles,
          filePreviews,
          isBatch: isBatchMode,
        },
      });
    } catch (err) {
      console.error("Detection failed:", err);
      setError(err);
      toast.error(err.message || "Detection failed");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingStatus("");
    }
  };

  // Handle custom model upload
  const handleCustomModelUpload = async () => {
    if (!customModelFile || !customClassesFile) {
      toast.error(
        "Please select both model file (.pt) and classes file (.txt)",
      );
      return;
    }

    try {
      setIsUploadingModel(true);
      await apiService.uploadCustomModel(customModelFile, customClassesFile);
      toast.success("Custom model uploaded successfully");
      setCustomModelFile(null);
      setCustomClassesFile(null);

      // Reload classes
      const classesData = await apiService.getClasses();
      setAvailableClasses(classesData.classes || []);
    } catch (err) {
      console.error("Custom model upload failed:", err);
      toast.error("Failed to upload custom model");
    } finally {
      setIsUploadingModel(false);
    }
  };

  // Handle livestream detection
  const handleLivestreamDetection = async (streamUrl, options = {}) => {
    if (!streamUrl.trim()) {
      toast.error("Please enter a valid stream URL");
      return;
    }

    setIsProcessingStream(true);
    setStreamError(null);
    setStreamResults(null);

    try {
      const detectionOptions = {
        confThreshold,
        iouThreshold,
        maxFrames: options.maxFrames || 10,
      };

      const result = await apiService.predictLivestream(
        streamUrl,
        detectionOptions,
      );
      setStreamResults(result);
      toast.success(
        `Stream processed! Analyzed ${result.frames_processed} frames`,
      );
    } catch (err) {
      console.error("Livestream detection failed:", err);
      setStreamError(err);
      toast.error(err.message || "Livestream detection failed");
    } finally {
      setIsProcessingStream(false);
    }
  };

  // Toggle class selection
  const toggleClass = (className) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className],
    );
  };

  // Select all classes
  const selectAllClasses = () => {
    setSelectedClasses([...availableClasses]);
  };

  // Clear class selection
  const clearClassSelection = () => {
    setSelectedClasses([]);
  };

  // Handle pretrained model selection
  const handlePretrainedModelChange = (e) => {
    setSelectedModel(e.target.value);
    setCustomModelFile(null);
    setCustomClassesFile(null);
  };

  // Handle custom model file input
  const handleCustomModelFile = (e) => {
    setCustomModelFile(e.target.files[0] || null);
  };
  const handleCustomClassesFile = (e) => {
    setCustomClassesFile(e.target.files[0] || null);
  };

  // Apply selected or uploaded model
  const handleApplyModel = async () => {
    setIsUploadingModel(true);
    try {
      if (customModelFile && customClassesFile) {
        // Upload custom model and classes
        await apiService.uploadModel(customModelFile, customClassesFile);
        toast.success("Custom model uploaded and loaded!");
        setSelectedModel(customModelFile.name);
      } else {
        // Switch to pretrained model
        await apiService.updateModel(
          selectedModel,
          confThreshold,
          iouThreshold,
        );
        toast.success(`Switched to model: ${selectedModel}`);
      }
      // Optionally reload classes
      const classesData = await apiService.getClasses();
      setAvailableClasses(classesData.classes || []);
      setSelectedClasses([]);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update model");
    } finally {
      setIsUploadingModel(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Object Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload an image or video to detect and analyze objects using
            state-of-the-art YOLO models. Support for 80+ object classes with
            real-time processing.
          </p>
        </div>

        {/* Model Selection & Upload Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Model Selection
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pretrained Model
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedModel}
                onChange={handlePretrainedModelChange}
                disabled={isUploadingModel}
              >
                {pretrainedModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Model (.pt)
                </label>
                <input
                  type="file"
                  accept=".pt"
                  onChange={handleCustomModelFile}
                  disabled={isUploadingModel}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classes File (classes.txt)
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleCustomClassesFile}
                  disabled={isUploadingModel}
                  className="w-full"
                />
              </div>
            </div>
            <button
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              onClick={handleApplyModel}
              disabled={
                isUploadingModel || (!customModelFile && !selectedModel)
              }
            >
              {isUploadingModel ? "Applying..." : "Apply Model"}
            </button>
          </div>
        </div>

        {/* Livestream Detection Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Livestream Detection
            </h2>
          </div>
          <div className="card-body space-y-4">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter livestream URL (e.g. rtsp://...)"
              value={livestreamUrl}
              onChange={(e) => setLivestreamUrl(e.target.value)}
              disabled={isProcessingStream}
            />
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              onClick={handleLivestreamDetection}
              disabled={isProcessingStream || !livestreamUrl}
            >
              {isProcessingStream ? "Detecting..." : "Detect Livestream"}
            </button>
            {isProcessingStream && (
              <div className="flex items-center space-x-2 text-primary-600">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Processing livestream...</span>
              </div>
            )}
            {streamError && (
              <div className="text-red-600 text-sm">{streamError}</div>
            )}
            {streamResults && (
              <div className="bg-gray-50 border rounded p-3 mt-2 text-sm max-h-64 overflow-auto">
                <div className="font-semibold mb-1">
                  Results (first {streamResults.frames_processed} frames):
                </div>
                <ul className="list-disc ml-5">
                  {streamResults.detections_per_frame.map((frame, idx) => (
                    <li key={idx}>
                      Frame {frame.frame}: {frame.detections.length} detections
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-gray-500">
                  Total detections: {streamResults.total_detections}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </h2>
              </div>
              <div className="card-body">
                {/* Upload Mode Toggle */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                      Upload Mode:
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsBatchMode(false)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          !isBatchMode
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Single File
                      </button>
                      <button
                        onClick={() => setIsBatchMode(true)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          isBatchMode
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Batch Upload
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLivestreamModal(true)}
                    className="btn-outline-secondary"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Live Stream
                  </button>
                </div>

                {selectedFiles.length === 0 ? (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? "dropzone-active" : ""} ${
                      isDragReject ? "dropzone-error" : ""
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isDragActive ? (
                          <Target className="w-8 h-8 text-primary-600" />
                        ) : (
                          <Upload className="w-8 h-8 text-primary-600" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isDragActive
                          ? "Drop your file here"
                          : "Upload Image or Video"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {isBatchMode
                          ? "Drag and drop multiple files here, or click to browse"
                          : "Drag and drop your file here, or click to browse"}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <ImageIcon className="w-4 h-4 mr-1" />
                          JPG, PNG, WebP
                        </span>
                        <span className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          MP4, AVI, MOV
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Maximum file size:{" "}
                        {fileUtils.formatFileSize(
                          parseInt(import.meta.env.VITE_MAX_FILE_SIZE) ||
                            50000000,
                        )}
                        {isBatchMode && (
                          <span className="block">
                            Maximum 20 files per batch
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Preview */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {isBatchMode ? (
                              <Target className="w-6 h-6 text-primary-600" />
                            ) : filePreviews[0]?.type === "image" ? (
                              <ImageIcon className="w-6 h-6 text-primary-600" />
                            ) : (
                              <Video className="w-6 h-6 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {isBatchMode
                                ? `${selectedFiles.length} files selected`
                                : selectedFiles[0]?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {isBatchMode
                                ? `Total size: ${fileUtils.formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}`
                                : `${fileUtils.formatFileSize(selectedFiles[0]?.size)} • ${selectedFiles[0]?.type}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFiles}
                          className="p-1 text-gray-400 hover:text-error-600 transition-colors"
                          title="Remove all files"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Batch File List */}
                      {isBatchMode && selectedFiles.length > 1 ? (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white rounded border"
                            >
                              <div className="flex items-center space-x-2">
                                {fileUtils.isImage(file) ? (
                                  <ImageIcon className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Video className="w-4 h-4 text-gray-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {fileUtils.formatFileSize(file.size)}
                                </span>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 text-gray-400 hover:text-error-600 transition-colors"
                                title="Remove file"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Single File Preview */
                        filePreviews[0]?.url && (
                          <div className="mt-4">
                            {filePreviews[0].type === "image" ? (
                              <img
                                src={filePreviews[0].url}
                                alt="Preview"
                                className="max-w-full h-64 object-contain rounded-lg mx-auto"
                              />
                            ) : (
                              <video
                                src={filePreviews[0].url}
                                controls
                                className="max-w-full h-64 rounded-lg mx-auto"
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    {/* Processing Status and Progress */}
                    {isProcessing && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 font-medium">
                                {processingStatus || "Processing..."}
                              </span>
                              <span className="text-gray-900 font-bold">
                                {uploadProgress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        {processingStatus && (
                          <p className="text-xs text-gray-600 text-center">
                            {processingStatus}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDetection}
                        disabled={
                          isProcessing ||
                          !apiHealth ||
                          apiHealth.status !== "healthy"
                        }
                        className="btn-primary flex-1 flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {processingStatus ? "Processing..." : "Starting..."}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {isBatchMode
                              ? "Start Batch Detection"
                              : "Start Detection"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn-outline-secondary"
                        title="Detection Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detection Settings */}
            {showSettings && selectedFiles.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detection Settings
                  </h3>
                </div>
                <div className="card-body space-y-6">
                  {/* Confidence Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Threshold: {(confThreshold * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={confThreshold}
                      onChange={(e) =>
                        setConfThreshold(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum confidence score for detections
                    </p>
                  </div>

                  {/* IoU Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IoU Threshold: {(iouThreshold * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={iouThreshold}
                      onChange={(e) =>
                        setIouThreshold(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Non-maximum suppression threshold
                    </p>
                  </div>

                  {/* Video Settings */}
                  {!isBatchMode && fileUtils.isVideo(selectedFiles[0]) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Frames to Process: {maxFrames}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={maxFrames}
                        onChange={(e) => setMaxFrames(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Limit frames for faster processing (demo purposes)
                      </p>
                    </div>
                  )}

                  {/* Class Filter */}
                  {availableClasses.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Filter Classes ({selectedClasses.length} selected)
                        </label>
                        <div className="space-x-2">
                          <button
                            onClick={selectAllClasses}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearClassSelection}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                        {availableClasses.map((className) => (
                          <label
                            key={className}
                            className="flex items-center space-x-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedClasses.includes(className)}
                              onChange={() => toggleClass(className)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-gray-700">{className}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Leave empty to detect all classes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="card border-error-200 bg-error-50">
                <div className="card-body">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-error-800">
                        Detection Failed
                      </h3>
                      <p className="text-sm text-error-700 mt-1">
                        {error.message || "An unexpected error occurred"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  System Status
                </h3>
              </div>
              <div className="card-body">
                {apiHealth ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            apiHealth.status === "healthy"
                              ? "bg-success-500"
                              : "bg-error-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            apiHealth.status === "healthy"
                              ? "text-success-700"
                              : "text-error-700"
                          }`}
                        >
                          {apiHealth.status}
                        </span>
                      </div>
                    </div>
                    {apiHealth.model_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Model</span>
                        <span className="text-sm font-medium text-gray-900">
                          {apiHealth.model_name}
                        </span>
                      </div>
                    )}
                    {apiHealth.device && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Device</span>
                        <span className="text-sm font-medium text-gray-900">
                          {apiHealth.device.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-error-500 mx-auto mb-2" />
                    <p className="text-sm text-error-700">API Unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Features
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Real-time Detection
                      </h4>
                      <p className="text-xs text-gray-600">
                        Fast object detection with YOLO models
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Camera className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        80+ Classes
                      </h4>
                      <p className="text-xs text-gray-600">
                        Detect people, vehicles, animals, and more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Video className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Video Support
                      </h4>
                      <p className="text-xs text-gray-600">
                        Process both images and video files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Customizable
                      </h4>
                      <p className="text-xs text-gray-600">
                        Adjust thresholds and filter classes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {availableClasses.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Classes
                  </h3>
                </div>
                <div className="card-body">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {availableClasses.length}
                    </div>
                    <p className="text-sm text-gray-600">
                      Object classes supported
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Start Guide
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  1. Upload File
                </h4>
                <p className="text-sm text-gray-600">
                  Drag and drop or select an image or video file to analyze
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  2. Configure (Optional)
                </h4>
                <p className="text-sm text-gray-600">
                  Adjust detection settings and filter specific object classes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  3. View Results
                </h4>
                <p className="text-sm text-gray-600">
                  Analyze detected objects with confidence scores and locations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Livestream Modal */}
        <LivestreamModal
          isOpen={showLivestreamModal}
          onClose={() => setShowLivestreamModal(false)}
          onStartStream={handleLivestreamDetection}
          isProcessing={isProcessingStream}
          results={streamResults}
          error={streamError}
        />
      </div>
    </div>
  );
};

export default HomePage;
