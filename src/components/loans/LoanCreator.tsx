import { useState, useCallback, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useConfig } from 'wagmi';
import { 
  Transaction, 
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction
} from '@coinbase/onchainkit/transaction';
import { formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { 
  BASE_SEPOLIA_CHAIN_ID, 
  generateCreateLoanCalls, 
  ERC20_ALLOWANCE_ABI
} from '../../utils/transactionUtils';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

// USDC ABI (solo las funciones necesarias)
const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  }
];

// Collateral Manager ABI
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
  },
  {
    name: 'createPosition',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'collateralAmount', type: 'uint256' },
      { name: 'vcopToMint', type: 'uint256' }
    ],
    outputs: []
  }
];

// Definimos el ratio mínimo de colateralización requerido por el contrato
const MIN_COLLATERALIZATION_RATIO = 150; // 150%
// Definimos un ratio de utilización seguro (como en el script de prueba)
const SAFE_UTILIZATION_RATE = 80; // 80%

export default function LoanCreator() {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  
  const [collateralAmount, setCollateralAmount] = useState('100');
  const [vcopAmount, setVcopAmount] = useState('0');
  const [utilizationRate, setUtilizationRate] = useState(SAFE_UTILIZATION_RATE);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [needsApproval, setNeedsApproval] = useState(false);
  
  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
  
  // Parse collateral amount for contract read
  const parsedCollateral = BigInt(
    Math.floor(parseFloat(collateralAmount || '0') * 10 ** 6)
  );
  
  // Check USDC allowance
  const { data: allowance } = useContractRead({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, collateralManagerAddress],
    query: {
      enabled: !!address
    }
  });

  // Get max VCOP that can be minted with provided collateral
  const { data: maxVcop, refetch } = useContractRead({
    address: collateralManagerAddress,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'getMaxVCOPforCollateral',
    args: [usdcAddress, parsedCollateral],
    query: {
      enabled: !!address && !!collateralManagerAddress && !!usdcAddress && parsedCollateral > 0n,
    }
  });

  // Check if approval is needed
  useEffect(() => {
    if (allowance && parsedCollateral > 0n) {
      setNeedsApproval(BigInt(allowance.toString()) < parsedCollateral);
    }
  }, [allowance, parsedCollateral]);

  // Update VCOP amount when collateral amount or utilization rate changes
  useEffect(() => {
    if (maxVcop) {
      const maxAmount = Number(formatUnits(maxVcop as bigint, 6));
      console.log("Max VCOP that can be minted:", maxAmount);
      
      // Usar el ratio de utilización seguro
      const safeUtilizationRate = Math.min(utilizationRate, SAFE_UTILIZATION_RATE);
      const calculatedAmount = Math.floor((maxAmount * safeUtilizationRate) / 100);
      
      console.log("Utilization rate:", utilizationRate, "%, safe rate:", safeUtilizationRate, "%");
      console.log("Calculated VCOP amount:", calculatedAmount);
      
      setVcopAmount(calculatedAmount.toString());
    }
  }, [maxVcop, utilizationRate]);

  // Calculate current collateralization ratio
  const collateralizationRatio = maxVcop && Number(vcopAmount) > 0
    ? Math.floor(Number(formatUnits(maxVcop as bigint, 6)) * 100 / Number(vcopAmount))
    : 0;
    
  // Determina si la posición es segura
  const isPositionSafe = collateralizationRatio >= MIN_COLLATERALIZATION_RATIO;

  // Refetch when collateral amount changes
  useEffect(() => {
    if (address && collateralAmount && parseFloat(collateralAmount) > 0) {
      console.log("Refetching max VCOP for collateral:", collateralAmount, "USDC");
      refetch();
    }
  }, [address, collateralAmount, refetch]);

  // Handle utilization slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Number(e.target.value);
    console.log("Slider changed to:", newRate, "%");
    setUtilizationRate(newRate);
  };

  // Prepare transaction calls
  const getCalls = useCallback(async () => {
    console.log('\n=== TRANSACTION PREPARATION LOGS ===');
    
    // Convert collateral amount to raw uint256 (no decimals)
    const rawCollateralAmount = BigInt(Math.floor(Number(collateralAmount)));
    
    // Convert VCOP amount to raw uint256 (no decimals)
    const rawVcopAmount = BigInt(Math.floor(Number(vcopAmount)));
    
    if (needsApproval) {
      // Encode approve function data
      const approveData = encodeFunctionData({
        abi: USDC_ABI,
        functionName: 'approve',
        args: [collateralManagerAddress, rawCollateralAmount]
      });
      
      console.log('Approve Transaction Data:', approveData);
      
      return [{
        to: usdcAddress,
        value: BigInt(0),
        data: approveData
      }];
    }
    
    // Encode createPosition function data
    const createPositionData = encodeFunctionData({
      abi: COLLATERAL_MANAGER_ABI,
      functionName: 'createPosition',
      args: [usdcAddress, rawCollateralAmount, rawVcopAmount]
    });
    
    console.log('Create Position Transaction Data:', createPositionData);
    
    return [{
      to: collateralManagerAddress,
      value: BigInt(0),
      data: createPositionData
    }];
  }, [
    needsApproval,
    usdcAddress,
    collateralManagerAddress,
    collateralAmount,
    vcopAmount,
    address
  ]);

  // Handle transaction status changes
  const handleStatusChange = useCallback((status: any) => {
    console.log('\n=== TRANSACTION STATUS UPDATE ===');
    console.log('Status:', status);
    console.log('Status Name:', status.statusName);
    console.log('Full Status Object:', JSON.stringify(status, null, 2));
    
    setTransactionStatus(status.statusName || "unknown");
    
    // Si la transacción fue exitosa y era una aprobación, actualizar el estado
    if (status.statusName === 'success' && needsApproval) {
      console.log('Approval successful, updating state to proceed with position creation');
      setNeedsApproval(false);
    }
  }, [needsApproval]);

  // Add debug panel to show current state
  const renderDebugInfo = () => {
    // Helper function to safely convert BigInt values to strings
    const bigIntToString = (value: any): any => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (Array.isArray(value)) {
        return value.map(bigIntToString);
      }
      if (typeof value === 'object' && value !== null) {
        const converted: any = {};
        for (const key in value) {
          converted[key] = bigIntToString(value[key]);
        }
        return converted;
      }
      return value;
    };

    const debugData = {
      addresses: {
        usdc: usdcAddress,
        collateralManager: collateralManagerAddress,
        wallet: address
      },
      state: {
        needsApproval,
        collateralAmount,
        parsedCollateral: parsedCollateral.toString(),
        vcopAmount,
        utilizationRate,
        maxVcop: maxVcop ? formatUnits(maxVcop as bigint, 6) : null,
        collateralizationRatio,
        transactionStatus
      }
    };

    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(bigIntToString(debugData), null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Loan Position</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">USDC Collateral Amount</label>
        <input
          type="number"
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          min="1"
          step="0.000001"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Utilization Rate: {utilizationRate}%
        </label>
        <input
          type="range"
          min="50"
          max={SAFE_UTILIZATION_RATE}
          value={utilizationRate}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          Utilización máxima segura: {SAFE_UTILIZATION_RATE}% para mantener colateralización saludable
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">VCOP to Receive</label>
        <input
          type="text"
          value={vcopAmount}
          readOnly
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded-md"
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            Collateralization: {collateralizationRatio}%
          </p>
          <p className={`text-xs ${isPositionSafe ? 'text-green-500' : 'text-red-500'}`}>
            {isPositionSafe ? 'Safe' : 'Risky - Mínimo 150%'}
          </p>
        </div>
      </div>
      
      {isConnected ? (
        <Transaction 
          chainId={BASE_SEPOLIA_CHAIN_ID}
          calls={getCalls}
          onStatus={handleStatusChange}
          onError={(error) => {
            console.error('Transaction Error:', error);
          }}
        >
          <TransactionButton 
            className={`w-full py-2 px-4 font-medium rounded-md ${
              isPositionSafe 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            disabled={!isPositionSafe}
            text={needsApproval ? "Approve USDC" : "Create Position"}
          />
          
          {!isPositionSafe && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
              La colateralización debe ser de al menos 150% para crear una posición.
              Reduzca la tasa de utilización o aumente el colateral.
            </div>
          )}
          
          <TransactionSponsor />
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
        <div className="text-center">
          <Wallet>
            <ConnectWallet>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Connect Wallet
              </button>
            </ConnectWallet>
          </Wallet>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && renderDebugInfo()}
    </div>
  );
} 