import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import LoansPage from './pages/LoansPage';
import SwapPage from './pages/SwapPage';
import StatsPage from './pages/StatsPage';
import LiquidationsPage from './pages/LiquidationsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from './context/DarkModeContext';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800/80 dark:text-white z-10 border border-blue-100/50 dark:border-blue-800/30"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/liquidations" element={<LiquidationsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;