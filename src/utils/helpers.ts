/**
 * Format a number as currency with proper decimal places
 */
export const formatCurrency = (value: number, currency = 'COP', decimals = 0): string => {
  if (currency === 'USDC') {
    decimals = 2;
    currency = 'USD';
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a blockchain address to show abbreviated form
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format a timestamp to relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Calculate the output amount based on input, rate and fee
 */
export const calculateSwapOutput = (
  inputAmount: number,
  rate: number,
  fee: number,
  isVcopToUsdc: boolean
): number => {
  if (!inputAmount || inputAmount <= 0) return 0;
  
  const feeAmount = inputAmount * fee;
  const netInput = inputAmount - feeAmount;
  
  if (isVcopToUsdc) {
    return netInput / rate;
  } else {
    return netInput * rate;
  }
};

/**
 * Simulate a blockchain transaction promise
 */
export const simulateTransaction = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + 
                 Math.random().toString(16).substring(2, 6);
      resolve(hash);
    }, 2000);
  });
};