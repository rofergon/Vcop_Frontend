import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  };
  
  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 text-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      <Header 
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:text-white"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      <main className="flex-grow">
        <Dashboard />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;