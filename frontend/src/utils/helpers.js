// Utility functions for the YOLO Detection frontend

/**
 * File validation utilities
 */
export const fileUtils = {
  // Check if file is an image
  isImage(file) {
    return file && file.type.startsWith('image/');
  },

  // Check if file is a video
  isVideo(file) {
    return file && file.type.startsWith('video/');
  },

  // Get file extension
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Format file size
  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Validate file size
  validateFileSize(file, maxSize) {
    return file && file.size <= maxSize;
  },

  // Get allowed file types from env
  getAllowedImageTypes() {
    return (import.meta.env.VITE_SUPPORTED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/bmp')
      .split(',')
      .map(type => type.trim());
  },

  getAllowedVideoTypes() {
    return (import.meta.env.VITE_SUPPORTED_VIDEO_TYPES || 'video/mp4,video/avi,video/mov,video/mkv')
      .split(',')
      .map(type => type.trim());
  },

  // Create file preview URL
  createPreviewUrl(file) {
    if (file && (this.isImage(file) || this.isVideo(file))) {
      return URL.createObjectURL(file);
    }
    return null;
  },

  // Revoke preview URL
  revokePreviewUrl(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  },
};

/**
 * Detection result utilities
 */
export const detectionUtils = {
  // Format confidence percentage
  formatConfidence(confidence) {
    return `${Math.round(confidence * 100)}%`;
  },

  // Get confidence color class
  getConfidenceColor(confidence) {
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.6) return 'text-warning-600';
    return 'text-error-600';
  },

  // Get confidence badge class
  getConfidenceBadge(confidence) {
    if (confidence >= 0.8) return 'badge-success';
    if (confidence >= 0.6) return 'badge-warning';
    return 'badge-error';
  },

  // Calculate bounding box area
  calculateBboxArea(bbox) {
    const [x1, y1, x2, y2] = bbox;
    return Math.abs((x2 - x1) * (y2 - y1));
  },

  // Format bounding box coordinates
  formatBbox(bbox) {
    return bbox.map(coord => Math.round(coord));
  },

  // Group detections by class
  groupByClass(detections) {
    return detections.reduce((groups, detection) => {
      const className = detection.class;
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(detection);
      return groups;
    }, {});
  },

  // Get class statistics
  getClassStats(detections) {
    const grouped = this.groupByClass(detections);
    return Object.entries(grouped).map(([className, items]) => ({
      class: className,
      count: items.length,
      avgConfidence: items.reduce((sum, item) => sum + item.confidence, 0) / items.length,
      maxConfidence: Math.max(...items.map(item => item.confidence)),
      minConfidence: Math.min(...items.map(item => item.confidence)),
    }));
  },

  // Filter detections by confidence threshold
  filterByConfidence(detections, threshold) {
    return detections.filter(detection => detection.confidence >= threshold);
  },

  // Filter detections by class
  filterByClass(detections, classes) {
    if (!classes || classes.length === 0) return detections;
    return detections.filter(detection => classes.includes(detection.class));
  },

  // Sort detections by confidence
  sortByConfidence(detections, descending = true) {
    return [...detections].sort((a, b) => {
      return descending ? b.confidence - a.confidence : a.confidence - b.confidence;
    });
  },
};

/**
 * UI utilities
 */
export const uiUtils = {
  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  },

  // Download file
  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Smooth scroll to element
  scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const yOffset = offset;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get scroll percentage
  getScrollPercentage() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    return Math.round(scrollPercent * 100);
  },
};

/**
 * Date and time utilities
 */
export const dateUtils = {
  // Format timestamp
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },

  // Format time
  formatTime(date) {
    return new Date(date).toLocaleTimeString();
  },

  // Get relative time (e.g., "2 minutes ago")
  getRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  },

  // Format duration in seconds to readable format
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  },
};

/**
 * Storage utilities
 */
export const storageUtils = {
  // Local storage with JSON support
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Session storage
  setSessionItem(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      return false;
    }
  },

  getSessionItem(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // URL validation
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Number validation
  isValidNumber(value, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  },

  // Required field validation
  isRequired(value) {
    return value !== null && value !== undefined && value !== '';
  },

  // Min length validation
  hasMinLength(value, minLength) {
    return value && value.length >= minLength;
  },

  // Max length validation
  hasMaxLength(value, maxLength) {
    return !value || value.length <= maxLength;
  },
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    if (typeof error === 'string') return error;
    
    if (error.message) return error.message;
    
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'Authentication required. Please log in.';
        case 403:
          return 'Access denied. You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 422:
          return 'Invalid data provided. Please check your input.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `An error occurred (${error.status}). Please try again.`;
      }
    }
    
    return 'An unexpected error occurred. Please try again.';
  },

  // Log error with context
  logError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    // In production, you might want to send this to an error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: { context } });
    }
  },
};

/**
 * Performance utilities
 */
export const perfUtils = {
  // Measure execution time
  measureTime(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Async version
  async measureTimeAsync(name, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Memory usage (if available)
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  },
};

// Export all utilities as default
export default {
  fileUtils,
  detectionUtils,
  uiUtils,
  dateUtils,
  storageUtils,
  validationUtils,
  errorUtils,
  perfUtils,
};