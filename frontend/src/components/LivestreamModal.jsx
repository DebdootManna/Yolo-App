import React, { useState } from 'react';
import { X, Video, Loader2, Play, AlertCircle, CheckCircle } from 'lucide-react';

const LivestreamModal = ({
  isOpen,
  onClose,
  onStartStream,
  isProcessing = false,
  results = null,
  error = null
}) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [maxFrames, setMaxFrames] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (streamUrl.trim()) {
      onStartStream(streamUrl, { maxFrames });
    }
  };

  const handleClose = () => {
    setStreamUrl('');
    onClose();
  };

  const sampleUrls = [
    'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4',
    'rtsp://sample-videos.com/zip/10mp4/mp4/SampleVideo_1280x720_1mb.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Video className="w-5 h-5 mr-2 text-primary-600" />
            Live Stream Detection
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stream URL Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream URL
              </label>
              <input
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="Enter RTSP, HTTP, or HTTPS stream URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isProcessing}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports RTSP, HTTP/HTTPS, and other OpenCV-compatible formats
              </p>
            </div>

            {/* Sample URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample URLs (Click to use)
              </label>
              <div className="space-y-1">
                {sampleUrls.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setStreamUrl(url)}
                    className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                    disabled={isProcessing}
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Frames to Process: {maxFrames}
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={maxFrames}
                onChange={(e) => setMaxFrames(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 frames</span>
                <span>30 frames</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower values = faster processing, higher values = more analysis
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!streamUrl.trim() || isProcessing}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Stream...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Detection
                </>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-error-800">
                    Stream Detection Failed
                  </h3>
                  <p className="text-sm text-error-700 mt-1">
                    {error.message || 'Failed to process stream'}
                  </p>
                  <div className="mt-2 text-xs text-error-600">
                    <p>Common issues:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Invalid or unreachable stream URL</li>
                      <li>Network connectivity issues</li>
                      <li>Stream requires authentication</li>
                      <li>Unsupported video format or codec</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-success-800">
                    Stream Analysis Complete
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-success-700">Frames Processed:</span>
                        <span className="ml-2 text-success-800">{results.frames_processed}</span>
                      </div>
                      <div>
                        <span className="font-medium text-success-700">Total Detections:</span>
                        <span className="ml-2 text-success-800">{results.total_detections}</span>
                      </div>
                    </div>

                    {/* Per-frame results */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-success-700 mb-2">
                        Frame-by-frame Results:
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.detections_per_frame?.map((frame, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs bg-white rounded px-2 py-1"
                          >
                            <span className="text-gray-600">
                              Frame {frame.frame + 1}:
                            </span>
                            <span className="font-medium text-gray-800">
                              {frame.detections.length} objects
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detected Classes Summary */}
                    {results.detections_per_frame && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-success-700 mb-2">
                          Detected Classes:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(
                            results.detections_per_frame
                              .flatMap(frame => frame.detections.map(d => d.class))
                          )].map((className) => (
                            <span
                              key={className}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                            >
                              {className}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Supported Stream Types
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>RTSP:</strong> Real-time streaming protocol (rtsp://...)</li>
              <li>• <strong>HTTP/HTTPS:</strong> Direct video file URLs</li>
              <li>• <strong>IP Cameras:</strong> Network camera streams</li>
              <li>• <strong>Webcam URLs:</strong> USB camera endpoints</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Note: Stream detection analyzes a limited number of frames for demonstration purposes.
              For continuous monitoring, consider using the full desktop application.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LivestreamModal;
