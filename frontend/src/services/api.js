import axios from "axios";

// Get base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.VITE_SHOW_API_LOGS === "true") {
      console.log("API Request:", config);
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.VITE_SHOW_API_LOGS === "true") {
      console.log("API Response:", response);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("Bad Request:", data.detail || "Invalid request");
          break;
        case 401:
          console.error(
            "Unauthorized:",
            data.detail || "Authentication required",
          );
          break;
        case 403:
          console.error("Forbidden:", data.detail || "Access denied");
          break;
        case 404:
          console.error("Not Found:", data.detail || "Resource not found");
          break;
        case 422:
          console.error("Validation Error:", data.detail || "Invalid data");
          break;
        case 500:
          console.error(
            "Server Error:",
            data.detail || "Internal server error",
          );
          break;
        default:
          console.error("API Error:", data.detail || `HTTP ${status} error`);
      }

      // Return structured error
      return Promise.reject({
        status,
        message: data.detail || `HTTP ${status} error`,
        data: data,
      });
    } else if (error.request) {
      // Network error
      console.error("Network Error:", error.message);
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        data: null,
      });
    } else {
      // Other error
      console.error("Request Error:", error.message);
      return Promise.reject({
        status: -1,
        message: error.message || "Request failed",
        data: null,
      });
    }
  },
);

// API endpoints
export const apiEndpoints = {
  // Health check
  health: "/health",

  // Core endpoints
  predict: "/predict",
  predictVideo: "/predict_video",
  classes: "/classes",
  updateModel: "/update_model",
  cleanup: (fileId) => `/cleanup/${fileId}`,

  // Static files
  outputs: (filename) => `/outputs/${filename}`,
};

// API service methods
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get(apiEndpoints.health);
    return response.data;
  },

  // Get available classes
  async getClasses() {
    const response = await api.get(apiEndpoints.classes);
    return response.data;
  },

  // Predict image
  async predictImage(file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);

    if (options.selectedClasses && options.selectedClasses.length > 0) {
      formData.append(
        "selected_classes",
        JSON.stringify(options.selectedClasses),
      );
    }

    const response = await api.post(apiEndpoints.predict, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for image processing
    });

    return response.data;
  },

  // Predict video
  async predictVideo(file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);
    formData.append("max_frames", options.maxFrames || 30);

    if (options.selectedClasses && options.selectedClasses.length > 0) {
      formData.append(
        "selected_classes",
        JSON.stringify(options.selectedClasses),
      );
    }

    const response = await api.post(apiEndpoints.predictVideo, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for video processing
    });

    return response.data;
  },

  // Update model settings
  async updateModel(modelName, confThreshold = 0.5, iouThreshold = 0.45) {
    const formData = new FormData();
    formData.append("model_name", modelName);
    formData.append("conf_threshold", confThreshold);
    formData.append("iou_threshold", iouThreshold);

    const response = await api.post(apiEndpoints.updateModel, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Cleanup files
  async cleanupFiles(fileId) {
    const response = await api.delete(apiEndpoints.cleanup(fileId));
    return response.data;
  },

  // Get output file URL
  getOutputUrl(filename) {
    return `${API_BASE_URL}${apiEndpoints.outputs(filename)}`;
  },

  // Get base URL
  getBaseUrl() {
    return API_BASE_URL;
  },

  // Upload progress tracking
  async predictImageWithProgress(file, options = {}, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);

    if (options.selectedClasses && options.selectedClasses.length > 0) {
      formData.append(
        "selected_classes",
        JSON.stringify(options.selectedClasses),
      );
    }

    const response = await api.post(apiEndpoints.predict, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  // Video upload with progress
  async predictVideoWithProgress(file, options = {}, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);
    formData.append("max_frames", options.maxFrames || 30);

    if (options.selectedClasses && options.selectedClasses.length > 0) {
      formData.append(
        "selected_classes",
        JSON.stringify(options.selectedClasses),
      );
    }

    const response = await api.post(apiEndpoints.predictVideo, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000,
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  // Batch prediction
  async predictBatch(files, options = {}) {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append("files", file);
    });

    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);

    if (options.selectedClasses && options.selectedClasses.length > 0) {
      formData.append(
        "selected_classes",
        JSON.stringify(options.selectedClasses),
      );
    }

    const response = await api.post("/predict_batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000, // 10 minutes for batch processing
    });

    return response.data;
  },

  // Get processing status
  async getProcessingStatus(endpoint) {
    const response = await api.get(`/${endpoint}`);
    return response.data;
  },

  // Upload custom model
  async uploadCustomModel(modelFile, classesFile) {
    const formData = new FormData();
    formData.append("model_file", modelFile);
    formData.append("classes_file", classesFile);

    const response = await api.post("/upload_model", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes for model upload
    });

    return response.data;
  },

  // Predict livestream
  async predictLivestream(streamUrl, options = {}) {
    const formData = new FormData();
    formData.append("stream_url", streamUrl);
    formData.append("conf_threshold", options.confThreshold || 0.5);
    formData.append("iou_threshold", options.iouThreshold || 0.45);
    formData.append("max_frames", options.maxFrames || 10);

    const response = await api.post("/predict_stream", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 180000, // 3 minutes for stream processing
    });

    return response.data;
  },
};

// Export default
export default apiService;

// Utility functions
export const apiUtils = {
  // Check if API is available
  async checkConnection() {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Validate file type
  validateFileType(file, allowedTypes) {
    if (!file) return false;
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  validateFileSize(file, maxSize) {
    if (!file) return false;
    return file.size <= maxSize;
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Format detection results
  formatDetections(detections) {
    return detections.map((detection, index) => ({
      id: index,
      class: detection.class,
      confidence: Math.round(detection.confidence * 100),
      bbox: detection.bbox,
      area: Math.round(
        (detection.bbox[2] - detection.bbox[0]) *
          (detection.bbox[3] - detection.bbox[1]),
      ),
    }));
  },

  // Get confidence color
  getConfidenceColor(confidence) {
    if (confidence >= 0.8) return "text-success-600";
    if (confidence >= 0.6) return "text-warning-600";
    return "text-error-600";
  },

  // Get confidence badge color
  getConfidenceBadgeColor(confidence) {
    if (confidence >= 0.8) return "badge-success";
    if (confidence >= 0.6) return "badge-warning";
    return "badge-error";
  },
};
