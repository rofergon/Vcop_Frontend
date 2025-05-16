import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction
} from '@coinbase/onchainkit/transaction';
import { formatUnits } from 'viem';
import {
  BASE_SEPOLIA_CHAIN_ID,
  generateSwapUsdcForVcopCalls,
  generateSwapVcopForUsdcCalls
} from '../../utils/transactionUtils';

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
  },
  {
    name: 'psmPaused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  }
];

export default function PSMSwapper() {
  const { address, isConnected } = useAccount();
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy'); // buy = USDC -> VCOP, sell = VCOP -> USDC
  const [amount, setAmount] = useState<string>('0');
  const [expectedOutput, setExpectedOutput] = useState<string>('0');
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  
  // PSM stats state
  const [vcopReserve, setVcopReserve] = useState<bigint>(0n);
  const [collateralReserve, setCollateralReserve] = useState<bigint>(0n);
  const [lastOperation, setLastOperation] = useState<bigint>(0n);
  const [totalSwaps, setTotalSwaps] = useState<bigint>(0n);
  const [fee, setFee] = useState<bigint>(0n);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Get contract address from environment variables
  const psmHookAddress = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`;
  
  // Logs para depuración
  useEffect(() => {
    console.log("PSMSwapper component mounted");
    console.log("PSM Hook address:", psmHookAddress);
    
    if (address) {
      console.log("User address:", address);
    }
  }, [address, psmHookAddress]);
  
  // Fetch PSM stats
  const { data: psmStats, refetch: refetchStats } = useContractRead({
    address: psmHookAddress,
    abi: PSM_HOOK_ABI,
    functionName: 'getPSMStats',
    query: {
      enabled: !!psmHookAddress,
    }
  });
  
  // Fetch PSM fee
  const { data: psmFee } = useContractRead({
    address: psmHookAddress,
    abi: PSM_HOOK_ABI,
    functionName: 'psmFee',
    query: {
      enabled: !!psmHookAddress,
    }
  });
  
  // Fetch PSM paused state
  const { data: psmPaused } = useContractRead({
    address: psmHookAddress,
    abi: PSM_HOOK_ABI,
    functionName: 'psmPaused',
    query: {
      enabled: !!psmHookAddress,
    }
  });
  
  // Update state when PSM stats data changes
  useEffect(() => {
    if (psmStats && Array.isArray(psmStats) && psmStats.length >= 4) {
      setVcopReserve(psmStats[0] as bigint);
      setCollateralReserve(psmStats[1] as bigint);
      setLastOperation(psmStats[2] as bigint);
      setTotalSwaps(psmStats[3] as bigint);
      
      console.log("PSM Stats updated:", {
        vcopReserve: Number(formatUnits(psmStats[0] as bigint, 6)),
        collateralReserve: Number(formatUnits(psmStats[1] as bigint, 6)),
        lastOperation: Number(psmStats[2]),
        totalSwaps: Number(psmStats[3])
      });
    }
  }, [psmStats]);
  
  // Update fee state when PSM fee data changes
  useEffect(() => {
    if (psmFee !== undefined) {
      setFee(psmFee as bigint);
      console.log("PSM Fee updated:", Number(psmFee) / 1000000, "%");
    }
  }, [psmFee]);
  
  // Update paused state when PSM paused data changes
  useEffect(() => {
    if (psmPaused !== undefined) {
      setIsPaused(psmPaused as boolean);
      console.log("PSM Paused state updated:", psmPaused);
    }
  }, [psmPaused]);
  
  // Calculate expected output amount when input or direction changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const parsedAmount = parseFloat(amount);
      const feeRate = Number(fee) / 1000000; // fee is in basis points (1% = 10000)
      const feeAmount = parsedAmount * feeRate;
      const outputAmount = parsedAmount - feeAmount;
      
      console.log("Calculating expected output:", {
        inputAmount: parsedAmount,
        feeRate: feeRate,
        feeAmount: feeAmount,
        outputAmount: outputAmount
      });
      
      setExpectedOutput(outputAmount.toFixed(6));
    } else {
      setExpectedOutput('0');
    }
  }, [amount, fee, direction]);
  
  // Get transaction calls based on selected direction
  const getCalls = useCallback(async () => {
    console.log(`Generating PSM swap calls for ${direction === 'buy' ? 'USDC -> VCOP' : 'VCOP -> USDC'} with amount ${amount}`);
    
    try {
      const calls = direction === 'buy' 
        ? generateSwapUsdcForVcopCalls(amount)
        : generateSwapVcopForUsdcCalls(amount);
      
      console.log("Generated calls:", calls);
      return calls;
    } catch (error) {
      console.error("Error generating calls:", error);
      return [];
    }
  }, [direction, amount]);
  
  // Handle transaction status changes
  const handleStatusChange = useCallback((status: any) => {
    console.log("Transaction status changed:", status);
    setTransactionStatus(status.statusName || "unknown");
  }, []);
  
  // Handle transaction success
  const handleSuccess = useCallback(() => {
    console.log("PSM swap transaction successful!");
    // Reset amount
    setAmount('0');
    
    // Refresh stats
    refetchStats();
  }, [refetchStats]);
  
  // Format values for display
  const formattedVcopReserve = Number(formatUnits(vcopReserve, 6)).toFixed(2);
  const formattedCollateralReserve = Number(formatUnits(collateralReserve, 6)).toFixed(2);
  const formattedFeePercent = (Number(fee) / 10000).toFixed(2); // 1% = 10000
  
  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Never';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };
  
  // Handle max amount click
  const handleMaxAmount = () => {
    console.log("Setting max amount for", direction);
    
    if (direction === 'buy') {
      // Max buy is determined by collateral reserve
      const maxAmount = Number(formatUnits(collateralReserve, 6)) * 0.9; // 90% to be safe
      console.log("Max buy amount (90% of collateral reserve):", maxAmount);
      setAmount(maxAmount.toFixed(6));
    } else {
      // Max sell is determined by VCOP reserve
      const maxAmount = Number(formatUnits(vcopReserve, 6)) * 0.9; // 90% to be safe
      console.log("Max sell amount (90% of VCOP reserve):", maxAmount);
      setAmount(maxAmount.toFixed(6));
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Peg Stability Module</h2>
      
      {isPaused ? (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
          PSM operations are currently paused.
        </div>
      ) : (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
          PSM is active. Current fee: {formattedFeePercent}%
        </div>
      )}
      
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">VCOP Reserve:</span>
          <span className="text-sm font-medium">{formattedVcopReserve} VCOP</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">USDC Reserve:</span>
          <span className="text-sm font-medium">{formattedCollateralReserve} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Last Operation:</span>
          <span className="text-sm">{formatTimestamp(lastOperation)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Swaps:</span>
          <span className="text-sm">{totalSwaps.toString()}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`p-2 rounded-md ${direction === 'buy' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setDirection('buy')}
            disabled={isPaused}
          >
            Buy VCOP with USDC
          </button>
          <button
            className={`p-2 rounded-md ${direction === 'sell' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setDirection('sell')}
            disabled={isPaused}
          >
            Sell VCOP for USDC
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {direction === 'buy' ? 'USDC Amount' : 'VCOP Amount'}
          </label>
          <button 
            onClick={handleMaxAmount}
            className="text-xs text-blue-600 hover:text-blue-800"
            disabled={isPaused}
          >
            Max
          </button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          min="0"
          step="0.000001"
          disabled={isPaused}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {direction === 'buy' ? 'VCOP to Receive' : 'USDC to Receive'}
        </label>
        <input
          type="text"
          value={expectedOutput}
          readOnly
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Includes a fee of {formattedFeePercent}%
        </p>
      </div>
      
      {/* Estado actual de la transacción para debug */}
      {transactionStatus && (
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="text-sm">Estado actual: <span className="font-medium">{transactionStatus}</span></p>
        </div>
      )}
      
      {isConnected && !isPaused ? (
        <Transaction 
          chainId={BASE_SEPOLIA_CHAIN_ID}
          calls={getCalls}
          onStatus={handleStatusChange}
          onSuccess={handleSuccess}
        >
          <TransactionButton 
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md"
            text={direction === 'buy' ? 'Buy VCOP' : 'Sell VCOP'}
          />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
          <TransactionToast>
            <TransactionToastIcon />
            <TransactionToastLabel />
            <TransactionToastAction />
          </TransactionToast>
        </Transaction>
      ) : (
        <button 
          className="w-full py-2 px-4 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
          disabled
        >
          {!isConnected ? 'Connect Wallet First' : 'PSM Operations Paused'}
        </button>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>What is PSM?</strong> The Peg Stability Module enables buying and selling VCOP at a rate near 1:1 with the Colombian Peso.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-700">
          <li>Buy VCOP: Exchange USDC for newly minted VCOP</li>
          <li>Sell VCOP: Exchange VCOP for USDC from reserves</li>
        </ul>
      </div>
    </div>
  );
} 