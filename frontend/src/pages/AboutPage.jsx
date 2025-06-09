import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Zap, 
  Brain, 
  Camera, 
  Video, 
  Target, 
  Cpu, 
  Clock, 
  Shield, 
  Globe, 
  Github, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

const AboutPage = ({ apiHealth }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    // Simulate getting system info
    setSystemInfo({
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildDate: new Date().toLocaleDateString(),
      nodeEnv: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_BASE_URL,
    });
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Models',
      description: 'Powered by state-of-the-art YOLO (You Only Look Once) neural networks for real-time object detection.',
      details: [
        'YOLOv8, YOLOv9, YOLOv10, and YOLOv11 support',
        'Pre-trained on COCO dataset with 80+ object classes',
        'High accuracy with optimized speed',
        'GPU acceleration when available'
      ]
    },
    {
      icon: Camera,
      title: 'Multi-Format Support',
      description: 'Detect objects in various image and video formats with ease.',
      details: [
        'Image formats: JPEG, PNG, WebP, BMP',
        'Video formats: MP4, AVI, MOV, MKV',
        'Batch processing capabilities',
        'Real-time preview and analysis'
      ]
    },
    {
      icon: Target,
      title: 'Precise Detection',
      description: 'Accurate bounding box detection with confidence scores and class classification.',
      details: [
        'Pixel-perfect bounding boxes',
        'Confidence scores for each detection',
        'Non-maximum suppression for clean results',
        'Customizable detection thresholds'
      ]
    },
    {
      icon: Clock,
      title: 'Real-Time Processing',
      description: 'Fast inference times with optimized model deployment for immediate results.',
      details: [
        'Sub-second processing for images',
        'Efficient video frame processing',
        'Asynchronous processing pipeline',
        'Progress tracking and status updates'
      ]
    }
  ];

  const techStack = [
    {
      category: 'Frontend',
      technologies: [
        { name: 'React 18', description: 'Modern UI library with hooks' },
        { name: 'Vite', description: 'Fast build tool and dev server' },
        { name: 'TailwindCSS', description: 'Utility-first CSS framework' },
        { name: 'React Router', description: 'Client-side routing' },
        { name: 'Axios', description: 'HTTP client for API calls' },
        { name: 'React Dropzone', description: 'File upload interface' }
      ]
    },
    {
      category: 'Backend',
      technologies: [
        { name: 'FastAPI', description: 'Modern Python web framework' },
        { name: 'Ultralytics YOLO', description: 'Object detection models' },
        { name: 'OpenCV', description: 'Computer vision library' },
        { name: 'PyTorch', description: 'Machine learning framework' },
        { name: 'Uvicorn', description: 'ASGI web server' },
        { name: 'Pydantic', description: 'Data validation and settings' }
      ]
    },
    {
      category: 'Deployment',
      technologies: [
        { name: 'Vercel', description: 'Frontend hosting platform' },
        { name: 'Railway/Render', description: 'Backend deployment options' },
        { name: 'Docker', description: 'Containerization support' },
        { name: 'CORS', description: 'Cross-origin resource sharing' },
        { name: 'Environment Config', description: 'Flexible configuration' }
      ]
    }
  ];

  const objectClasses = [
    'Person', 'Bicycle', 'Car', 'Motorcycle', 'Airplane', 'Bus', 'Train', 'Truck', 'Boat',
    'Traffic Light', 'Fire Hydrant', 'Stop Sign', 'Parking Meter', 'Bench', 'Bird', 'Cat',
    'Dog', 'Horse', 'Sheep', 'Cow', 'Elephant', 'Bear', 'Zebra', 'Giraffe', 'Backpack',
    'Umbrella', 'Handbag', 'Tie', 'Suitcase', 'Frisbee', 'Skis', 'Snowboard', 'Sports Ball',
    'Kite', 'Baseball Bat', 'Baseball Glove', 'Skateboard', 'Surfboard', 'Tennis Racket',
    'Bottle', 'Wine Glass', 'Cup', 'Fork', 'Knife', 'Spoon', 'Bowl', 'Banana', 'Apple',
    'Sandwich', 'Orange', 'Broccoli', 'Carrot', 'Hot Dog', 'Pizza', 'Donut', 'Cake',
    'Chair', 'Couch', 'Potted Plant', 'Bed', 'Dining Table', 'Toilet', 'TV', 'Laptop',
    'Mouse', 'Remote', 'Keyboard', 'Cell Phone', 'Microwave', 'Oven', 'Toaster', 'Sink',
    'Refrigerator', 'Book', 'Clock', 'Vase', 'Scissors', 'Teddy Bear', 'Hair Drier', 'Toothbrush'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About YOLO Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A powerful, web-based object detection platform powered by state-of-the-art YOLO models.
            Built with modern technologies for fast, accurate, and user-friendly AI-powered analysis.
          </p>
        </div>

        {/* System Status */}
        <div className="mb-12">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Status
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    apiHealth?.status === 'healthy' ? 'bg-success-100' : 'bg-error-100'
                  }`}>
                    {apiHealth?.status === 'healthy' ? (
                      <CheckCircle className="w-6 h-6 text-success-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-error-600" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900">API Status</h3>
                  <p className={`text-sm ${
                    apiHealth?.status === 'healthy' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {apiHealth?.status || 'Unknown'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Model</h3>
                  <p className="text-sm text-gray-600">
                    {apiHealth?.model_name || 'Not loaded'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cpu className="w-6 h-6 text-warning-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Device</h3>
                  <p className="text-sm text-gray-600">
                    {apiHealth?.device?.toUpperCase() || 'Unknown'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Version</h3>
                  <p className="text-sm text-gray-600">
                    {systemInfo?.version || '1.0.0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const isExpanded = expandedSections[`feature-${index}`];
              const Icon = feature.icon;
              
              return (
                <div key={index} className="card">
                  <div className="card-body">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {feature.description}
                        </p>
                        <button
                          onClick={() => toggleSection(`feature-${index}`)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                        >
                          {isExpanded ? 'Show less' : 'Learn more'}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-4 space-y-2">
                            {feature.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{detail}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Technology Stack</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {techStack.map((stack, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">{stack.category}</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {stack.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{tech.name}</h4>
                          <p className="text-xs text-gray-600">{tech.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Object Classes */}
        <div className="mb-12">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Supported Object Classes ({objectClasses.length})
                </h2>
                <button
                  onClick={() => toggleSection('object-classes')}
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  {expandedSections['object-classes'] ? 'Hide' : 'Show'} all classes
                  {expandedSections['object-classes'] ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
            <div className="card-body">
              <p className="text-gray-600 mb-4">
                Our YOLO models can detect and classify the following object categories,
                trained on the COCO dataset for high accuracy and reliability.
              </p>
              
              {expandedSections['object-classes'] ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {objectClasses.map((className, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 text-center hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {className}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {objectClasses.slice(0, 12).map((className, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {className}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    +{objectClasses.length - 12} more...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Media</h3>
              <p className="text-gray-600">
                Upload your image or video file through our intuitive drag-and-drop interface.
                Supports multiple formats with automatic validation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Processing</h3>
              <p className="text-gray-600">
                Our YOLO models analyze your media using advanced neural networks,
                detecting objects with high precision and speed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">View Results</h3>
              <p className="text-gray-600">
                Get detailed results with bounding boxes, confidence scores,
                and comprehensive analysis of detected objects.
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="mb-12">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Application</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span className="font-medium">{systemInfo.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <span className="font-medium capitalize">{systemInfo.nodeEnv}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Build Date:</span>
                        <span className="font-medium">{systemInfo.buildDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">API Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">API URL:</span>
                        <span className="font-medium text-xs break-all">{systemInfo.apiUrl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          apiHealth?.status === 'healthy' ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {apiHealth?.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-4">
            Built with ❤️ using React, FastAPI, and Ultralytics YOLO
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/ultralytics/ultralytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Github className="w-4 h-4 mr-1" />
              Ultralytics YOLO
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Globe className="w-4 h-4 mr-1" />
              React
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <a
              href="https://fastapi.tiangolo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Zap className="w-4 h-4 mr-1" />
              FastAPI
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;