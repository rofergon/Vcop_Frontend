import React from 'react';
import Card from '../common/Card';
import PriceIndicator from '../common/PriceIndicator';
import { PriceData } from '../../types';

interface PriceOverviewProps {
  priceData: PriceData;
}

const PriceOverview: React.FC<PriceOverviewProps> = ({ priceData }) => {
  const { isPegHealthy } = priceData;
  
  return (
    <Card title="Precio VCOP" className="h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col items-center justify-center">
          <PriceIndicator 
            priceData={priceData} 
            size="lg" 
            showChange={true} 
          />
          
          <div className="mt-8 flex items-center">
            <div 
              className={`px-4 py-2 rounded-full text-sm font-medium transform transition-all duration-300 hover:scale-105 ${
                isPegHealthy 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {isPegHealthy ? '¡Peg Estable!' : 'Peg Bajo Presión'}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Precio Objetivo</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                COP $4,300.00
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Desviación</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {Math.abs(((priceData.price / 4300) - 1) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceOverview;