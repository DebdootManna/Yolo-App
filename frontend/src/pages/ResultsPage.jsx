import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Filter,
  Grid,
  List,
  Search,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Video,
  Clock,
  Target,
  Zap,
  Share2,
  Copy,
  Trash2,
  RefreshCw,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import { apiService } from '../services/api';

// Utils
import { detectionUtils, fileUtils, dateUtils, uiUtils } from '../utils/helpers';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const { results, file, filePreview } = location.state || {};
  
  // State management
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [minConfidence, setMinConfidence] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no results
  useEffect(() => {
    if (!results) {
      navigate('/', { replace: true });
    }
  }, [results, navigate]);

  // Initialize filtered detections
  useEffect(() => {
    if (results?.detections) {
      setFilteredDetections(results.detections);
    }
  }, [results]);

  // Filter detections based on search and filters
  useEffect(() => {
    if (!results?.detections) return;

    let filtered = [...results.detections];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(detection => 
        detection.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (selectedClasses.length > 0) {
      filtered = filtered.filter(detection => 
        selectedClasses.includes(detection.class)
      );
    }

    // Confidence filter
    filtered = filtered.filter(detection => 
      detection.confidence >= minConfidence
    );

    setFilteredDetections(filtered);
  }, [results, searchTerm, selectedClasses, minConfidence]);

  // Get unique classes
  const uniqueClasses = results ? 
    [...new Set(results.detections.map(d => d.class))].sort() : [];

  // Get statistics
  const stats = results ? detectionUtils.getClassStats(results.detections) : [];

  // Handle download
  const handleDownload = async () => {
    if (!results?.output_image_url && !results?.output_video_url) {
      toast.error('No output file available for download');
      return;
    }

    try {
      const url = results.output_image_url || results.output_video_url;
      const filename = `detection_result_${Date.now()}.${fileUtils.isVideo(file) ? 'mp4' : 'jpg'}`;
      
      // Create download link
      const fullUrl = apiService.getOutputUrl(url.replace('/outputs/', ''));
      uiUtils.downloadFile(fullUrl, filename);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  // Handle download labels
  const handleDownloadLabels = async () => {
    if (!results?.labels_txt_url) {
      toast.error('No labels file available for download');
      return;
    }
    try {
      const url = apiService.getOutputUrl(results.labels_txt_url.replace('/outputs/', ''));
      const filename = `detection_labels_${Date.now()}.txt`;
      uiUtils.downloadFile(url, filename);
      toast.success('Labels download started');
    } catch (error) {
      console.error('Labels download failed:', error);
      toast.error('Labels download failed');
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: 'YOLO Detection Results',
      text: `Found ${results.total_detections} objects in ${file?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      const success = await uiUtils.copyToClipboard(
        `${shareData.text}\n${shareData.url}`
      );
      if (success) {
        toast.success('Link copied to clipboard');
      } else {
        toast.error('Failed to copy link');
      }
    }
  };

  // Handle cleanup
  const handleCleanup = async () => {
    if (!results?.file_id) return;

    try {
      setIsLoading(true);
      await apiService.cleanupFiles(results.file_id);
      toast.success('Files cleaned up');
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast.error('Cleanup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle class filter
  const toggleClassFilter = (className) => {
    setSelectedClasses(prev => 
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  if (!results) {
    return null; // Will redirect
  }

  const isVideo = fileUtils.isVideo(file);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="btn-outline-secondary flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Detection Results</h1>
                <p className="text-gray-600 mt-1">
                  Analysis of {file?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="btn-outline-secondary"
                title="Share results"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="btn-outline-secondary"
                title="Download result"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowImage(!showImage)}
                className="btn-outline-secondary"
                title={showImage ? 'Hide image' : 'Show image'}
              >
                {showImage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Detections</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {results.total_detections}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unique Classes</p>
                    <p className="text-2xl font-bold text-success-600">
                      {uniqueClasses.length}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-success-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-warning-600">
                      {results.detections.length > 0 ? 
                        Math.round(results.detections.reduce((sum, d) => sum + d.confidence, 0) / results.detections.length * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {isVideo ? `${results.video_info?.processed_frames || 0}f` : '<1s'}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Result Image/Video */}
            {showImage && (results.output_image_url || results.output_video_url) && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {isVideo ? <Video className="w-5 h-5 mr-2" /> : <ImageIcon className="w-5 h-5 mr-2" />}
                    Detection Result
                  </h2>
                </div>
                <div className="card-body">
                  <div className="bg-gray-100 rounded-lg p-4">
                    {isVideo ? (
                      <video
                        src={apiService.getOutputUrl(results.output_video_url.replace('/outputs/', ''))}
                        controls
                        className="w-full max-h-96 rounded-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={apiService.getOutputUrl(results.output_image_url.replace('/outputs/', ''))}
                        alt="Detection result"
                        className="w-full max-h-96 object-contain rounded-lg"
                      />
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>File: {file?.name}</span>
                      <span>Size: {fileUtils.formatFileSize(file?.size)}</span>
                      {isVideo && results.video_info && (
                        <>
                          <span>Duration: {dateUtils.formatDuration(results.video_info.duration)}</span>
                          <span>FPS: {results.video_info.fps}</span>
                        </>
                      )}
                    </div>
                    <span>Processed: {dateUtils.getRelativeTime(results.timestamp)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Controls */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Detections ({filteredDetections.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      title="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search object classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>

                  {/* Confidence Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Confidence: {Math.round(minConfidence * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Class Filters */}
                  {uniqueClasses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Classes:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueClasses.map(className => {
                          const count = results.detections.filter(d => d.class === className).length;
                          const isSelected = selectedClasses.includes(className);
                          
                          return (
                            <button
                              key={className}
                              onClick={() => toggleClassFilter(className)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {className} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detections List/Grid */}
                {filteredDetections.length > 0 ? (
                  <div className={viewMode === 'grid' ? 
                    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 
                    'space-y-2'
                  }>
                    {filteredDetections.map((detection, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                          viewMode === 'list' ? 'flex items-center justify-between' : ''
                        }`}
                      >
                        <div className={viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-2'}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            detection.confidence >= 0.8 ? 'bg-success-500' :
                            detection.confidence >= 0.6 ? 'bg-warning-500' : 'bg-error-500'
                          }`}>
                            {Math.round(detection.confidence * 100)}
                          </div>
                          
                          <div className={viewMode === 'list' ? '' : 'flex-1'}>
                            <h3 className="font-medium text-gray-900 capitalize">
                              {detection.class}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Confidence: {detectionUtils.formatConfidence(detection.confidence)}
                            </p>
                            {viewMode === 'grid' && (
                              <p className="text-xs text-gray-500">
                                Box: [{detectionUtils.formatBbox(detection.bbox).join(', ')}]
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {viewMode === 'list' && (
                          <div className="text-xs text-gray-500">
                            [{detectionUtils.formatBbox(detection.bbox).join(', ')}]
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No detections match your filters</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedClasses([]);
                        setMinConfidence(0);
                      }}
                      className="btn-outline-secondary mt-3"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Processing Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Processing Details</h3>
              </div>
              <div className="card-body space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Model:</span>
                  <span className="text-sm font-medium">{results.parameters?.model || 'YOLOv8'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className="text-sm font-medium">{Math.round((results.parameters?.conf_threshold || 0.5) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">IoU Threshold:</span>
                  <span className="text-sm font-medium">{Math.round((results.parameters?.iou_threshold || 0.45) * 100)}%</span>
                </div>
                {isVideo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max Frames:</span>
                    <span className="text-sm font-medium">{results.parameters?.max_frames || 30}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Class Statistics */}
            {stats.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Class Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {stats.slice(0, 5).map((stat) => (
                      <div key={stat.class} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900 capitalize">{stat.class}</span>
                            <span className="text-gray-600">{stat.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${(stat.count / results.total_detections) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {stats.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{stats.length - 5} more classes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="btn-primary w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  New Detection
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-outline-secondary w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Result
                </button>
                <button
                  onClick={handleCleanup}
                  disabled={isLoading}
                  className="btn-outline-secondary w-full text-error-600 hover:bg-error-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Clean Up Files
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(filteredDetections, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    uiUtils.downloadFile(url, 'detections.json');
                    URL.revokeObjectURL(url);
                    toast.success('JSON exported');
                  }}
                  className="btn-outline-secondary w-full text-sm"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    const csvData = filteredDetections.map(d => 
                      `${d.class},${d.confidence},${d.bbox.join(',')}`
                    ).join('\n');
                    const csvContent = 'Class,Confidence,X1,Y1,X2,Y2\n' + csvData;
                    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(dataBlob);
                    uiUtils.downloadFile(url, 'detections.csv');
                    URL.revokeObjectURL(url);
                    toast.success('CSV exported');
                  }}
                  className="btn-outline-secondary w-full text-sm"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;