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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header section with glass effect */}
      <div className="relative flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500">VCOP Loans & PSM</span>
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-blue-100/50">
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === 'loans' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-blue-700 hover:bg-blue-50/80'
              }`}
              onClick={() => setActiveTab('loans')}
            >
              Loans
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === 'psm' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-blue-700 hover:bg-blue-50/80'
              }`}
              onClick={() => setActiveTab('psm')}
            >
              PSM
            </button>
          </div>
          
          <Wallet>
            <ConnectWallet className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md border border-blue-700/20">
              <Avatar className="h-5 w-5 mr-2" />
              <Name />
            </ConnectWallet>
          </Wallet>
        </div>
      </div>
      
      {!isConnected ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg">
          <div className="max-w-md mx-auto px-6">
            <div className="inline-flex p-4 mb-6 rounded-full bg-blue-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Connect your wallet to access VCOP lending</h2>
            <p className="text-gray-600 mb-8">You'll need to connect your wallet to create or manage loan positions.</p>
            <Wallet>
              <ConnectWallet className="inline-flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md w-full">
                <Avatar className="h-5 w-5 mr-2" />
                <span className="font-medium">Connect Now</span>
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'loans' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Loan
                </h2>
                <LoanCreator />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Your Active Loans
                </h2>
                <ActiveLoans />
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                PSM Swap
              </h2>
              <PSMSwapper />
            </div>
          )}
        </>
      )}
      
      {/* Info section with glassmorphism */}
      <div className="mt-8 bg-gradient-to-r from-blue-600/5 to-blue-400/5 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About VCOP Lending
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-blue-100/50 shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Loan Management
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
                <h4 className="font-medium mb-2 text-blue-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Loans
                </h4>
                <p className="text-gray-700 text-sm">
                  Deposit USDC as collateral to mint VCOP stablecoins. Maintain at least 150% 
                  collateralization to prevent liquidation.
                </p>
              </div>
              <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
                <h4 className="font-medium mb-2 text-blue-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manage Loans
                </h4>
                <p className="text-gray-700 text-sm">
                  Add collateral to increase safety, withdraw excess collateral, or repay VCOP 
                  debt to recover your collateral.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-blue-100/50 shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              PSM Swaps
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Use the Peg Stability Module to swap between USDC and VCOP at near 1:1 rates 
              with minimal fees. This helps maintain the VCOP peg to COP while providing 
              liquidity for users.
            </p>
            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
              <h4 className="font-medium mb-2 text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Benefits
              </h4>
              <ul className="text-gray-700 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Efficient price stability mechanism</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Low-fee conversions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Instant liquidity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 