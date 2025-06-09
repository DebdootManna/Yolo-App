import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
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
  Target
} from 'lucide-react';

// Services
import { apiService } from '../services/api';

// Utils
import { fileUtils, validationUtils, uiUtils } from '../utils/helpers';

const HomePage = ({ apiHealth }) => {
  const navigate = useNavigate();
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Detection settings
  const [confThreshold, setConfThreshold] = useState(
    parseFloat(import.meta.env.VITE_DEFAULT_CONF_THRESHOLD) || 0.5
  );
  const [iouThreshold, setIouThreshold] = useState(
    parseFloat(import.meta.env.VITE_DEFAULT_IOU_THRESHOLD) || 0.45
  );
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [maxFrames, setMaxFrames] = useState(30);

  // Load available classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesData = await apiService.getClasses();
        setAvailableClasses(classesData.classes || []);
      } catch (err) {
        console.error('Failed to load classes:', err);
        toast.error('Failed to load detection classes');
      }
    };

    if (apiHealth?.status === 'healthy') {
      loadClasses();
    }
  }, [apiHealth]);

  // File drop handler
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      toast.error(`File rejected: ${rejection.errors[0]?.message}`);
      return;
    }

    // Handle accepted file
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50000000; // 50MB
    if (!fileUtils.validateFileSize(file, maxSize)) {
      toast.error(`File too large. Maximum size: ${fileUtils.formatFileSize(maxSize)}`);
      return;
    }

    // Set file and create preview
    setSelectedFile(file);
    setFilePreview(fileUtils.createPreviewUrl(file));
    setResults(null);
    setError(null);
    
    toast.success('File uploaded successfully');
  }, []);

  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Remove selected file
  const removeFile = () => {
    if (filePreview) {
      fileUtils.revokePreviewUrl(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setResults(null);
    setError(null);
    setUploadProgress(0);
  };

  // Handle detection
  const handleDetection = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!apiHealth || apiHealth.status !== 'healthy') {
      toast.error('API is not available');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const options = {
        confThreshold,
        iouThreshold,
        selectedClasses: selectedClasses.length > 0 ? selectedClasses : null,
      };

      let result;
      
      if (fileUtils.isVideo(selectedFile)) {
        options.maxFrames = maxFrames;
        result = await apiService.predictVideoWithProgress(
          selectedFile,
          options,
          setUploadProgress
        );
      } else {
        result = await apiService.predictImageWithProgress(
          selectedFile,
          options,
          setUploadProgress
        );
      }

      setResults(result);
      toast.success(`Detection completed! Found ${result.total_detections} objects`);
      
      // Navigate to results page with data
      navigate('/results', { 
        state: { 
          results: result, 
          file: selectedFile,
          filePreview 
        } 
      });

    } catch (err) {
      console.error('Detection failed:', err);
      setError(err);
      toast.error(err.message || 'Detection failed');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Toggle class selection
  const toggleClass = (className) => {
    setSelectedClasses(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className)
        : [...prev, className]
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Object Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload an image or video to detect and analyze objects using state-of-the-art YOLO models.
            Support for 80+ object classes with real-time processing.
          </p>
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
                {!selectedFile ? (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
                      isDragReject ? 'dropzone-error' : ''
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
                        {isDragActive ? 'Drop your file here' : 'Upload Image or Video'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Drag and drop your file here, or click to browse
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
                        Maximum file size: {fileUtils.formatFileSize(parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50000000)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Preview */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {fileUtils.isImage(selectedFile) ? (
                            <ImageIcon className="w-6 h-6 text-primary-600" />
                          ) : (
                            <Video className="w-6 h-6 text-primary-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {fileUtils.formatFileSize(selectedFile.size)} • {selectedFile.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-1 text-gray-400 hover:text-error-600 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Preview */}
                      {filePreview && (
                        <div className="mt-4">
                          {fileUtils.isImage(selectedFile) ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-w-full h-64 object-contain rounded-lg mx-auto"
                            />
                          ) : (
                            <video
                              src={filePreview}
                              controls
                              className="max-w-full h-64 rounded-lg mx-auto"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {isProcessing && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Processing...</span>
                          <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDetection}
                        disabled={isProcessing || !apiHealth || apiHealth.status !== 'healthy'}
                        className="btn-primary flex-1 flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Detection
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
            {showSettings && selectedFile && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Detection Settings</h3>
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
                      onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
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
                      onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Non-maximum suppression threshold
                    </p>
                  </div>

                  {/* Video Settings */}
                  {fileUtils.isVideo(selectedFile) && (
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
                      <h3 className="text-sm font-medium text-error-800">Detection Failed</h3>
                      <p className="text-sm text-error-700 mt-1">
                        {error.message || 'An unexpected error occurred'}
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
                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              </div>
              <div className="card-body">
                {apiHealth ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          apiHealth.status === 'healthy' ? 'bg-success-500' : 'bg-error-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          apiHealth.status === 'healthy' ? 'text-success-700' : 'text-error-700'
                        }`}>
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
                <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Real-time Detection</h4>
                      <p className="text-xs text-gray-600">
                        Fast object detection with YOLO models
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Camera className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">80+ Classes</h4>
                      <p className="text-xs text-gray-600">
                        Detect people, vehicles, animals, and more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Video className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Video Support</h4>
                      <p className="text-xs text-gray-600">
                        Process both images and video files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Customizable</h4>
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
                  <h3 className="text-lg font-semibold text-gray-900">Available Classes</h3>
                </div>
                <div className="card-body">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {availableClasses.length}
                    </div>
                    <p className="text-sm text-gray-600">Object classes supported</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Start Guide</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">1. Upload File</h4>
                <p className="text-sm text-gray-600">
                  Drag and drop or select an image or video file to analyze
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">2. Configure (Optional)</h4>
                <p className="text-sm text-gray-600">
                  Adjust detection settings and filter specific object classes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">3. View Results</h4>
                <p className="text-sm text-gray-600">
                  Analyze detected objects with confidence scores and locations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;