import React, { useEffect } from 'react';
import PriceOverview from '../components/dashboard/PriceOverview';
import BlockchainReserveSummary from '../components/dashboard/BlockchainReserveSummary';
import SwapInterface from '../components/swap/SwapInterface';
import TransactionList from '../components/transactions/TransactionList';
import HowItWorks from '../components/education/HowItWorks';
import { MOCK_PRICE_DATA, MOCK_TRANSACTIONS } from '../utils/constants';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const handleSwapComplete = (txHash: string) => {
    console.log("Swap completed with hash:", txHash);
  };
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
      {/* Enhanced background with animated gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-400/10 rounded-full filter blur-3xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-emerald-400/10 rounded-full filter blur-3xl animate-pulse-slow animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-cyan-400/5 rounded-full filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center relative"
      >
        {/* Modern title with animated underline */}
        <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 relative tracking-tight">
          <span className="relative inline-block pb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-300 dark:to-indigo-300 drop-shadow-sm">
            VCOP Stablecoin PSM
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full"
            ></motion.div>
          </span>
        </h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-blue-700 dark:text-blue-200 max-w-2xl mx-auto backdrop-blur-md bg-white/70 dark:bg-gray-800/70 px-8 py-4 rounded-2xl border border-blue-200/80 dark:border-blue-700/80 shadow-lg"
        >
          The first Colombian stablecoin backed by USDC. Exchange instantly and maintain the peg to the Colombian peso.
        </motion.p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
        {/* Price Overview - with enhanced animations */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <PriceOverview priceData={MOCK_PRICE_DATA} />
        </motion.div>
        
        {/* Blockchain Reserve Summary with enhanced animations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-7 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <BlockchainReserveSummary />
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-14">
        {/* Swap Interface - with enhanced glass morphism effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-5 transform transition-all duration-500 hover:-translate-y-2 group"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-blue-100/80 shadow-xl group-hover:shadow-2xl transition-all p-6 dark:bg-gray-800/90 dark:border-blue-800/80 group-hover:border-blue-300/80 dark:group-hover:border-blue-600/80">
            <SwapInterface onSwapComplete={handleSwapComplete} />
          </div>
        </motion.div>
        
        {/* Transaction List - with enhanced glass morphism effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="lg:col-span-7 transform transition-all duration-500 hover:-translate-y-2 group"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-blue-100/80 shadow-xl group-hover:shadow-2xl transition-all dark:bg-gray-800/90 dark:border-blue-800/80 group-hover:border-blue-300/80 dark:group-hover:border-blue-600/80">
            <TransactionList 
              transactions={MOCK_TRANSACTIONS}
              title="Recent Transactions" 
              maxItems={5}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Educational Section - with enhanced design */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-10 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-xl rounded-2xl border-2 border-blue-100/80 shadow-xl p-10 dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/80 transform transition-all duration-500 hover:shadow-2xl hover:border-blue-200/90 dark:hover:border-blue-600/90"
      >
        <div className="max-w-5xl mx-auto">
          <HowItWorks />
        </div>
      </motion.div>
      
      {/* Footer with gradient divider */}
      <div className="mt-16 pt-8 text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full"></div>
        <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
          VCOP - The future of Colombian digital currency
        </p>
      </div>
    </div>
  );
};

export default Dashboard;