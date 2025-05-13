import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

// Mock market data
const MARKET_DATA = {
  vcopPrice: {
    usd: 0.00025,
    cop: 1.00,
    change24h: 0.05
  },
  collateralTypes: [
    { 
      name: 'USDC', 
      minRatio: 1.05, 
      liquidationThreshold: 1.03,
      mintFee: 0.001, 
      burnFee: 0.001,
      totalLocked: 500000
    },
    { 
      name: 'ETH', 
      minRatio: 1.20, 
      liquidationThreshold: 1.15,
      mintFee: 0.002, 
      burnFee: 0.0015,
      totalLocked: 250
    },
    { 
      name: 'WBTC', 
      minRatio: 1.15, 
      liquidationThreshold: 1.10,
      mintFee: 0.0015, 
      burnFee: 0.001,
      totalLocked: 15
    }
  ],
  totalValueLocked: 2800000,
  totalVcopMinted: 2500000000,
  activePositions: 234
};

const MarketInfo: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Información del Mercado</h2>
      
      {/* VCOP Price Card */}
      <div className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Precio de VCOP</h3>
          <div className="flex items-center">
            {MARKET_DATA.vcopPrice.change24h > 0 ? (
              <TrendingUp size={16} className="text-green-500 mr-1" />
            ) : (
              <TrendingDown size={16} className="text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${MARKET_DATA.vcopPrice.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(MARKET_DATA.vcopPrice.change24h * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">VCOP/USD</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">${MARKET_DATA.vcopPrice.usd.toFixed(5)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">VCOP/COP</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">COP {MARKET_DATA.vcopPrice.cop.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Collateral Requirements */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Requerimientos de Colateral</h3>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm">
            <Info size={14} className="mr-1" /> Más info
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Colateral</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ratio Mín</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Liquidación</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Comisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {MARKET_DATA.collateralTypes.map((type, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{type.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{type.minRatio.toFixed(2)}x</td>
                  <td className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{type.liquidationThreshold.toFixed(2)}x</td>
                  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{(type.mintFee * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Protocol Stats */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Estadísticas del Protocolo</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total Bloqueado</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${MARKET_DATA.totalValueLocked.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">VCOP Acuñados</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {(MARKET_DATA.totalVcopMinted / 1000000).toFixed(1)}M VCOP
            </p>
          </div>
        </div>
      </div>
      
      {/* Liquidation Warning */}
      <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md">
        <div className="flex">
          <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 mr-2" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-500">
              Aviso de Liquidación
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              Las posiciones son liquidadas automáticamente cuando el ratio de colateral cae por debajo del umbral. 
              Mantén un margen de seguridad para evitar liquidaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInfo; 