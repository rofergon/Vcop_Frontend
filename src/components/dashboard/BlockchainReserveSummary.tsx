import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/helpers';
import { useReserveData } from '../../utils/blockchain';
import { MOCK_RESERVE_DATA } from '../../utils/constants';

// Conversion rate from USDC to VCOP (Colombian Pesos)
const CONVERSION_RATE = 4295;

const BlockchainReserveSummary: React.FC = () => {
  const { reserveData, loading, error } = useReserveData();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use mock data if blockchain data isn't available yet
  const data = reserveData || MOCK_RESERVE_DATA;
  const { vcop, usdc, totalValueUSD } = data;
  
  // VCOP value is already in tokens, no need to multiply by the rate
  // We just format it for display
  
  // Calculate percentages for progress bars - VCOP value in USD terms for fair comparison
  const vcopValueInUSD = vcop / CONVERSION_RATE; // Convert VCOP to USD to calculate percentage
  const totalReserveUSD = usdc + vcopValueInUSD;
  
  const vcopPercentage = totalReserveUSD > 0 ? (vcopValueInUSD / totalReserveUSD) * 100 : 0;
  const usdcPercentage = totalReserveUSD > 0 ? (usdc / totalReserveUSD) * 100 : 0;
  
  // Update timestamp when data is refreshed
  useEffect(() => {
    if (reserveData) {
      setLastUpdated(new Date());
    }
  }, [reserveData]);

  return (
    <Card title="Reserve Summary" className="h-full bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Total Value</h4>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(totalReserveUSD, 'USD', 2)}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* VCOP Reserve */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-between mb-2">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span className="text-2xl mr-2">🇨🇴</span> VCOP
              </span>
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                {formatCurrency(vcop, 'COP', 0)} ({vcopPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${vcopPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* USDC Reserve */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-between mb-2">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <span className="text-2xl mr-2">💵</span> USDC
              </span>
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                {formatCurrency(usdc, 'USD', 2)} ({usdcPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${usdcPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating data...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Real-time data</span>
                </>
              )}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {lastUpdated.toLocaleTimeString('en-US')}
            </div>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Error: {error.message}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Auto-updating every 5 seconds
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlockchainReserveSummary; 