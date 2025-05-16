import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import PriceIndicator from '../common/PriceIndicator';
import { PriceData } from '../../types';
import { callReadFunction } from '../../utils/blockchain';
import { CONTRACT_ADDRESSES, BLOCKCHAIN_CONSTANTS } from '../../utils/constants';

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

// Cargar dirección del contrato desde las constantes
const CONTRACT_ADDRESS = CONTRACT_ADDRESSES.PRICE_CALCULATOR;

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
    
    // Set up polling to refresh data using the constant interval
    const interval = setInterval(fetchPriceData, BLOCKCHAIN_CONSTANTS.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading && !priceData) {
    return (
      <Card title="VCOP Price" className="h-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
            <div className="text-blue-600 mt-4">Loading price data...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card title="VCOP Price" className="h-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
        <div className="flex justify-center items-center h-48">
          <div className="text-red-600 dark:text-red-400 bg-red-50/30 backdrop-blur-sm p-4 rounded-xl border border-red-100/50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error loading data: {error?.message || 'Unknown error'}
          </div>
        </div>
      </Card>
    );
  }

  const { isPegHealthy } = priceData;
  
  return (
    <Card title="VCOP Price" className="h-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-2">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Current Price in USD (Uniswap Pool)
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent bg-white/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-blue-100/50 shadow-sm">
              USD ${priceData?.price ? Math.round(priceData.price).toLocaleString('en-US') : "0"}
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
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transform transition-all duration-300 hover:scale-105 ${
                isPegHealthy 
                  ? 'bg-green-100/80 text-green-800 dark:bg-green-900/60 dark:text-green-200 border border-green-200/50' 
                  : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border border-yellow-200/50'
              }`}
            >
              {isPegHealthy ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Stable Peg!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Peg Under Pressure
                </>
              )}
            </div>
          </div>
          
          <div className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Price obtained from the Uniswap V4 liquidity pool
          </div>
        </div>

        <div className="pt-6 border-t border-blue-100/50 dark:border-blue-800/30">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 shadow-sm transform transition-all duration-300 hover:scale-[1.02]">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Target Price (COP)
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                COP ${targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="text-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 shadow-sm transform transition-all duration-300 hover:scale-[1.02]">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Peg Deviation
              </div>
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
          <div className="mt-4 flex justify-between items-center text-xs bg-blue-50/30 backdrop-blur-sm rounded-lg p-2 border border-blue-100/50">
            <div className="flex items-center text-blue-600/80 dark:text-blue-400/80">
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Automatic update every {BLOCKCHAIN_CONSTANTS.REFRESH_INTERVAL/1000}s
                </span>
              )}
            </div>
            <div className="px-2 py-0.5 bg-blue-100/50 text-blue-700 rounded-lg border border-blue-200/50">
              {new Date().toLocaleTimeString('en-US')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceOverview;