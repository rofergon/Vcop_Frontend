export interface TokenInfo {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
  decimals: number;
}

export interface Transaction {
  id: string;
  type: 'swap' | 'approval';
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  hash: string;
}

export interface ReserveData {
  vcop: number;
  usdc: number;
  totalValueUSD: number;
}

export interface PriceData {
  price: number;
  change: number;
  isPegHealthy: boolean;
  deviation: number;
  tick?: number;
}

export interface PSMStats {
  psmFee: number;
  psmMaxSwapAmount: number;
  totalVolumeSwapped: number;
}