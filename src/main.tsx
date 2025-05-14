import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Providers } from './providers';
import '@coinbase/onchainkit/styles.css';
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext';

// Wrapper component to get dark mode from context and pass to Providers
const AppWithProviders = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <Providers isDarkMode={isDarkMode}>
      <App />
    </Providers>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DarkModeProvider>
      <AppWithProviders />
    </DarkModeProvider>
  </StrictMode>
);
