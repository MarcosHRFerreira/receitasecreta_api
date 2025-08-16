import React from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: ReactNode;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className,
  disabled,
  loadingText,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-gray-500 dark:focus:ring-gray-400 shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 focus:ring-red-500 dark:focus:ring-red-400 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-gray-500 dark:focus:ring-gray-400',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500 dark:focus:ring-gray-400'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const LoadingSpinner = () => (
    <svg 
      className={cn('animate-spin', iconSizeClasses[size])} 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (loading && loadingText) return loadingText;
    if (loading) return 'Carregando...';
    return undefined;
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={getAriaLabel()}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      type={props.type || 'button'}
      {...props}
    >
      {loading && (
        <>
          <LoadingSpinner />
          <span className="sr-only">
            {loadingText || 'Carregando...'}
          </span>
        </>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizeClasses[size]} aria-hidden="true">{icon}</span>
      )}
      <span className={loading ? 'sr-only' : undefined}>
        {children}
      </span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizeClasses[size]} aria-hidden="true">{icon}</span>
      )}
    </button>
  );
};

export default Button;