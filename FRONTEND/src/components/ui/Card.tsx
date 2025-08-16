import React from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  id?: string;
  role?: string;
}

type CardComponent = React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
};

const Card: CardComponent = ({
  children,
  className,
  hover = false,
  padding = 'md',
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  tabIndex
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700',
        hover && 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200',
        paddingClasses[padding],
        className
      )}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className, id, role }) => {
  return (
    <div 
      className={cn('border-b border-gray-100 dark:border-gray-700 pb-4 mb-4', className)}
      id={id}
      role={role || 'banner'}
    >
      {children}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({ children, className, id, role }) => {
  return (
    <div 
      className={cn(className)}
      id={id}
      role={role || 'main'}
    >
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children, className, id, role }) => {
  return (
    <div 
      className={cn('border-t border-gray-100 dark:border-gray-700 pt-4 mt-4', className)}
      id={id}
      role={role || 'contentinfo'}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;