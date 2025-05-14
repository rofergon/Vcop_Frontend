import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import CustomConnectButton from '../wallet/ConnectButton';
import { baseSepolia, base } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const location = useLocation();
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const navItems = [
    { name: 'Dashboard', path: '/', current: location.pathname === '/' },
    { name: 'Préstamos', path: '/loans', current: location.pathname === '/loans' },
    { name: 'Swap', path: '/swap', current: location.pathname === '/swap' },
    { name: 'Stats', path: '/stats', current: location.pathname === '/stats' }
  ];

  // Determinar la red actual basándose en el chainId
  const isTestnet = chainId === baseSepolia.id;
  const isMainnet = chainId === base.id;
  
  // Si no estamos conectados, mostramos la red configurada en el provider (baseSepolia)
  const networkName = isMainnet ? "Mainnet" : "Sepolia";
  
  // Personalizar el estilo según la red
  const networkBadge = (
    <div className="relative">
      <button 
        onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
        className={`flex items-center ml-2 text-xs px-2 py-1 rounded-full cursor-pointer ${
          isMainnet 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
        } font-medium`}
      >
        {networkName}
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>
      
      {/* Dropdown de selección de red */}
      {isNetworkMenuOpen && isConnected && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                switchChain({ chainId: baseSepolia.id });
                setIsNetworkMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                isTestnet ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } text-gray-900 dark:text-gray-200`}
            >
              Base Sepolia
            </button>
            <button
              onClick={() => {
                switchChain({ chainId: base.id });
                setIsNetworkMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${
                isMainnet ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } text-gray-900 dark:text-gray-200`}
            >
              Base Mainnet
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">VCOP</Link>
            <span className="ml-2 text-sm px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
              PSM
            </span>
            {networkBadge}
          </div>
          
          {/* Desktop Navigation - Always visible on desktop */}
          <nav className="flex-1 flex justify-center mx-4">
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-white bg-blue-600 dark:bg-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Wallet and Mobile Menu */}
          <div className="flex items-center">
            <CustomConnectButton />
            
            {/* Mobile menu button - only visible on mobile */}
            <div className="ml-2 md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - only contains navigation items */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                item.current
                  ? 'text-white bg-blue-600 dark:bg-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
              aria-current={item.current ? 'page' : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Cerrar el menú de redes si se hace clic fuera del menú */}
      {isNetworkMenuOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsNetworkMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;