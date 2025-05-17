import React, { useState } from 'react';
import Card from '../common/Card';

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-3xl">
          <div className="relative">
            {/* System Architecture Diagram */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 flex justify-center mb-4">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-center">
                  VCOP Stablecoin
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800 h-full flex flex-col items-center justify-center text-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">PSM</h4>
                  <p className="text-xs text-green-700 dark:text-green-400">Peg Stability Module</p>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800 h-full flex flex-col items-center justify-center text-center">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Collateral</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-400">USDC Backed</p>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800 h-full flex flex-col items-center justify-center text-center">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Oracle</h4>
                  <p className="text-xs text-orange-700 dark:text-orange-400">Price Feeds</p>
                </div>
              </div>
              
              <div className="col-span-3 flex justify-center mt-2">
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-lg font-medium text-center text-gray-800 dark:text-gray-200">
                  Uniswap v4 Hooks & Pools
                </div>
              </div>
            </div>
            
            {/* Connection lines */}
            <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-blue-300 dark:bg-blue-700 transform -translate-y-10"></div>
            <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-blue-300 dark:bg-blue-700 transform translate-y-24"></div>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-3xl">
          {/* PSM Flow Diagram */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="col-span-1 flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">USDC</h4>
              </div>
              <div className="h-10 w-0.5 bg-green-500 my-2"></div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Mint</div>
              <div className="h-10 w-0.5 bg-green-500 my-2"></div>
            </div>
            
            <div className="col-span-1 flex flex-col justify-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300">PSM</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Fee: 0.1%</p>
              </div>
            </div>
            
            <div className="col-span-1 flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">VCOP</h4>
              </div>
              <div className="h-10 w-0.5 bg-red-500 my-2"></div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Burn</div>
              <div className="h-10 w-0.5 bg-red-500 my-2"></div>
            </div>
            
            {/* Bottom Row */}
            <div className="col-span-1">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800 w-full text-sm">
                <span className="font-medium text-green-800 dark:text-green-300">Deposit</span>
              </div>
            </div>
            
            <div className="col-span-1 flex justify-center">
              <div className="border-b-2 border-gray-300 dark:border-gray-600 w-full mt-4"></div>
            </div>
            
            <div className="col-span-1">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800 w-full text-sm">
                <span className="font-medium text-red-800 dark:text-red-300">Withdraw</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-3xl">
          {/* Collateral Flow Diagram */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <div className="w-1/3 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Deposit Collateral</h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">USDC</p>
                </div>
                <div className="w-1/3 flex justify-center">
                  <div className="w-4/5 h-0.5 bg-blue-400 relative">
                    <div className="absolute -top-3 right-0 text-blue-500 text-xs">150%+ ratio</div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute -right-1.5 -top-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="w-1/3 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">Mint VCOP</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Fee: 0.1%</p>
                </div>
              </div>
              
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Time passes, market conditions change
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 text-center">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Safe Position</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Ratio ≥ 150%</p>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Add more collateral</div>
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Repay VCOP debt</div>
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Withdraw excess collateral</div>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 text-center">
                  <h4 className="font-semibold text-red-800 dark:text-red-300">At-risk Position</h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">Ratio &lt; 120%</p>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Subject to liquidation</div>
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Add collateral to recover</div>
                    <div className="text-xs bg-white dark:bg-gray-700 p-2 rounded">Repay debt to recover</div>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-blue-800 max-w-3xl">
          {/* Liquidation Process Diagram */}
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="w-full max-w-md bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 text-center">
                <h4 className="font-semibold text-red-800 dark:text-red-300">Position Below 120% Ratio</h4>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                  <span>150%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 h-full">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-center mb-2">Liquidator</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    1. Spots at-risk position<br/>
                    2. Pays the VCOP debt<br/>
                    3. Receives collateral<br/>
                  </p>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800 h-full">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-center mb-2">Protocol</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    1. Verifies position ratio<br/>
                    2. Burns VCOP debt<br/>
                    3. Transfers collateral<br/>
                    4. Closes position<br/>
                  </p>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 h-full">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 text-center mb-2">Borrower</h4>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    1. Position liquidated<br/>
                    2. Loses collateral<br/>
                    3. Debt is cleared<br/>
                    4. No further obligation<br/>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to Avoid Liquidation</h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
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