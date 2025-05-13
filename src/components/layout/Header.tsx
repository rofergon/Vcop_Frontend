import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

interface HeaderProps {
  onConnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
  onDisconnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onConnectWallet,
  isWalletConnected,
  walletAddress = '',
  onDisconnectWallet
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', href: '#', current: true },
    { name: 'Swap', href: '#', current: false },
    { name: 'Stats', href: '#', current: false },
    { name: 'Learn', href: '#', current: false }
  ];
  
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">VCOP</span>
              <span className="ml-2 text-sm px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
                PSM
              </span>
            </div>
            
            <nav className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.current
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center">
            {isWalletConnected ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-gray-900"
                >
                  <span>{formatAddress(walletAddress)}</span>
                  <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={onDisconnectWallet}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Disconnect wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={onConnectWallet}>
                Connect Wallet
              </Button>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            {isWalletConnected && (
              <div className="mr-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-sm text-gray-900"
                >
                  <span>{formatAddress(walletAddress)}</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
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
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                item.current
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.name}
            </a>
          ))}
          
          {!isWalletConnected && (
            <div className="pt-2">
              <Button onClick={onConnectWallet} fullWidth>
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;