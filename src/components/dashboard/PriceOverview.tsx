import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import PriceIndicator from '../common/PriceIndicator';
import { PriceData } from '../../types';
import { callReadFunction } from '../../utils/blockchain';

const VCOPPriceCalculatorABI = [
  {
    "inputs": [],
    "name": "calculateAllPrices",
    "outputs": [
      {"internalType": "uint256", "name": "vcopToUsdPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "vcopToCopPrice", "type": "uint256"},
      {"internalType": "int24", "name": "currentTick", "type": "int24"},
      {"internalType": "bool", "name": "isAtParity", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdToCopRate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0x999653EEb3F93f50e9628Ddb65754540A20Af690";

interface PriceOverviewProps {
  priceData?: PriceData; // Make optional since we'll fetch it from the contract
}

const PriceOverview: React.FC<PriceOverviewProps> = ({ priceData: propsPriceData }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(propsPriceData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [targetPrice, setTargetPrice] = useState<number>(4200);
  const [error, setError] = useState<Error | null>(null);

  // Fetch price data from contract
  const fetchPriceData = async () => {
    try {
      setLoading(true);
      
      // Get price information
      const priceInfo = await callReadFunction(
        CONTRACT_ADDRESS,
        VCOPPriceCalculatorABI,
        'calculateAllPrices',
        []
      );
      
      // Get target price
      const targetRate = await callReadFunction(
        CONTRACT_ADDRESS,
        VCOPPriceCalculatorABI,
        'usdToCopRate',
        []
      );
      
      console.log('Raw price info from contract:', priceInfo);
      console.log('Raw target rate from contract:', targetRate);
      
      // Safely extract values - contract might return array or object depending on provider
      let vcopToUsdPrice, vcopToCopPrice, currentTick, isAtParity;
      
      if (Array.isArray(priceInfo)) {
        // Handle array response
        [vcopToUsdPrice, vcopToCopPrice, currentTick, isAtParity] = priceInfo;
      } else if (priceInfo && typeof priceInfo === 'object') {
        // Handle object response with numbered keys or named keys
        vcopToUsdPrice = priceInfo.vcopToUsdPrice || priceInfo[0];
        vcopToCopPrice = priceInfo.vcopToCopPrice || priceInfo[1];
        currentTick = priceInfo.currentTick || priceInfo[2];
        isAtParity = priceInfo.isAtParity || priceInfo[3];
      } else {
        throw new Error('Unexpected contract response format');
      }

      // Safely convert values to proper types
      // vcopToUsdPrice es el precio actual del VCOP en USD (con 6 decimales)
      const currentPrice = vcopToUsdPrice ? Number(vcopToUsdPrice.toString()) / 1000000 : 0;
      
      // vcopToCopPrice es la relación VCOP/COP (con 6 decimales)
      const vcopCopRate = vcopToCopPrice ? Number(vcopToCopPrice.toString()) / 1000000 : 0;
      
      // targetPrice es el precio objetivo en COP
      const targetPriceValue = targetRate ? Number(targetRate.toString()) / 1000000 : 4200;
      setTargetPrice(targetPriceValue);
      
      // Calculate price deviation if we have valid values
      const deviation = (vcopCopRate && targetPriceValue) 
        ? Math.abs((vcopCopRate / 1 - 1) * 100) 
        : 0;
      
      // Create PriceData object with safe values
      const newPriceData: PriceData = {
        price: currentPrice || 0,  // Usar vcopToUsdPrice como el precio actual
        change: 0, // We don't have historical data for change
        isPegHealthy: Boolean(isAtParity),
        deviation,
        tick: Number(currentTick || 0),
      };
      
      console.log('Processed price data:', newPriceData);
      
      setPriceData(newPriceData);
      setError(null);
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching price data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    
    // Set up polling to refresh data every 10 seconds
    const interval = setInterval(fetchPriceData, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading && !priceData) {
    return (
      <Card title="Precio VCOP" className="h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-center items-center h-48">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">Cargando datos de precio...</div>
        </div>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card title="Precio VCOP" className="h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-center items-center h-48">
          <div className="text-red-600 dark:text-red-400">
            Error al cargar los datos: {error?.message || 'Error desconocido'}
          </div>
        </div>
      </Card>
    );
  }

  const { isPegHealthy } = priceData;
  
  return (
    <Card title="Precio VCOP" className="h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Precio Actual en USD (Pool Uniswap)
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              USD ${priceData?.price ? Math.round(priceData.price).toLocaleString('es-CO') : "0"}
            </div>
          </div>
          
          <div className="mt-2">
            <PriceIndicator 
              priceData={priceData} 
              size="lg" 
              showChange={true} 
            />
          </div>
          
          <div className="mt-6 flex items-center">
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
          
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Precio obtenido de la pool de liquidez Uniswap V4
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Precio Objetivo (COP)</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                COP ${targetPrice.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Desviación del Peg</div>
              <div className={`text-2xl font-bold ${
                typeof priceData.deviation === 'number' ? (
                  priceData.deviation < 2 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                    : priceData.deviation < 5
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-600' 
                      : 'bg-gradient-to-r from-red-600 to-rose-600'
                ) : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              } bg-clip-text text-transparent`}>
                {typeof priceData.deviation === 'number' 
                  ? priceData.deviation.toFixed(2)
                  : '0.00'}%
              </div>
            </div>
          </div>
          
          {/* Add loading indicator and timestamp */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center">
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : (
                <span>Actualización automática cada 10s</span>
              )}
            </div>
            <div>
              {new Date().toLocaleTimeString('es-CO')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceOverview;