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
    <Card title="Resumen de Reservas" className="h-full bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Valor Total</h4>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(totalValueUSD, 'USD', 2)}
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

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Última actualización
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {new Date().toLocaleTimeString('es-CO')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReserveSummary;