import React from 'react';
import { TokenInfo } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface TokenInputProps {
  token: TokenInfo;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  maxValue?: number;
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  value,
  onChange,
  label,
  disabled = false,
  maxValue
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    
    if (parts.length > 2) {
      return;
    }
    
    onChange(sanitizedValue);
  };
  
  const handleMaxClick = () => {
    if (maxValue !== undefined) {
      onChange(maxValue.toString());
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {label && (
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="0.00"
            className={`w-full text-2xl font-medium focus:outline-none bg-transparent ${
              disabled 
                ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'text-gray-900 dark:text-white'
            }`}
          />
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-2xl mr-1">{token.icon}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{token.symbol}</span>
          </div>
        </div>
      </div>
      
      {maxValue !== undefined && !disabled && (
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Balance: {formatCurrency(token.balance, token.symbol === 'VCOP' ? 'COP' : 'USD')}
          </div>
          <button
            onClick={handleMaxClick}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            MAX
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenInput;