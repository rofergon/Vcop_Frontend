import React from 'react';
import { PriceData } from '../../types';

interface PriceIndicatorProps {
  priceData: PriceData;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
  className?: string;
}

const PriceIndicator: React.FC<PriceIndicatorProps> = ({
  priceData,
  size = 'md',
  showChange = true,
  className = ''
}) => {
  const { price, change24h, isPegHealthy } = priceData;
  
  // Determine status color based on peg health
  const statusColor = isPegHealthy 
    ? 'bg-green-500' 
    : (change24h < -0.5 ? 'bg-red-500' : 'bg-yellow-500');
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };
  
  // Status dot classes
  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  // Change indicator
  const isPositiveChange = change24h >= 0;
  const changeColor = isPositiveChange ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
      <div className={`${dotSizeClasses[size]} ${statusColor} rounded-full animate-pulse`}></div>
      <div className="font-medium text-gray-900 dark:text-white">
        {new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(price)}
      </div>
      
      {showChange && (
        <div className={`flex items-center ${changeColor}`}>
          {isPositiveChange ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <span>{Math.abs(change24h).toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
};

export default PriceIndicator;