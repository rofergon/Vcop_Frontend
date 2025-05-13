import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  isLoading = false,
  headerAction
}) => {
  const hasHeader = title || subtitle || headerAction;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-md ${className}`}>
      {hasHeader && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default Card;