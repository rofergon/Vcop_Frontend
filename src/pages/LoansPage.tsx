import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import LoanCreator from '../components/loans/LoanCreator';
import LoanManager from '../components/loans/LoanManager';
import PSMSwapper from '../components/loans/PSMSwapper';

export default function LoansPage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'psm'>('create');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-4 md:mb-0">VCOP Loans & PSM</h1>
        
        <Wallet>
          <ConnectWallet className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <Avatar className="h-5 w-5 mr-2" />
            <Name />
          </ConnectWallet>
        </Wallet>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'create' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Position
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'manage' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Positions
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'psm' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('psm')}
          >
            PSM Swap
          </button>
        </div>
        
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Connect your wallet to access VCOP lending</h2>
              <p className="text-gray-600 mb-8">You'll need to connect your wallet to create or manage loan positions.</p>
              <Wallet>
                <ConnectWallet className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  <Avatar className="h-5 w-5 mr-2" />
                  <span>Connect Now</span>
                </ConnectWallet>
              </Wallet>
            </div>
          ) : (
            <>
              {activeTab === 'create' && <LoanCreator />}
              {activeTab === 'manage' && <LoanManager />}
              {activeTab === 'psm' && <PSMSwapper />}
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">About VCOP Lending</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-semibold mb-2">Create Positions</h3>
            <p className="text-sm text-gray-600">
              Deposit USDC as collateral to mint VCOP stablecoins. Your position requires 
              at least 150% collateralization to prevent liquidation.
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-semibold mb-2">Manage Positions</h3>
            <p className="text-sm text-gray-600">
              Add more collateral to make your position safer, withdraw excess collateral, 
              or repay your VCOP debt to recover your collateral.
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-semibold mb-2">PSM Swaps</h3>
            <p className="text-sm text-gray-600">
              Use the Peg Stability Module to swap between USDC and VCOP at near 1:1 rates 
              with minimal fees, helping maintain the VCOP peg to COP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 