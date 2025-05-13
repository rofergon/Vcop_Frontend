import React, { useState } from 'react';
import Card from '../common/Card';

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const tabs = [
    { title: 'PSM Basics', id: 0 },
    { title: 'How to Swap', id: 1 },
    { title: 'Peg Mechanism', id: 2 }
  ];
  
  const tabContent = [
    // PSM Basics
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        What is a Peg Stability Module (PSM)?
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        The PSM is a mechanism that allows users to swap between VCOP and USDC at a fixed exchange rate, helping maintain VCOP's peg to the Colombian Peso (COP).
      </p>
      
      <div className="space-y-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Key Features</h4>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Fixed exchange rate with minimal fees</li>
            <li>Maintains the VCOP peg to COP</li>
            <li>Transparent reserve assets backing all VCOP tokens</li>
            <li>No slippage during exchanges</li>
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
              Select the token you want to swap from and the token you want to receive.
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
              Enter the amount you want to swap. The corresponding amount you'll receive will be calculated automatically.
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
              If this is your first time swapping a token, you'll need to approve the PSM to use that token.
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
    
    // Peg Mechanism
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        How the VCOP Peg Works
      </h3>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        VCOP is designed to maintain a stable value of 1 VCOP = 4,300 COP (Colombian Peso). The PSM is the primary mechanism that maintains this peg.
      </p>
      
      <div className="space-y-6 mt-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">When VCOP Price Increases</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If VCOP price rises above 4,300 COP, users are incentivized to mint new VCOP by depositing USDC into the PSM, increasing supply and bringing the price back to the peg.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">When VCOP Price Decreases</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If VCOP price falls below 4,300 COP, users are incentivized to redeem VCOP for USDC from the PSM, reducing supply and bringing the price back to the peg.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stability Fee</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            A small fee (0.1%) is charged on all PSM operations. This fee helps maintain protocol reserves and incentivizes proper market behavior.
          </p>
        </div>
      </div>
    </>
  ];
  
  return (
    <Card title="How It Works" className="h-full">
      <div>
        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative ${
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