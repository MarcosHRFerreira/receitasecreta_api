import React, { forwardRef, useId } from 'react';
import type { ReactNode, InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    loading = false,
    className,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    id,
    ...props
  },
  ref
) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperTextId = `${inputId}-helper`;
  
  const getAriaDescribedBy = () => {
    const describedByIds = [];
    if (error) describedByIds.push(errorId);
    if (helperText && !error) describedByIds.push(helperTextId);
    if (ariaDescribedBy) describedByIds.push(ariaDescribedBy);
    return describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
  };
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
    filled: 'border-0 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
    outlined: 'border-2 border-gray-200 dark:border-gray-600 bg-transparent dark:bg-transparent text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400'
  };

  const baseClasses = cn(
    'w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-1',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed',
    sizeClasses[size],
    variantClasses[variant],
    error && 'border-red-300 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
    (leftIcon || rightIcon) && 'relative',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  );

  const iconClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500',
    size === 'sm' && 'w-4 h-4',
    size === 'md' && 'w-5 h-5',
    size === 'lg' && 'w-6 h-6'
  );

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin w-4 h-4 text-gray-400 dark:text-gray-500" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={cn(iconClasses, 'left-3')} aria-hidden="true">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={baseClasses}
          disabled={disabled || loading}
          aria-label={ariaLabel}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={error ? 'true' : 'false'}
          aria-busy={loading}
          {...props}
        />
        
        {(rightIcon || loading) && (
          <div className={cn(iconClasses, 'right-3')} aria-hidden="true">
            {loading ? <LoadingSpinner /> : rightIcon}
          </div>
        )}
        
        {loading && (
          <span className="sr-only">Carregando...</span>
        )}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={helperTextId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;