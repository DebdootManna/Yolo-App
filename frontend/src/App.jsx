import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Services
import { apiService } from './services/api';

// Utils
import { storageUtils } from './utils/helpers';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState(null);
  const [error, setError] = useState(null);

  // Check API health on app start
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        setIsLoading(true);
        const health = await apiService.healthCheck();
        setApiHealth(health);
        setError(null);
        
        // Store successful connection
        storageUtils.setSessionItem('apiConnected', true);
      } catch (err) {
        console.error('API health check failed:', err);
        setApiHealth(null);
        setError(err);
        
        // Store failed connection
        storageUtils.setSessionItem('apiConnected', false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiHealth();

    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkApiHealth, 60000); // Check every minute

    return () => clearInterval(healthCheckInterval);
  }, []);

  // Handle app-level errors
  const handleError = (error) => {
    console.error('App error:', error);
    setError(error);
  };

  // Retry connection
  const retryConnection = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const health = await apiService.healthCheck();
      setApiHealth(health);
      storageUtils.setSessionItem('apiConnected', true);
    } catch (err) {
      setError(err);
      storageUtils.setSessionItem('apiConnected', false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen during initial setup
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">Initializing YOLO Detection</h2>
          <p className="text-white/80">Connecting to AI models...</p>
        </div>
      </div>
    );
  }

  // Show error screen if API is not available
  if (error && !apiHealth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-error-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to the YOLO Detection API. Please make sure the backend server is running.
          </p>
          <div className="space-y-3">
            <button
              onClick={retryConnection}
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry Connection'}
            </button>
            <details className="text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700">
                <p><strong>Error:</strong> {error.message || 'Unknown error'}</p>
                <p><strong>Status:</strong> {error.status || 'No response'}</p>
                <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Layout apiHealth={apiHealth}>
            <Routes>
              <Route 
                path="/" 
                element={<HomePage apiHealth={apiHealth} />} 
              />
              <Route 
                path="/results" 
                element={<ResultsPage />} 
              />
              <Route 
                path="/about" 
                element={<AboutPage apiHealth={apiHealth} />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </Layout>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* API Status Indicator */}
          {apiHealth && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    apiHealth.status === 'healthy' ? 'bg-success-500' : 'bg-error-500'
                  }`} />
                  <span className="text-gray-700">
                    API: {apiHealth.status}
                  </span>
                  {apiHealth.model_name && (
                    <span className="text-gray-500">
                      • {apiHealth.model_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Development indicators */}
          {import.meta.env.DEV && (
            <div className="fixed bottom-4 left-4 z-50 text-xs text-gray-500">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded px-2 py-1">
                DEV MODE
              </div>
            </div>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;