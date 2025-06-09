import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = null,
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
        />
        {text && (
          <span className={`text-sm ${colorClasses[color]}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;