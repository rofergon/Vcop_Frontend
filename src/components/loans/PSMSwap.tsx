import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  type LifecycleStatus 
} from '@coinbase/onchainkit/transaction';
import { swapVcopToUsdcCalls, swapUsdcToVcopCalls } from '../../calls';

// ABI for PSM stats
const PSM_HOOK_ABI = [
  {
    name: 'getPSMStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'vcopReserve', type: 'uint256' },
      { name: 'collateralReserve', type: 'uint256' },
      { name: 'lastOperationTimestamp', type: 'uint256' },
      { name: 'totalSwapsCount', type: 'uint256' }
    ]
  },
  {
    name: 'psmFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// Type definitions for contract return data
type PSMStatsData = [bigint, bigint, bigint, bigint]; // [vcopReserve, collateralReserve, lastOpTimestamp, totalSwaps]
type FeeData = bigint;

// Simulate price feed
const USD_TO_COP_RATE = 4200; // 1 USD = 4200 COP
const VCOP_TO_COP_RATE = 1; // 1 VCOP = 1 COP (ideally)
const PSM_FEE = 0.001; // 0.1% fee

export default function PSMSwap() {
  const { address } = useAccount();
  const [direction, setDirection] = useState<'toVCOP' | 'fromVCOP'>('toVCOP');
  const [amount, setAmount] = useState('0');
  const [output, setOutput] = useState('0');
  
  // PSM data state
  const [vcopReserve, setVcopReserve] = useState<bigint>(0n);
  const [collateralReserve, setCollateralReserve] = useState<bigint>(0n);
  const [lastOperation, setLastOperation] = useState<bigint>(0n);
  const [totalSwaps, setTotalSwaps] = useState<bigint>(0n);
  const [feePercentage, setFeePercentage] = useState<number>(0.1); // Default to 0.1%
  
  // Contract addresses from environment variables
  const psmHookAddress = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS;
  
  // Get PSM stats
  const { data: psmStats, refetch: refetchStats } = useContractRead({
    address: psmHookAddress as `0x${string}`,
    abi: PSM_HOOK_ABI,
    functionName: 'getPSMStats',
    query: {
      enabled: !!psmHookAddress,
    }
  });
  
  // Get PSM fee
  const { data: psmFee } = useContractRead({
    address: psmHookAddress as `0x${string}`,
    abi: PSM_HOOK_ABI,
    functionName: 'psmFee',
    query: {
      enabled: !!psmHookAddress,
    }
  });
  
  // Update PSM stats when data changes
  useEffect(() => {
    if (psmStats && Array.isArray(psmStats) && psmStats.length >= 4) {
      setVcopReserve(psmStats[0] as bigint);
      setCollateralReserve(psmStats[1] as bigint);
      setLastOperation(psmStats[2] as bigint);
      setTotalSwaps(psmStats[3] as bigint);
    }
  }, [psmStats]);
  
  // Update fee percentage when fee data changes
  useEffect(() => {
    if (psmFee) {
      setFeePercentage(Number(psmFee) / 10000);
    }
  }, [psmFee]);
  
  // Update output amount when input or direction changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      // Apply fee
      const inputAmount = parseFloat(amount);
      const fee = inputAmount * (feePercentage / 100);
      const outputAmount = inputAmount - fee;
      setOutput(outputAmount.toFixed(6));
    } else {
      setOutput('0');
    }
  }, [amount, feePercentage, direction]);

  // Handle swap direction toggle
  const toggleDirection = () => {
    setDirection(prev => prev === 'toVCOP' ? 'fromVCOP' : 'toVCOP');
    setAmount('0');
    setOutput('0');
  };

  // Prepare transaction calls
  const getCalls = useCallback(async () => {
    if (direction === 'toVCOP') {
      return swapUsdcToVcopCalls(amount);
    } else {
      return swapVcopToUsdcCalls(amount);
    }
  }, [direction, amount]);

  // Handle transaction success
  const handleSuccess = useCallback(() => {
    setAmount('0');
    setOutput('0');
    refetchStats();
  }, [refetchStats]);

  // Format values for display
  const formattedVcopReserve = Number(vcopReserve) / 10**6;
  const formattedCollateralReserve = Number(collateralReserve) / 10**6;
  
  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Never';
    
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };
  
  // Calculate max input based on reserves and direction
  const getMaxInput = () => {
    if (direction === 'toVCOP') {
      // When swapping USDC to VCOP, max is collateral reserve
      return formattedCollateralReserve;
    } else {
      // When swapping VCOP to USDC, max is VCOP minted
      return formattedVcopReserve;
    }
  };
  
  // Set max amount
  const handleSetMax = () => {
    const maxValue = getMaxInput();
    // Use 90% of max to account for fees and slippage
    setAmount((maxValue * 0.9).toFixed(6));
  };

  // Define labels based on direction
  const inputTokenLabel = direction === 'toVCOP' ? 'USDC' : 'VCOP';
  const outputTokenLabel = direction === 'toVCOP' ? 'VCOP' : 'USDC';

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">PSM Swap</h2>
      
      {/* PSM Stats */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p>VCOP Reserve: {formattedVcopReserve.toFixed(2)} VCOP</p>
        <p>USDC Reserve: {formattedCollateralReserve.toFixed(2)} USDC</p>
        <p className="text-sm text-gray-500 mt-1">
          Last Operation: {formatTimestamp(lastOperation)}
        </p>
        <p className="text-sm text-gray-500">
          Total Swaps: {totalSwaps.toString()}
        </p>
      </div>
      
      {/* Swap Direction Toggle */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={toggleDirection}
          className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg transition-colors hover:bg-blue-200"
        >
          <span className="mr-2">{inputTokenLabel}</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="ml-2">{outputTokenLabel}</span>
        </button>
      </div>
      
      {/* Amount Input */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            {inputTokenLabel} Amount
          </label>
          <button 
            type="button" 
            onClick={handleSetMax}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Max: {getMaxInput().toFixed(6)}
          </button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          min="0"
          step="0.000001"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fee: {feePercentage}%
        </p>
      </div>
      
      {/* Output Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {outputTokenLabel} to Receive
        </label>
        <input
          type="text"
          value={output}
          readOnly
          className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm"
        />
      </div>
      
      {/* Transaction Button */}
      {address ? (
        <Transaction 
          chainId={baseSepolia.id} 
          calls={getCalls}
          onSuccess={handleSuccess}
        >
          <TransactionButton 
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700" 
            text={`Swap ${inputTokenLabel} for ${outputTokenLabel}`} 
          />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
          <TransactionToast />
        </Transaction>
      ) : (
        <p className="text-center text-red-500">Connect your wallet to continue</p>
      )}
    </div>
  );
} 