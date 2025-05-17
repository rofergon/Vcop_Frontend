import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import CustomConnectButton from '../wallet/ConnectButton';
import { baseSepolia, base } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const location = useLocation();
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const navItems = [
    { name: 'Dashboard', path: '/', current: location.pathname === '/' },
    { name: 'Loans', path: '/loans', current: location.pathname === '/loans' },
    { name: 'Swap', path: '/swap', current: location.pathname === '/swap' },
    { name: 'How It Works', path: '/how-it-works', current: location.pathname === '/how-it-works' },
    { name: 'Liquidations', path: '/liquidations', current: location.pathname === '/liquidations' },
    { name: 'Stats', path: '/stats', current: location.pathname === '/stats' }
  ];

  // Determine current network based on chainId
  const isTestnet = chainId === baseSepolia.id;
  const isMainnet = chainId === base.id;
  const networkName = isMainnet ? "Mainnet" : "Sepolia";
  
  const networkBadge = (
    <div className="relative">
      <button 
        onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
        className={`ml-2 flex items-center text-xs px-3 py-1.5 rounded-full cursor-pointer backdrop-blur-sm border ${
          isMainnet 
            ? 'bg-green-100/70 text-green-800 border-green-200/50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30' 
            : 'bg-yellow-100/70 text-yellow-800 border-yellow-200/50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/30'
        } font-medium shadow-sm transition-all hover:shadow`}
      >
        {networkName}
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>
      
      {isNetworkMenuOpen && isConnected && (
        <div className="absolute right-0 mt-1 w-40 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-xl shadow-lg z-10 overflow-hidden border border-blue-100/50 dark:border-blue-800/30">
          <div className="py-1">
            <button
              onClick={() => {
                switchChain({ chainId: baseSepolia.id });
                setIsNetworkMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                isTestnet ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
              } text-blue-800 dark:text-blue-200 transition-colors`}
            >
              Base Sepolia
            </button>
            <button
              onClick={() => {
                switchChain({ chainId: base.id });
                setIsNetworkMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                isMainnet ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
              } text-blue-800 dark:text-blue-200 transition-colors`}
            >
              Base Mainnet
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 dark:bg-gray-900/80 dark:border-blue-800/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          {/* Logo and Network Badge */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
              <img src="/logo.png" alt="VCOP Logo" className="w-8 h-8 object-contain" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300">
                VCOP
              </span>
            </Link>
            <span className="ml-2 text-sm px-3 py-1 rounded-xl bg-blue-100/60 backdrop-blur-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
              PSM
            </span>
            {networkBadge}
          </div>
          
          {/* Navigation - Always visible, wraps on small screens */}
          <nav className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : 'bg-blue-50/50 text-blue-700 hover:bg-blue-100/70 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/40'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Wallet */}
          <div className="flex items-center flex-shrink-0">
            <CustomConnectButton />
          </div>
        </div>
      </div>

      {/* Close network menu when clicking outside */}
      {isNetworkMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsNetworkMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;