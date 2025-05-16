import React from 'react';
import SwapInterface from '../components/swap/SwapInterface';

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header section with glass effect */}
      <div className="relative flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500">VCOP Swap</span>
        </h1>
        <p className="text-blue-600/80">Exchange USDC and VCOP tokens instantly at the target rate</p>
      </div>

      {/* Swap Interface */}
      <div className="max-w-xl mx-auto">
        <SwapInterface />
      </div>
    </div>
  );
} 