import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import LoanCreator from '../components/loans/LoanCreator';
import FlexibleLoanCreator from '../components/loans/FlexibleLoanCreator';
import FlexibleActiveLoans from '../components/loans/FlexibleActiveLoans';
import ActiveLoans from '../components/loans/ActiveLoans';
import PSMSwapper from '../components/loans/PSMSwapper';

export default function LoansPage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'vcop-loans' | 'flexible-loans' | 'psm'>('flexible-loans');
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header section with glass effect */}
      <div className="relative flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 md:mb-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500">VCOP Lending Ecosystem</span>
        </h1>
        
        {/* Connect wallet section */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <Wallet>
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100/50">
                <Avatar className="h-6 w-6" />
                <Name className="text-blue-900 font-medium" />
              </div>
            </Wallet>
          ) : (
            <Wallet>
              <ConnectWallet className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-2 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md">
                <Avatar className="h-5 w-5 mr-2" />
                <span className="font-medium">Connect Wallet</span>
              </ConnectWallet>
            </Wallet>
          )}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-blue-100/50 shadow-sm">
        <button
          onClick={() => setActiveTab('flexible-loans')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'flexible-loans'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
              : 'text-blue-600 hover:bg-blue-50/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Flexible Loans
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">NEW</span>
        </button>
        <button
          onClick={() => setActiveTab('vcop-loans')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'vcop-loans'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
              : 'text-blue-600 hover:bg-blue-50/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          VCOP Loans
        </button>
        <button
          onClick={() => setActiveTab('psm')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'psm'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
              : 'text-blue-600 hover:bg-blue-50/80'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          PSM
        </button>
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
      ) :
        <>
          {/* Flexible Loans Tab */}
          {activeTab === 'flexible-loans' && (
            <div className="space-y-8">
              {/* Introduction Banner */}
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="inline-flex p-3 rounded-full bg-blue-100/80">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Ultra-Flexible Lending Protocol</h3>
                    <p className="text-blue-700 mb-4">
                      Create loans with any supported asset as collateral and borrow any other supported asset. 
                      This new protocol offers maximum flexibility with minimal restrictions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-700">Any asset combination</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-700">Flexible ratios</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-700">Custom interest rates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Flexible Loan
                  </h2>
                  <FlexibleLoanCreator />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Your Flexible Loans
                  </h2>
                  <FlexibleActiveLoans />
                </div>
              </div>
            </div>
          )}

          {/* VCOP Loans Tab */}
          {activeTab === 'vcop-loans' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create VCOP Loan
                </h2>
                <LoanCreator />
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Your VCOP Loans
                </h2>
                <ActiveLoans />
              </div>
            </div>
          )}

          {/* PSM Tab */}
          {activeTab === 'psm' && (
            <div className="grid grid-cols-1 max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Peg Stability Module
                </h2>
                <PSMSwapper />
              </div>
            </div>
          )}
        </>
      }
      
      {/* Information section */}
      {isConnected && (
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-md p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
              <h3 className="font-medium mb-2 text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Flexible Loans
              </h3>
              <p className="text-gray-700 text-sm">
                Use any supported asset as collateral to borrow any other asset with ultra-flexible terms.
                Perfect for advanced users who want maximum control.
              </p>
            </div>
            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
              <h4 className="font-medium mb-2 text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                VCOP Loans
              </h4>
              <p className="text-gray-700 text-sm">
                Deposit USDC as collateral to mint VCOP stablecoins. Safe and proven system with
                automatic liquidation protection.
              </p>
            </div>
            <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-100/50">
              <h4 className="font-medium mb-2 text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                PSM Trading
              </h4>
              <p className="text-gray-700 text-sm">
                Swap between VCOP and USDC at a 1:1 ratio through the Peg Stability Module.
                Maintain VCOP's stable value.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 