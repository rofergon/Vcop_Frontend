import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ReserveData } from '../types';
import MockERC20Abi from '../Abis /simplified_abi_MockERC20.json';
import VCOPAbi from '../Abis /simplified_abi_VCOPCollateralized.json';

// Contract addresses on Base Sepolia
const USDC_ADDRESS = '0xE5964b67F1F121A54da973652F4B839C4F453Ca6';
const VCOP_ADDRESS = '0xd1F263942EE26d34B56f50F05D59E84b10FF9fD1';
// Reserve contract address
const RESERVE_ADDRESS = '0xd447ef9ab1dcc346a57ecdab27f02c20e6d2dbf6';
const CONVERSION_RATE = 4295; // 1 USDC = 4295 VCOP (Colombian Peso rate)

// Format from wei with proper decimals
export function formatFromWei(value: bigint, decimals: number): number {
  return Number(value) / 10**decimals;
}

// Call function to read from contract
export async function callReadFunction(
  contractAddress: string, 
  abi: any[], 
  functionName: string, 
  args: any[] = []
): Promise<any> {
  try {
    // Create provider using ethers.js - no need to depend on window.ethereum
    const ethers = await import('ethers');
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Call the read function
    const result = await contract[functionName](...args);
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

// Hook to fetch reserve data from contracts
export function useReserveData(): { reserveData: ReserveData | null, loading: boolean, error: Error | null } {
  const [reserveData, setReserveData] = useState<ReserveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useAccount();

  const fetchReserveData = useCallback(async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch token balances using contract ABIs - query balanceOf for reserve contract
      const usdcBalance = await callReadFunction(
        USDC_ADDRESS,
        MockERC20Abi,
        'balanceOf',
        [RESERVE_ADDRESS]
      );
      
      const vcopBalance = await callReadFunction(
        VCOP_ADDRESS,
        VCOPAbi,
        'balanceOf',
        [RESERVE_ADDRESS]
      );
      
      // Format balances (both USDC and VCOP have 6 decimals)
      const usdcFormatted = formatFromWei(BigInt(usdcBalance.toString()), 6);
      const vcopFormatted = formatFromWei(BigInt(vcopBalance.toString()), 6);
      
      // Calculate total value in USD (using USDC as dollar value)
      const totalValueUSD = usdcFormatted;
      
      setReserveData({
        usdc: usdcFormatted,
        vcop: vcopFormatted,
        totalValueUSD
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reserve data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching reserve data'));
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchReserveData();
    
    // Set up polling to refresh data every 5 seconds
    const interval = setInterval(fetchReserveData, 5000);
    
    return () => clearInterval(interval);
  }, [fetchReserveData]);

  return { reserveData, loading, error };
}

// Create Call parameters for OnchainKit Transaction component
export function createTokenBalanceCall(tokenAddress: string, accountAddress: string) {
  return {
    to: tokenAddress as `0x${string}`,
    data: `0x70a08231000000000000000000000000${accountAddress.slice(2)}` as `0x${string}`,
  };
} 