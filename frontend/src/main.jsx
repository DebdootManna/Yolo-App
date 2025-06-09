import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Performance monitoring
if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
  // Enable React DevTools profiler in development
  if (import.meta.env.DEV) {
    console.log('🚀 YOLO Detection App - Development Mode');
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('Environment:', import.meta.env.MODE);
  }
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker registration (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // In production, you might want to send errors to a monitoring service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.error);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // In production, you might want to send errors to a monitoring service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.reason);
  }
});

// Performance observer (optional)
if (import.meta.env.VITE_ENABLE_DEBUG === 'true' && 'PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('🔍 Navigation timing:', {
          'DNS lookup': entry.domainLookupEnd - entry.domainLookupStart,
          'Connection': entry.connectEnd - entry.connectStart,
          'Response': entry.responseEnd - entry.responseStart,
          'DOM processing': entry.domContentLoadedEventStart - entry.responseEnd,
          'Total': entry.loadEventEnd - entry.navigationStart,
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}