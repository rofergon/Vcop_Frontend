export interface TokenInfo {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
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
  change24h: number;
  isPegHealthy: boolean;
}

export interface PSMStats {
  psmFee: number;
  psmMaxSwapAmount: number;
  totalVolumeSwapped: number;
}