import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import LoanCreator from '../components/loans/LoanCreator';
import ActiveLoans from '../components/loans/ActiveLoans';
import PSMSwapper from '../components/loans/PSMSwapper';

export default function LoansPage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'loans' | 'psm'>('loans');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-4 md:mb-0">VCOP Loans & PSM</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-blue-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'loans' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('loans')}
            >
              Loans
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'psm' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('psm')}
            >
              PSM
            </button>
          </div>
          
          <Wallet>
            <ConnectWallet className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <Avatar className="h-5 w-5 mr-2" />
              <Name />
            </ConnectWallet>
          </Wallet>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
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
          {activeTab === 'loans' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-6">Create New Loan</h2>
                <LoanCreator />
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-6">Your Active Loans</h2>
                <ActiveLoans />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-6">PSM Swap</h2>
              <PSMSwapper />
            </div>
          )}
        </>
      )}
      
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">About VCOP Lending</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Loan Management</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Create Loans</h4>
                <p className="text-gray-600">
                  Deposit USDC as collateral to mint VCOP stablecoins. Maintain at least 150% 
                  collateralization to prevent liquidation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Manage Loans</h4>
                <p className="text-gray-600">
                  Add collateral to increase safety, withdraw excess collateral, or repay VCOP 
                  debt to recover your collateral.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">PSM Swaps</h3>
            <p className="text-gray-600">
              Use the Peg Stability Module to swap between USDC and VCOP at near 1:1 rates 
              with minimal fees. This helps maintain the VCOP peg to COP while providing 
              liquidity for users.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium mb-2">Benefits</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Efficient price stability mechanism</li>
                <li>Low-fee conversions</li>
                <li>Instant liquidity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 