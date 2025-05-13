import React from 'react';
import PriceOverview from '../components/dashboard/PriceOverview';
import ReserveSummary from '../components/dashboard/ReserveSummary';
import SwapInterface from '../components/swap/SwapInterface';
import TransactionList from '../components/transactions/TransactionList';
import HowItWorks from '../components/education/HowItWorks';
import { MOCK_PRICE_DATA, MOCK_RESERVE_DATA, MOCK_TRANSACTIONS } from '../utils/constants';

const Dashboard: React.FC = () => {
  const handleSwapComplete = (txHash: string) => {
    console.log("Swap completed with hash:", txHash);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          VCOP Stablecoin PSM
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          La primera stablecoin colombiana respaldada por USDC. Intercambia de manera instantánea y mantén el peg al peso colombiano.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Price Overview - Made larger and more prominent */}
        <div className="lg:col-span-5">
          <PriceOverview priceData={MOCK_PRICE_DATA} />
        </div>
        
        {/* Reserve Summary */}
        <div className="lg:col-span-7">
          <ReserveSummary reserveData={MOCK_RESERVE_DATA} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Swap Interface - Centered in its column */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md">
            <SwapInterface onSwapComplete={handleSwapComplete} />
          </div>
        </div>
        
        {/* Transaction List */}
        <div className="lg:col-span-7">
          <TransactionList 
            transactions={MOCK_TRANSACTIONS}
            title="Transacciones Recientes" 
            maxItems={5}
          />
        </div>
      </div>
      
      {/* Educational Section - Full width with improved spacing */}
      <div className="mt-16">
        <HowItWorks />
      </div>
    </div>
  );
};

export default Dashboard;