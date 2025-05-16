import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { 
  Transaction, 
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionToast,
  type LifecycleStatus 
} from '@coinbase/onchainkit/transaction';
import { createLoanCalls } from '../../calls';

// ABI for reading max collateral
const COLLATERAL_MANAGER_ABI = [
  {
    name: 'getMaxVCOPforCollateral',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

export default function CreatePosition() {
  const { address } = useAccount();
  const [collateralAmount, setCollateralAmount] = useState('100');
  const [vcopAmount, setVcopAmount] = useState('0');
  const [utilizationRate, setUtilizationRate] = useState(80); // Percentage of max to use
  
  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS;
  
  // Parse collateral amount for contract read
  const parsedCollateral = BigInt(
    parseFloat(collateralAmount || '0') * 10 ** 6
  );
  
  // Get max VCOP that can be minted with provided collateral
  const { data: maxVcop, refetch } = useContractRead({
    address: collateralManagerAddress as `0x${string}`,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'getMaxVCOPforCollateral',
    args: [usdcAddress as `0x${string}`, parsedCollateral],
    query: {
      enabled: !!address && !!collateralManagerAddress && !!usdcAddress && parsedCollateral > 0n,
    }
  });

  // Update VCOP amount when collateral amount or utilization rate changes
  useEffect(() => {
    if (maxVcop) {
      const maxAmount = Number(maxVcop) / 10 ** 6;
      const calculatedAmount = (maxAmount * utilizationRate) / 100;
      setVcopAmount(calculatedAmount.toFixed(2));
    }
  }, [maxVcop, utilizationRate]);

  // Refetch when collateral amount changes
  useEffect(() => {
    if (address && collateralAmount && parseFloat(collateralAmount) > 0) {
      refetch();
    }
  }, [address, collateralAmount, refetch]);

  // Handle utilization slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUtilizationRate(Number(e.target.value));
  };

  // Handle transaction status changes
  const handleStatusChange = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status);
  }, []);

  // Handle successful transaction
  const handleTransactionSuccess = useCallback(() => {
    // Reset form
    setCollateralAmount('100');
    setVcopAmount('0');
  }, []);

  // Prepare contract calls
  const getCalls = useCallback(async () => {
    return createLoanCalls(collateralAmount, vcopAmount);
  }, [collateralAmount, vcopAmount]);

  // Calculate current collateralization ratio
  const collateralizationRatio = maxVcop && Number(vcopAmount) > 0
    ? (parsedCollateral * 100n / BigInt(Number(vcopAmount) * 10 ** 6)).toString()
    : "N/A";

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Create VCOP Loan</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">USDC Collateral Amount</label>
        <input
          type="number"
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          min="1"
          step="0.01"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Utilization Rate: {utilizationRate}%
        </label>
        <input
          type="range"
          min="50"
          max="95"
          value={utilizationRate}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-sm text-gray-500 mt-1">
          Lower utilization rate = safer position but less efficient.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">VCOP to Receive</label>
        <input
          type="text"
          value={vcopAmount}
          readOnly
          className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Collateralization Ratio: {collateralizationRatio}% 
          (minimum recommended: 150%)
        </p>
      </div>
      
      {address ? (
        <Transaction 
          chainId={baseSepolia.id} 
          calls={getCalls}
          onStatus={handleStatusChange}
          onSuccess={handleTransactionSuccess}
        >
          <TransactionButton className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700" text="Create Loan" />
          <TransactionSponsor />
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