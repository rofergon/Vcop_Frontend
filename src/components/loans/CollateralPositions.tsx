import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Mock data for demonstration
const MOCK_POSITIONS = [
  { 
    id: '1', 
    collateralType: 'USDC', 
    collateralAmount: 1000, 
    mintedVcop: 2800000, 
    healthRatio: 1.5, 
    liquidationRatio: 1.1 
  },
  { 
    id: '2', 
    collateralType: 'ETH', 
    collateralAmount: 0.5, 
    mintedVcop: 3500000, 
    healthRatio: 1.25, 
    liquidationRatio: 1.2 
  },
  { 
    id: '3', 
    collateralType: 'USDC', 
    collateralAmount: 500, 
    mintedVcop: 1500000, 
    healthRatio: 1.08, 
    liquidationRatio: 1.05 
  }
];

const CollateralPositions: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Mis Posiciones Colaterales</h2>
      
      {MOCK_POSITIONS.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                <th className="pb-2">ID</th>
                <th className="pb-2">Colateral</th>
                <th className="pb-2 text-right">Cantidad</th>
                <th className="pb-2 text-right">VCOP Acuñado</th>
                <th className="pb-2 text-center">Estado</th>
                <th className="pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_POSITIONS.map((position) => {
                // Determine health status
                let healthStatus;
                let healthClass;
                
                if (position.healthRatio >= 1.3) {
                  healthStatus = "Seguro";
                  healthClass = "text-green-500 dark:text-green-400";
                } else if (position.healthRatio >= 1.15) {
                  healthStatus = "Estable";
                  healthClass = "text-blue-500 dark:text-blue-400";
                } else if (position.healthRatio >= position.liquidationRatio + 0.05) {
                  healthStatus = "Precaución";
                  healthClass = "text-yellow-500 dark:text-yellow-400";
                } else {
                  healthStatus = "Riesgo";
                  healthClass = "text-red-500 dark:text-red-400";
                }
                
                // Calculate percentage of health bar
                const healthPercentage = Math.max(
                  0, 
                  Math.min(
                    100, 
                    ((position.healthRatio - position.liquidationRatio) / 0.5) * 100
                  )
                );
                
                return (
                  <tr key={position.id} className="border-b dark:border-gray-700">
                    <td className="py-4">{position.id}</td>
                    <td className="py-4">{position.collateralType}</td>
                    <td className="py-4 text-right">{position.collateralAmount.toLocaleString()}</td>
                    <td className="py-4 text-right">{position.mintedVcop.toLocaleString()} VCOP</td>
                    <td className="py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center mb-1">
                          {position.healthRatio < position.liquidationRatio + 0.05 ? (
                            <AlertTriangle size={16} className="text-red-500 dark:text-red-400 mr-1" />
                          ) : (
                            <CheckCircle size={16} className="text-green-500 dark:text-green-400 mr-1" />
                          )}
                          <span className={healthClass}>{healthStatus}</span>
                        </div>
                        
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              healthPercentage > 66 ? 'bg-green-500 dark:bg-green-400' :
                              healthPercentage > 33 ? 'bg-yellow-500 dark:bg-yellow-400' :
                              'bg-red-500 dark:bg-red-400'
                            }`}
                            style={{ width: `${healthPercentage}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {position.healthRatio.toFixed(2)}x
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2">
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No tienes posiciones activas</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition">
            Crear posición
          </button>
        </div>
      )}
    </div>
  );
};

export default CollateralPositions; 