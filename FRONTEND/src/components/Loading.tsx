import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  ariaLabel?: string;
  role?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Carregando...', 
  fullScreen = false,
  ariaLabel,
  role = 'status'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div 
      className="flex flex-col items-center justify-center space-y-2"
      role={role}
      aria-label={ariaLabel || text || 'Carregando conteúdo'}
      aria-live="polite"
      aria-busy="true"
    >
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        aria-hidden="true"
        role="img"
      ></div>
      {text && (
        <p 
          className={`text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}
          aria-live="polite"
        >
          {text}
        </p>
      )}
      <span className="sr-only">
        {ariaLabel || text || 'Carregando conteúdo, por favor aguarde'}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || 'Carregando página'}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;