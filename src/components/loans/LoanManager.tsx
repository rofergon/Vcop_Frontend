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
  generateAddCollateralCalls,
  generateWithdrawCollateralCalls,
  generateRepayDebtCalls
} from '../../utils/transactionUtils';

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
  },
  {
    name: 'positionCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

type Operation = 'add' | 'withdraw' | 'repay';

type Position = {
  collateralToken: string;
  collateralAmount: bigint;
  vcopMinted: bigint;
  ratio: bigint;
};

// Añadir el tipo para una llamada de transacción
type TransactionCall = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
};

export default function LoanManager() {
  const { address, isConnected } = useAccount();
  const [positionId, setPositionId] = useState<number>(0);
  const [operation, setOperation] = useState<Operation>('add');
  const [amount, setAmount] = useState<string>('0');
  const [positionData, setPositionData] = useState<Position | null>(null);
  const [totalPositions, setTotalPositions] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  
  // Get contract address from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
  
  // Logs para depuración
  useEffect(() => {
    console.log("LoanManager component mounted");
    console.log("Collateral Manager address:", collateralManagerAddress);
    
    if (address) {
      console.log("User address:", address);
    }
  }, [address, collateralManagerAddress]);
  
  // Fetch user's position count
  const { data: positionCountData, refetch: refetchCount } = useContractRead({
    address: collateralManagerAddress,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'positionCount',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!collateralManagerAddress,
    }
  });
  
  // Fetch position data
  const { data: rawPositionData, refetch: refetchPosition } = useContractRead({
    address: collateralManagerAddress,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'positions',
    args: [address as `0x${string}`, BigInt(positionId)],
    query: {
      enabled: !!address && !!collateralManagerAddress && positionId >= 0,
    }
  });
  
  // Fetch collateral ratio
  const { data: ratioData, refetch: refetchRatio } = useContractRead({
    address: collateralManagerAddress,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'getCurrentCollateralRatio',
    args: [address as `0x${string}`, BigInt(positionId)],
    query: {
      enabled: !!address && !!collateralManagerAddress && positionId >= 0,
    }
  });
  
  // Update total positions when position count data changes
  useEffect(() => {
    if (positionCountData) {
      const count = Number(positionCountData);
      console.log(`User has ${count} positions`);
      setTotalPositions(count);
    }
  }, [positionCountData]);
  
  // Update position data when raw data changes
  useEffect(() => {
    if (rawPositionData && Array.isArray(rawPositionData) && rawPositionData.length >= 3 && ratioData) {
      const position = {
        collateralToken: rawPositionData[0] as string,
        collateralAmount: rawPositionData[1] as bigint,
        vcopMinted: rawPositionData[2] as bigint,
        ratio: ratioData as bigint
      };
      
      console.log(`Position #${positionId} data:`, {
        collateralToken: position.collateralToken,
        collateralAmount: Number(formatUnits(position.collateralAmount, 6)),
        vcopMinted: Number(formatUnits(position.vcopMinted, 6)),
        ratio: Number(position.ratio) / 10000
      });
      
      setPositionData(position);
    } else {
      console.log(`No valid data for position #${positionId} or missing ratio data`);
      setPositionData(null);
    }
  }, [rawPositionData, ratioData, positionId]);
  
  // Get transaction calls based on selected operation
  const getCalls = useCallback(async () => {
    console.log(`Generating ${operation} calls for position #${positionId} with amount ${amount}`);
    
    try {
      let calls: TransactionCall[] = []; // Especificar el tipo aquí
      switch (operation) {
        case 'add':
          calls = generateAddCollateralCalls(positionId, amount);
          break;
        case 'withdraw':
          calls = generateWithdrawCollateralCalls(positionId, amount);
          break;
        case 'repay':
          calls = generateRepayDebtCalls(positionId, amount);
          break;
        default:
          calls = [];
      }
      console.log("Generated calls:", calls);
      return calls;
    } catch (error) {
      console.error("Error generating calls:", error);
      return [];
    }
  }, [operation, positionId, amount]);
  
  // Handle transaction status changes
  const handleStatusChange = useCallback((status: any) => {
    console.log("Transaction status changed:", status);
    setTransactionStatus(status.statusName || "unknown");
  }, []);
  
  // Handle transaction success
  const handleSuccess = useCallback(() => {
    console.log("Transaction successful!");
    // Reset amount
    setAmount('0');
    
    // Refresh data
    console.log("Refreshing position data...");
    refetchPosition();
    refetchRatio();
    refetchCount();
  }, [refetchPosition, refetchRatio, refetchCount]);
  
  // Handle position ID change
  const handlePositionIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    console.log(`Changing to position #${newId}`);
    setPositionId(newId);
  };
  
  // Format values for display
  const formattedCollateral = positionData ? Number(formatUnits(positionData.collateralAmount, 6)).toFixed(6) : '0';
  const formattedVcop = positionData ? Number(formatUnits(positionData.vcopMinted, 6)).toFixed(6) : '0';
  const formattedRatio = positionData ? (Number(positionData.ratio) / 10000).toFixed(2) : '0';
  const isPositionAtRisk = positionData ? Number(positionData.ratio) < 1500000 : false; // < 150%
  
  // Handle max amount button click
  const handleMaxAmount = () => {
    if (!positionData) return;
    
    if (operation === 'repay') {
      // Max repay is the full debt amount
      console.log(`Setting max repay amount: ${formattedVcop} VCOP`);
      setAmount(formattedVcop);
    } else if (operation === 'withdraw') {
      // Calculate max withdrawable keeping a 150% ratio
      if (positionData.vcopMinted > 0n) {
        const minCollateralNeeded = positionData.vcopMinted * 1500000n / 1000000n;
        if (positionData.collateralAmount > minCollateralNeeded) {
          const withdrawable = positionData.collateralAmount - minCollateralNeeded;
          const formattedWithdrawable = formatUnits(withdrawable, 6);
          console.log(`Setting max withdraw amount: ${formattedWithdrawable} USDC`);
          setAmount(formattedWithdrawable);
        } else {
          console.log('Cannot withdraw: minimum collateralization requirement not met');
          setAmount('0');
        }
      } else {
        // If no VCOP minted, all collateral can be withdrawn
        console.log(`Setting max withdraw amount (full collateral): ${formattedCollateral} USDC`);
        setAmount(formattedCollateral);
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Loan Position</h2>
      
      {totalPositions === 0 ? (
        <p className="text-center text-gray-500 mb-4">You have no positions. Create one first.</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Position</label>
            <select
              value={positionId}
              onChange={handlePositionIdChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: totalPositions }, (_, i) => (
                <option key={i} value={i}>Position #{i}</option>
              ))}
            </select>
          </div>
          
          {positionData && positionData.collateralAmount > 0n ? (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Collateral:</span>
                <span className="text-sm font-medium">{formattedCollateral} USDC</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Debt:</span>
                <span className="text-sm font-medium">{formattedVcop} VCOP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collateralization:</span>
                <span className={`text-sm font-medium ${isPositionAtRisk ? 'text-red-500' : 'text-green-500'}`}>
                  {formattedRatio}% {isPositionAtRisk && '(At Risk)'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 mb-4">
              {positionId < totalPositions ? 'Position fully repaid or invalid' : 'Invalid position ID'}
            </p>
          )}
          
          {positionData && positionData.collateralAmount > 0n && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`p-2 rounded-md ${operation === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      console.log("Selected operation: add collateral");
                      setOperation('add');
                    }}
                  >
                    Add Collateral
                  </button>
                  <button
                    className={`p-2 rounded-md ${operation === 'withdraw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      console.log("Selected operation: withdraw collateral");
                      setOperation('withdraw');
                    }}
                  >
                    Withdraw
                  </button>
                  <button
                    className={`p-2 rounded-md ${operation === 'repay' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      console.log("Selected operation: repay debt");
                      setOperation('repay');
                    }}
                  >
                    Repay Debt
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {operation === 'add' ? 'USDC Amount to Add' : 
                     operation === 'withdraw' ? 'USDC Amount to Withdraw' : 
                     'VCOP Amount to Repay'}
                  </label>
                  {(operation === 'withdraw' || operation === 'repay') && (
                    <button 
                      onClick={handleMaxAmount}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Max
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.000001"
                />
              </div>
              
              {/* Estado actual de la transacción para debug */}
              {transactionStatus && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm">Estado actual: <span className="font-medium">{transactionStatus}</span></p>
                </div>
              )}
              
              {isConnected ? (
                <Transaction 
                  chainId={BASE_SEPOLIA_CHAIN_ID}
                  calls={getCalls}
                  onStatus={handleStatusChange}
                  onSuccess={handleSuccess}
                >
                  <TransactionButton 
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md"
                    text={
                      operation === 'add' ? 'Add Collateral' :
                      operation === 'withdraw' ? 'Withdraw Collateral' :
                      'Repay Debt'
                    }
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
                <p className="text-center text-red-500">Connect your wallet to continue</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 