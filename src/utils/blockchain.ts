import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ReserveData } from '../types';
import MockERC20Abi from '../Abis /simplified_abi_MockERC20.json';
import VCOPAbi from '../Abis /simplified_abi_VCOPCollateralized.json';
import VCOPCollateralManagerAbi from '../Abis /simplified_abi_VCOPCollateralManager.json';
import { CONTRACT_ADDRESSES, BLOCKCHAIN_CONSTANTS, CHAIN_CONFIG } from './constants';

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
    const provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.RPC_URL);
    
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
      
      // Fetch PSM reserves using VCOPCollateralManager contract
      const usdcPsmReserves = await callReadFunction(
        CONTRACT_ADDRESSES.VCOP_COLLATERAL_MANAGER,
        VCOPCollateralManagerAbi,
        'psmReserves',
        [CONTRACT_ADDRESSES.USDC]
      );
      
      // Format data from psmReserves
      const usdcFormatted = formatFromWei(BigInt(usdcPsmReserves.collateralAmount.toString()), BLOCKCHAIN_CONSTANTS.TOKEN_DECIMALS);
      const vcopFormatted = formatFromWei(BigInt(usdcPsmReserves.vcopAmount.toString()), BLOCKCHAIN_CONSTANTS.TOKEN_DECIMALS);
      
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
    
    // Set up polling to refresh data using constant interval
    const interval = setInterval(fetchReserveData, BLOCKCHAIN_CONSTANTS.REFRESH_INTERVAL);
    
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