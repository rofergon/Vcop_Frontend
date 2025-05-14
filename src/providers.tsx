import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'viem/chains';

interface ProvidersProps {
  children: ReactNode;
  isDarkMode?: boolean;
}

export function Providers({ children, isDarkMode = false }: ProvidersProps) {
  return (
    <OnchainKitProvider
      apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
      rpcUrl="https://sepolia.base.org"
      config={{
        appearance: {
          name: 'VCOP PSM', // Displayed in modal header
          logo: '/vcop-logo.png', // Replace with your actual logo path
          mode: isDarkMode ? 'dark' : 'light', // Use app's dark mode state instead of 'auto'
          theme: 'default',
        },
        wallet: {
          display: 'modal',
          termsUrl: 'https://yourdomain.com/terms',
          privacyUrl: 'https://yourdomain.com/privacy',
          supportedWallets: {
            rabby: true,
            trust: true,
            frame: true,
          },
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
} 