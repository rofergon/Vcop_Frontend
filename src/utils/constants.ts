// Import types
import { Transaction, ReserveData, PriceData, PSMStats } from '../types';

// Mock data constants
export const TOKENS = {
  VCOP: {
    symbol: 'VCOP',
    name: 'Virtual Colombian Peso',
    balance: 2450.75,
    icon: '🇨🇴',
    decimals: 6
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 543.21,
    icon: '💵',
    decimals: 6
  }
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'swap',
    fromToken: 'USDC',
    toToken: 'VCOP',
    fromAmount: 100,
    toAmount: 429500,
    status: 'completed',
    timestamp: Date.now() - 3600000,
    hash: '0x123...abc'
  },
  {
    id: '2',
    type: 'approval',
    fromToken: 'USDC',
    toToken: 'USDC',
    fromAmount: 1000,
    toAmount: 1000,
    status: 'completed',
    timestamp: Date.now() - 7200000,
    hash: '0x456...def'
  },
  {
    id: '3',
    type: 'swap',
    fromToken: 'VCOP',
    toToken: 'USDC',
    fromAmount: 215000,
    toAmount: 50,
    status: 'pending',
    timestamp: Date.now() - 600000,
    hash: '0x789...ghi'
  }
];

export const MOCK_RESERVE_DATA: ReserveData = {
  vcop: 5000000000,
  usdc: 1162791,
  totalValueUSD: 1162791
};

export const MOCK_PRICE_DATA: PriceData = {
  price: 4295.0,
  change: -0.05,
  isPegHealthy: true,
  deviation: 0.01
};

export const MOCK_PSM_STATS: PSMStats = {
  psmFee: 0.001, // 0.1%
  psmMaxSwapAmount: 100000, // USDC
  totalVolumeSwapped: 12457890
};

export const USDC_TO_VCOP_RATE = 4295;

// Time constants
export const ONE_DAY_MS = 86400000;
export const ONE_HOUR_MS = 3600000;

// Contract addresses from .env
export const CONTRACT_ADDRESSES = {
  USDC: import.meta.env.VITE_USDC_ADDRESS || '0x5405e3a584014c8659BA10591c1b7D55cB1cFc0d',
  VCOP: import.meta.env.VITE_VCOP_ADDRESS || '0x3D384BeB1Ba0197e6a87668E1D68267164c8B776',
  
  PRICE_CALCULATOR: import.meta.env.VITE_VCOP_PRICE_CALCULATOR_ADDRESS || '0x0Df3Ee10A5eEd46DDc5B3ea8d471ea657EF5a544',
  VCOP_COLLATERAL_MANAGER: import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS || '0x8f17E2128a4F917ec4147c15FC90bADd79E7F090',
};

// Chain configuration
export const CHAIN_CONFIG = {
  RPC_URL: 'https://sepolia.base.org',
  CHAIN_ID: 84531, // Base Sepolia
  EXPLORER_URL: 'https://sepolia.basescan.org',
};

// Blockchain constants
export const BLOCKCHAIN_CONSTANTS = {
  CONVERSION_RATE: 4200, // 1 USDC = 4295 VCOP (Colombian Peso rate)
  REFRESH_INTERVAL: 10000, // Refresh blockchain data every 10 seconds
  TOKEN_DECIMALS: 6, // Both USDC and VCOP have 6 decimals
};