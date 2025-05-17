import React, { useState, useEffect } from 'react';
import Card from '../common/Card';

// Custom animation styles
const customStyles = `
  @keyframes bounce-gentle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes spin-slow {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
`;

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Inject custom animation styles
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = customStyles;
    styleEl.setAttribute('id', 'how-it-works-styles');
    
    // Append to head if it doesn't exist already
    if (!document.getElementById('how-it-works-styles')) {
      document.head.appendChild(styleEl);
    }
    
    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById('how-it-works-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  const tabs = [
    { title: 'System Overview', id: 0 },
    { title: 'PSM Mechanism', id: 1 },
    { title: 'Collateral Loans', id: 2 },
    { title: 'How to Swap', id: 3 },
    { title: 'Liquidations', id: 4 }
  ];
  
  const tabContent = [
    // System Overview
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        VCOP Stablecoin System
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        VCOP is the first Colombian stablecoin, designed to maintain a stable value of 1 VCOP = 1 COP (Colombian Peso). 
        The system is backed by USDC collateral and uses multiple mechanisms to ensure stability.
      </p>
      
      <div className="my-6 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-4xl w-full backdrop-blur-sm relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/10 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10">
            {/* System Architecture Diagram */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 flex justify-center mb-6 transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-center shadow-lg border border-blue-400/30 flex items-center gap-3">
                  <img src="/logo.png" alt="VCOP" className="h-8 w-8" />
                  VCOP Stablecoin
                </div>
              </div>
              
              <div className="col-span-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800/50 h-full flex flex-col items-center justify-center text-center shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-200 dark:bg-green-800/50 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 text-lg">PSM</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">Peg Stability Module</p>
                </div>
              </div>
              
              <div className="col-span-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800/50 h-full flex flex-col items-center justify-center text-center shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-200 dark:bg-purple-800/50 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 text-lg">Collateral</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">USDC Backed</p>
                </div>
              </div>
              
              <div className="col-span-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800/50 h-full flex flex-col items-center justify-center text-center shadow-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-orange-200 dark:bg-orange-800/50 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-700 dark:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 text-lg">Oracle</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-400">Price Feeds</p>
                </div>
              </div>
              
              <div className="col-span-3 flex justify-center mt-4 transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 px-8 py-4 rounded-xl font-medium text-center text-indigo-800 dark:text-indigo-200 shadow-md border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Uniswap v4 Hooks & Pools
                </div>
              </div>
            </div>
            
            {/* Connection lines - now curved and animated */}
            <div className="absolute top-1/3 left-0 w-full flex justify-center">
              <svg className="absolute w-3/4 h-64 top-0" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30,10 C60,60 240,60 270,10" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="6 2" className="animate-pulse-slow">
                  <animate attributeName="d" values="M30,10 C60,60 240,60 270,10; M30,20 C60,70 240,70 270,20; M30,10 C60,60 240,60 270,10" dur="8s" repeatCount="indefinite" />
                </path>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Key Components</h4>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
            <li><span className="font-medium">PSM (Peg Stability Module)</span>: Allows users to swap VCOP for USDC and vice versa at rates that maintain the peg</li>
            <li><span className="font-medium">Collateral System</span>: Users can deposit USDC as collateral to mint VCOP</li>
            <li><span className="font-medium">Price Oracle</span>: Monitors and provides exchange rates between VCOP, COP, and USD</li>
            <li><span className="font-medium">Uniswap v4 Hooks</span>: Monitors prices and executes stabilization operations</li>
          </ul>
        </div>
      </div>
    </>,
    
    // PSM Mechanism
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        How the Peg Stability Module (PSM) Works
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        The PSM is a mechanism that allows users to swap between VCOP and USDC at fixed exchange rates, helping maintain VCOP's peg to the Colombian Peso (COP).
      </p>
      
      <div className="my-6 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-4xl w-full backdrop-blur-sm relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-400/10 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-blue-500/10 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10">
            {/* PSM Flow Diagram */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="col-span-1 flex flex-col items-center transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/50 w-full shadow-md">
                  <div className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-200 dark:bg-blue-800/50 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-lg">USDC</h4>
                </div>
              
                <div className="h-20 w-0.5 bg-gradient-to-b from-green-500 to-green-400 my-1 animate-pulse"></div>
                <div className="text-sm font-medium px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Mint
                  </span>
                </div>
                <div className="h-20 w-0.5 bg-gradient-to-b from-green-400 to-green-500 my-1 animate-pulse"></div>
              </div>
              
              <div className="col-span-1 flex flex-col justify-center transform transition-all duration-300 hover:scale-110 z-10">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-lg h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center bg-purple-200 dark:bg-purple-800/50 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-700 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-lg mb-1">PSM</h4>
                  <div className="bg-purple-200 dark:bg-purple-800/50 text-xs text-purple-800 dark:text-purple-300 px-2 py-1 rounded-md font-medium">
                    Fee: 0.1%
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 flex flex-col items-center transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/50 w-full shadow-md">
                  <div className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-200 dark:bg-blue-800/50 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-lg">VCOP</h4>
                </div>
                
                <div className="h-20 w-0.5 bg-gradient-to-b from-red-500 to-red-400 my-1 animate-pulse"></div>
                <div className="text-sm font-medium px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Burn
                  </span>
                </div>
                <div className="h-20 w-0.5 bg-gradient-to-b from-red-400 to-red-500 my-1 animate-pulse"></div>
              </div>
              
              {/* Bottom Row - Actions */}
              <div className="col-span-1 transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-green-400/80 to-green-500/80 dark:from-green-600/80 dark:to-green-700/80 p-3 rounded-xl shadow-md text-white font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Deposit</span>
                </div>
              </div>
              
              <div className="col-span-1 flex justify-center items-center">
                <div className="w-20 h-20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-300 dark:border-blue-700 animate-spin-slow opacity-50"></div>
                </div>
              </div>
              
              <div className="col-span-1 transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-r from-red-400/80 to-red-500/80 dark:from-red-600/80 dark:to-red-700/80 p-3 rounded-xl shadow-md text-white font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Withdraw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">When VCOP Price Increases Above 1 COP</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If VCOP price rises above 1 COP, users are incentivized to mint new VCOP by depositing USDC into the PSM, increasing supply and bringing the price back to the peg.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">When VCOP Price Decreases Below 1 COP</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If VCOP price falls below 1 COP, users are incentivized to redeem VCOP for USDC from the PSM, reducing supply and bringing the price back to the peg.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Automatic Stabilization</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The system actively monitors market prices through the VCOPCollateralHook. If large swaps that might break the peg are detected, the PSM automatically executes trades to stabilize the price.
          </p>
        </div>
      </div>
    </>,
    
    // Collateral Loans
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Collateralized Lending with VCOP
      </h3>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Users can deposit USDC as collateral to mint VCOP stablecoins. The system ensures overcollateralization to maintain stability.
      </p>
      
      <div className="my-6 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-4xl w-full backdrop-blur-sm relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-green-400/10 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-14 -right-14 w-48 h-48 bg-blue-500/10 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10">
            {/* Collateral Flow Diagram - improved */}
            <div className="grid grid-cols-1 gap-8">
              {/* Step 1: Deposit & Mint */}
              <div className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/30 shadow-md">
                <h3 className="text-center text-blue-800 dark:text-blue-300 font-medium mb-4 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-sm">1</span>
                  Create a Collateralized Position
                </h3>
                
                <div className="flex items-center">
                  <div className="w-1/3 transform transition-all duration-300 hover:scale-105">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800/50 text-center shadow-md h-full">
                      <div className="w-10 h-10 mx-auto flex items-center justify-center bg-green-200 dark:bg-green-800/50 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-green-800 dark:text-green-300">Deposit Collateral</h4>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1 bg-green-100 dark:bg-green-900/30 rounded-lg px-2 py-1 inline-block">USDC</p>
                    </div>
                  </div>
                  
                  <div className="w-1/3 flex justify-center relative px-4">
                    <div className="w-full h-0.5 bg-gradient-to-r from-green-400 to-blue-400 relative">
                      <div className="absolute -top-7 right-0 text-blue-500 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md shadow-sm border border-blue-100 dark:border-blue-800/50">
                        150%+ ratio required
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute -right-3 -top-3 text-blue-500 animate-bounce-gentle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="w-1/3 transform transition-all duration-300 hover:scale-105">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 text-center shadow-md h-full">
                      <div className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-200 dark:bg-blue-800/50 rounded-full mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300">Mint VCOP</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg px-2 py-1 inline-block">Fee: 0.1%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Transition */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-12 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-4 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                      Time passes, market conditions change
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 2: Manage Position */}
              <div className="grid grid-cols-2 gap-6">
                <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800/50 shadow-md h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-yellow-200 dark:bg-yellow-800/50 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-lg">Safe Position</h4>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg px-3 py-2 mb-4 flex items-center">
                      <span className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Ratio ≥ 150%</span>
                      <div className="ml-auto w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add more collateral
                      </div>
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Repay VCOP debt
                      </div>
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Withdraw excess collateral
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-800/50 shadow-md h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-red-200 dark:bg-red-800/50 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-red-800 dark:text-red-300 text-lg">At-risk Position</h4>
                    </div>
                    
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg px-3 py-2 mb-4 flex items-center">
                      <span className="text-sm text-red-700 dark:text-red-400 font-medium">Ratio &lt; 120%</span>
                      <div className="ml-auto w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-red-100 dark:border-red-800/30 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Subject to liquidation
                      </div>
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add collateral to recover
                      </div>
                      <div className="flex items-center text-sm bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600 transform transition-all duration-300 hover:translate-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Repay debt to recover
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Collateral Ratio</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The system requires positions to be overcollateralized at a minimum ratio of 150%. This means for every 100 VCOP minted, at least 150 VCOP worth of collateral must be deposited.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Managing Positions</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Once a position is created, you can:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 mt-2">
            <li>Add more collateral to increase your ratio</li>
            <li>Repay your VCOP debt (partially or fully)</li>
            <li>Withdraw excess collateral if your position is safe</li>
          </ul>
        </div>
      </div>
    </>,
    
    // How to Swap
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        How to Swap between VCOP and USDC
      </h3>
      
      <div className="space-y-6 mt-2">
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium">
            1
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">Connect Your Wallet</h4>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Click the "Connect Wallet" button in the top right corner and select your wallet provider.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium">
            2
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">Choose Tokens</h4>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Select USDC or VCOP for your swap. PSM swaps have fixed rates with minimal slippage.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium">
            3
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">Enter Amount</h4>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Enter the amount you want to swap. The corresponding amount you'll receive will be calculated based on the current exchange rate between USD and COP.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium">
            4
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">Approve (if needed)</h4>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              If this is your first time swapping a token, you'll need to approve the PSM contract to use that token.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium">
            5
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">Confirm & Swap</h4>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Click "Swap" and confirm the transaction in your wallet. Once processed, you'll receive your tokens.
            </p>
          </div>
        </div>
      </div>
    </>,
    
    // Liquidations
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Liquidation Process
      </h3>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        When a collateralized position falls below the minimum required ratio (120%), it becomes subject to liquidation to maintain system solvency.
      </p>
      
      <div className="my-6 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-4xl w-full backdrop-blur-sm relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-400/10 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-14 -left-14 w-48 h-48 bg-yellow-500/10 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10">
            {/* Liquidation Process Diagram - Improved */}
            <div className="grid grid-cols-1 gap-6">
              {/* Warning Status */}
              <div className="flex flex-col items-center">
                <div className="w-80 max-w-full bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-5 rounded-xl border border-red-200 dark:border-red-700/50 text-center shadow-md transform transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 mx-auto flex items-center justify-center bg-red-200 dark:bg-red-800/50 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-red-800 dark:text-red-300 text-lg mb-3">Position Below 120% Collateral Ratio</h4>
                  
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full animate-pulse" style={{ width: '80%' }}></div>
                    <div className="absolute bottom-full left-[80%] mb-1 transform -translate-x-1/2">
                      <div className="bg-red-200 dark:bg-red-800/70 text-red-800 dark:text-red-300 text-xs px-2 py-0.5 rounded shadow-sm font-medium">
                        80%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                    <span className="relative">
                      0%
                      <div className="absolute h-2 w-px bg-gray-300 dark:bg-gray-600 left-1/2 -top-3"></div>
                    </span>
                    <span className="relative">
                      100%
                      <div className="absolute h-2 w-px bg-gray-300 dark:bg-gray-600 left-1/2 -top-3"></div>
                    </span>
                    <span className="relative font-medium text-yellow-600 dark:text-yellow-400">
                      120%
                      <div className="absolute h-2 w-px bg-yellow-400 dark:bg-yellow-600 left-1/2 -top-3"></div>
                    </span>
                    <span className="relative text-green-600 dark:text-green-400">
                      150%
                      <div className="absolute h-2 w-px bg-green-400 dark:bg-green-600 left-1/2 -top-3"></div>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-0.5 h-10 bg-gradient-to-b from-red-300 to-gray-300 dark:from-red-700 dark:to-gray-600"></div>
              </div>
              
              {/* Process Flow */}
              <div className="grid grid-cols-3 gap-5">
                <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800/50 shadow-md h-full">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center bg-yellow-200 dark:bg-yellow-800/50 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-center mb-3 text-lg">Liquidator</h4>
                    
                    <div className="space-y-3 text-sm text-yellow-700 dark:text-yellow-400">
                      <div className="flex items-start">
                        <div className="bg-yellow-200 dark:bg-yellow-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-yellow-800 dark:text-yellow-300 font-bold mr-2 mt-0.5 flex-shrink-0">1</div>
                        <p>Spots undercollateralized position</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-yellow-200 dark:bg-yellow-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-yellow-800 dark:text-yellow-300 font-bold mr-2 mt-0.5 flex-shrink-0">2</div>
                        <p>Pays the VCOP debt</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-yellow-200 dark:bg-yellow-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-yellow-800 dark:text-yellow-300 font-bold mr-2 mt-0.5 flex-shrink-0">3</div>
                        <p>Receives collateral at discount</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-md h-full">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center bg-blue-200 dark:bg-blue-800/50 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-center mb-3 text-lg">Protocol</h4>
                    
                    <div className="space-y-3 text-sm text-blue-700 dark:text-blue-400">
                      <div className="flex items-start">
                        <div className="bg-blue-200 dark:bg-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-blue-800 dark:text-blue-300 font-bold mr-2 mt-0.5 flex-shrink-0">1</div>
                        <p>Verifies position ratio is below threshold</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-200 dark:bg-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-blue-800 dark:text-blue-300 font-bold mr-2 mt-0.5 flex-shrink-0">2</div>
                        <p>Burns VCOP debt</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-200 dark:bg-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-blue-800 dark:text-blue-300 font-bold mr-2 mt-0.5 flex-shrink-0">3</div>
                        <p>Transfers collateral to liquidator</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-200 dark:bg-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-blue-800 dark:text-blue-300 font-bold mr-2 mt-0.5 flex-shrink-0">4</div>
                        <p>Closes position</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-800/50 shadow-md h-full">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center bg-red-200 dark:bg-red-800/50 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300 text-center mb-3 text-lg">Borrower</h4>
                    
                    <div className="space-y-3 text-sm text-red-700 dark:text-red-400">
                      <div className="flex items-start">
                        <div className="bg-red-200 dark:bg-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-red-800 dark:text-red-300 font-bold mr-2 mt-0.5 flex-shrink-0">1</div>
                        <p>Position is liquidated</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-red-200 dark:bg-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-red-800 dark:text-red-300 font-bold mr-2 mt-0.5 flex-shrink-0">2</div>
                        <p>Loses collateral</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-red-200 dark:bg-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-red-800 dark:text-red-300 font-bold mr-2 mt-0.5 flex-shrink-0">3</div>
                        <p>Debt is cleared completely</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-red-200 dark:bg-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-xs text-red-800 dark:text-red-300 font-bold mr-2 mt-0.5 flex-shrink-0">4</div>
                        <p>No further obligation remains</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flow Arrows */}
              <div className="grid grid-cols-3 gap-5 -mt-2">
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              
              {/* Result */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 shadow-md border border-green-200/50 dark:border-green-800/30 max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-green-800 dark:text-green-300">System Remains Solvent and Healthy</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">The liquidation process ensures the protocol remains overcollateralized at all times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/50 shadow-md transform transition hover:shadow-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Avoid Liquidation
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
            <li>Monitor your position's health regularly on the "Active Loans" section</li>
            <li>Add more collateral when your ratio approaches the 120% threshold</li>
            <li>Repay part of your debt to improve your position ratio</li>
            <li>Set up notifications or alerts for price movements of collateral</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Liquidation Incentives</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Liquidators are incentivized to maintain system solvency. When they liquidate an undercollateralized position, they receive the collateral in exchange for paying off the debt, potentially realizing a profit from the difference.
          </p>
        </div>
      </div>
    </>
  ];
  
  return (
    <Card title="How It Works" className="h-full">
      <div>
        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.title}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="prose dark:prose-invert max-w-none">
          {tabContent[activeTab]}
        </div>
      </div>
    </Card>
  );
};

export default HowItWorks;