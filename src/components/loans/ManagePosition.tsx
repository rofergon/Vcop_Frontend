import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast} from '@coinbase/onchainkit/transaction';
import { addCollateralCalls, withdrawCollateralCalls, repayLoanCalls } from '../../calls';

// ABI for reading position information
const COLLATERAL_MANAGER_ABI = [
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'positionId', type: 'uint256' }
    ],
    outputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'collateralAmount', type: 'uint256' },
      { name: 'vcopMinted', type: 'uint256' }
    ]
  },
  {
    name: 'getCurrentCollateralRatio',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'positionId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

interface ManagePositionProps {
  positionId?: number;
}

export default function ManagePosition({ positionId = 0 }: ManagePositionProps) {
  const { address } = useAccount();
  const [operation, setOperation] = useState('repay'); // 'add', 'withdraw', 'repay'
  const [amount, setAmount] = useState('0');
  
  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;
  
  // Get position data variables
  const [collateralToken, setCollateralToken] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<bigint>(0n);
  const [vcopMinted, setVcopMinted] = useState<bigint>(0n);
  const [collateralRatio, setCollateralRatio] = useState<bigint>(0n);
  
  // Fetch position data
  const { data: positionData, refetch: refetchPosition } = useContractRead({
    address: collateralManagerAddress as `0x${string}`,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'positions',
    args: [address as `0x${string}`, BigInt(positionId)],
    query: { 
      enabled: !!address && positionId !== undefined,
    }
  });
  
  // Get collateral ratio
  const { data: ratioData, refetch: refetchRatio } = useContractRead({
    address: collateralManagerAddress as `0x${string}`,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'getCurrentCollateralRatio',
    args: [address as `0x${string}`, BigInt(positionId)],
    query: { 
      enabled: !!address && positionId !== undefined,
    }
  });
  
  // Update state when data changes
  useEffect(() => {
    if (positionData && Array.isArray(positionData) && positionData.length >= 3) {
      setCollateralToken(positionData[0] as string);
      setCollateralAmount(positionData[1] as bigint);
      setVcopMinted(positionData[2] as bigint);
    }
  }, [positionData]);
  
  useEffect(() => {
    if (ratioData) {
      setCollateralRatio(ratioData as bigint);
    }
  }, [ratioData]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (address && positionId !== undefined) {
        refetchPosition();
        refetchRatio();
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [address, refetchPosition, refetchRatio, positionId]);

  // Get transaction calls based on selected operation
  const getCalls = useCallback(async () => {
    switch (operation) {
      case 'add':
        return addCollateralCalls(positionId, amount);
      case 'withdraw':
        return withdrawCollateralCalls(positionId, amount);
      case 'repay':
        return repayLoanCalls(positionId, amount);
      default:
        return [];
    }
  }, [operation, positionId, amount]);

  // Handle transaction success
  const handleSuccess = useCallback(() => {
    setAmount('0');
    refetchPosition();
    refetchRatio();
  }, [refetchPosition, refetchRatio]);

  // Format values for display
  const formattedCollateral = Number(collateralAmount) / 10**6;
  const formattedDebt = Number(vcopMinted) / 10**6;
  const formattedRatio = collateralRatio ? Number(collateralRatio) / 10000 : 0;
  
  // Determine if position is at risk
  const isPositionAtRisk = formattedRatio < 150;

  // Titles and labels based on operation
  const operationTitles = {
    add: 'Add Collateral',
    withdraw: 'Withdraw Collateral',
    repay: 'Repay Debt'
  };

  const operationLabels = {
    add: 'USDC to add as collateral',
    withdraw: 'USDC to withdraw from collateral',
    repay: 'VCOP to repay'
  };

  // Determine max amount based on operation
  const getMaxAmount = () => {
    if (operation === 'repay') {
      return formattedDebt;
    } else if (operation === 'withdraw') {
      // Allow withdrawing up to 80% of excess collateral
      const minimumCollateral = (formattedDebt * 150) / 100; // 150% minimum ratio
      const excessCollateral = formattedCollateral - minimumCollateral;
      return Math.max(0, excessCollateral * 0.8);
    }
    return 0;
  };

  // Set max amount
  const handleSetMax = () => {
    setAmount(getMaxAmount().toFixed(6));
  };

  // Return placeholder UI if no position ID provided
  if (positionId === undefined || positionId === 0) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">Manage Position</h2>
        <p className="text-center text-gray-500">Select a position to manage</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Manage Loan #{positionId}</h2>
      
      {/* Position information */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p>Collateral: {formattedCollateral.toFixed(6)} USDC</p>
        <p>Debt: {formattedDebt.toFixed(6)} VCOP</p>
        <p className={`font-medium ${isPositionAtRisk ? 'text-red-600' : 'text-green-600'}`}>
          Collateralization Ratio: {formattedRatio.toFixed(2)}%
          {isPositionAtRisk && ' (At Risk)'}
        </p>
      </div>
      
      {/* Operation selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Operation</label>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="add">Add Collateral</option>
          <option value="withdraw">Withdraw Collateral</option>
          <option value="repay">Repay Debt</option>
        </select>
      </div>
      
      {/* Amount input */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">{operationLabels[operation as keyof typeof operationLabels]}</label>
          {operation !== 'add' && (
            <button 
              type="button" 
              onClick={handleSetMax}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Max: {getMaxAmount().toFixed(6)}
            </button>
          )}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          min="0"
          step="0.000001"
        />
      </div>
      
      {/* Transaction button */}
      {address ? (
        <Transaction 
          chainId={baseSepolia.id} 
          calls={getCalls}
          onSuccess={handleSuccess}
        >
          <TransactionButton 
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700" 
            text={operationTitles[operation as keyof typeof operationTitles]} 
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