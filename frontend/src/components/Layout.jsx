import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Eye, 
  Info, 
  Home, 
  Activity,
  Cpu,
  Zap
} from 'lucide-react';

const Layout = ({ children, apiHealth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Upload and detect objects'
    },
    {
      name: 'Results',
      href: '/results',
      icon: Eye,
      description: 'View detection results'
    },
    {
      name: 'About',
      href: '/about',
      icon: Info,
      description: 'Learn about YOLO detection'
    }
  ];

  const isActivePage = (href) => {
    return location.pathname === href;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">YOLO Detection</h1>
                  <p className="text-xs text-gray-500">AI Object Recognition</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* API Status and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* API Status Indicator */}
              {apiHealth && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${
                    apiHealth.status === 'healthy' ? 'bg-success-500' : 'bg-error-500'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {apiHealth.model_name || 'API'}
                  </span>
                  <Cpu className="w-3 h-3 text-gray-400" />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePage(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile API Status */}
              {apiHealth && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">API Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        apiHealth.status === 'healthy' ? 'bg-success-500' : 'bg-error-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">
                        {apiHealth.status}
                      </span>
                    </div>
                  </div>
                  {apiHealth.model_name && (
                    <div className="mt-2 px-4 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Model</span>
                        <span className="text-xs font-medium text-gray-700">
                          {apiHealth.model_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Device</span>
                        <span className="text-xs font-medium text-gray-700">
                          {apiHealth.device || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">YOLO Detection</span>
              </div>
              <p className="text-sm text-gray-600">
                Powered by state-of-the-art YOLO models for real-time object detection 
                and computer vision analysis.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Links</h3>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">System Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-medium">{import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
                </div>
                {apiHealth && (
                  <>
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-medium">{apiHealth.model_name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${
                        apiHealth.status === 'healthy' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {apiHealth.status}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} YOLO Detection App. Built with React and FastAPI.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Powered by</span>
                <span className="font-medium text-primary-600">Ultralytics YOLO</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;