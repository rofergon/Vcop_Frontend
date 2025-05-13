// Mock data constants
export const TOKENS = {
  VCOP: {
    symbol: 'VCOP',
    name: 'Virtual Colombian Peso',
    balance: 2450.75,
    icon: '🇨🇴'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 543.21,
    icon: '💵'
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
  change24h: -0.05,
  isPegHealthy: true
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

// Import types
import { Transaction } from '../types';