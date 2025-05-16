import React from 'react';
import Card from '../common/Card';
import { ReserveData } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ReserveSummaryProps {
  reserveData: ReserveData;
}

const ReserveSummary: React.FC<ReserveSummaryProps> = ({ reserveData }) => {
  const { vcop, usdc, totalValueUSD } = reserveData;
  
  const vcopPercentage = (vcop / 4295) / totalValueUSD * 100;
  const usdcPercentage = usdc / totalValueUSD * 100;
  
  return (
    <Card title="Reserve Summary" className="h-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Total Value
          </h4>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300 px-4 py-1 rounded-lg bg-green-50/30 backdrop-blur-sm border border-green-100/50">
            {formatCurrency(totalValueUSD, 'USD', 2)}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* VCOP Reserve */}
          <div className="transform transition-all duration-300 hover:scale-[1.02] bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 shadow-sm">
            <div className="flex justify-between mb-3">
              <span className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center">
                <span className="text-2xl mr-2">🇨🇴</span> VCOP
              </span>
              <span className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                {formatCurrency(vcop, 'COP', 0)}
                <span className="text-sm px-2 py-0.5 bg-blue-100/60 text-blue-700 rounded-full">
                  {vcopPercentage.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="w-full bg-blue-100/60 rounded-full h-3 dark:bg-blue-800/40 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner"
                style={{ width: `${vcopPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* USDC Reserve */}
          <div className="transform transition-all duration-300 hover:scale-[1.02] bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-green-100/50 shadow-sm">
            <div className="flex justify-between mb-3">
              <span className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center">
                <span className="text-2xl mr-2">💵</span> USDC
              </span>
              <span className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatCurrency(usdc, 'USD', 2)}
                <span className="text-sm px-2 py-0.5 bg-green-100/60 text-green-700 rounded-full">
                  {usdcPercentage.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="w-full bg-green-100/60 rounded-full h-3 dark:bg-green-800/40 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-600 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner"
                style={{ width: `${usdcPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-100/50 dark:border-blue-800/30 mt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm text-blue-700/80 dark:text-blue-300/80 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last Update
            </div>
            <div className="text-sm font-medium text-blue-700/80 dark:text-blue-300/80 px-2 py-0.5 bg-blue-50/50 backdrop-blur-sm rounded-lg border border-blue-100/30">
              {new Date().toLocaleTimeString('en-US')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReserveSummary;