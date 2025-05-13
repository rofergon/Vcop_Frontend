import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Initialize dark mode based on user preference or system preference
  useEffect(() => {
    // Check if user has previously set a preference
    const darkModePreference = localStorage.getItem('darkMode');
    
    if (darkModePreference !== null) {
      // Use stored preference
      const prefersDarkMode = darkModePreference === 'true';
      setIsDarkMode(prefersDarkMode);
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
      }
    } else {
      // Check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);
  
  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  };
  
  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    // Save user preference
    localStorage.setItem('darkMode', String(newDarkModeState));
    
    // Apply dark mode class to html element
    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Header 
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
        />
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:text-white z-10"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;