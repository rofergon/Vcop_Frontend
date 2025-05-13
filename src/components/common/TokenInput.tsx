import React, { useState } from 'react';
import { TokenInfo } from '../../types';

interface TokenInputProps {
  token: TokenInfo;
  value: string;
  onChange: (value: string) => void;
  onTokenSelect?: () => void;
  label?: string;
  disabled?: boolean;
  maxValue?: number;
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  value,
  onChange,
  onTokenSelect,
  label,
  disabled = false,
  maxValue
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numeric input with decimals
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };
  
  const handleMaxClick = () => {
    if (maxValue !== undefined) {
      onChange(maxValue.toString());
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="flex items-center p-3">
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              disabled={disabled}
              placeholder="0.0"
              className="w-full outline-none bg-transparent text-2xl font-medium text-gray-900 dark:text-white"
            />
            {token.balance !== undefined && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Balance: {token.balance.toLocaleString()} {token.symbol}
                </span>
                {maxValue !== undefined && (
                  <button 
                    onClick={handleMaxClick}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    MAX
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={onTokenSelect}
            disabled={disabled || !onTokenSelect}
            className={`
              flex items-center space-x-2 py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 
              dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200
              ${(!onTokenSelect) ? 'cursor-default' : ''}
            `}
          >
            <span className="text-2xl">{token.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white">{token.symbol}</span>
            {onTokenSelect && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;