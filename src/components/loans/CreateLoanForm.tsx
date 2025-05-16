import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { parseUnits, encodeFunctionData } from 'viem';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastLabel,
  TransactionToastAction,
  TransactionToastIcon,
  type LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { 
  Wallet, 
  ConnectWallet,
  WalletDropdown,
  WalletAdvancedAddressDetails 
} from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { createLoanCalls } from '../../calls';

// USDC ABI para verificar allowance
const USDC_ABI = [
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

// Collateral Manager ABI (solo las funciones necesarias)
const COLLATERAL_MANAGER_ABI = [
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

// Enumeración para estados de transacción según OnchainKit
type TransactionStateType = 'transactionIdle' | 'transactionPending' | 'success' | 'error' | 'init' | 'buildingTransaction' | 'transactionLegacyExecuted' | 'reset';

const TransactionState: Record<string, TransactionStateType> = {
  IDLE: 'transactionIdle',
  PENDING: 'transactionPending',
  SUCCESS: 'success',
  ERROR: 'error',
  INIT: 'init',
  BUILDING: 'buildingTransaction',
  LEGACY: 'transactionLegacyExecuted',
  RESET: 'reset'
} as const;

// Constantes para manejo de decimales y conversión
const DECIMALS = 6;
const DECIMAL_FACTOR = 10n ** 6n;
const MIN_COLLATERALIZATION_RATIO = 150; // 150%
const MAX_UTILIZATION_RATE = 80; // 80%
const USDC_TO_VCOP_RATE = 4200; // 1 USDC = 4200 VCOP

export default function CreateLoanForm() {
  const { address } = useAccount();
  const [collateralAmount, setCollateralAmount] = useState('100');
  const [utilizationRate, setUtilizationRate] = useState(MAX_UTILIZATION_RATE);
  const [vcopToReceive, setVcopToReceive] = useState('0');
  const [collateralRatio, setCollateralRatio] = useState(125);
  const [isValidPosition, setIsValidPosition] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionStateType>(TransactionState.IDLE);
  const [needsApproval, setNeedsApproval] = useState(true);

  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;

  // Check USDC allowance
  const { data: allowance } = useContractRead({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && collateralManagerAddress ? [address, collateralManagerAddress] : undefined,
    query: {
      enabled: !!address && !!collateralManagerAddress
    }
  });

  // Update VCOP amount and ratio when collateral or utilization rate changes
  useEffect(() => {
    if (collateralAmount && !isNaN(Number(collateralAmount))) {
      const collateralValue = parseFloat(collateralAmount);
      
      // Calculate VCOP to receive based on utilization rate and conversion rate
      // For 100 USDC at 80% utilization:
      // Base VCOP = 100 * 4200 = 420,000 VCOP
      // Final VCOP = 420,000 * 0.8 = 336,000 VCOP
      const baseVcopAmount = collateralValue * USDC_TO_VCOP_RATE;
      const vcopAmount = baseVcopAmount * (utilizationRate / 100);
      
      // Format VCOP amount with 6 decimals for display
      setVcopToReceive(vcopAmount.toFixed(6));
      
      // Calculate collateral ratio
      // For 100 USDC collateral and 336,000 VCOP minted:
      // ratio = (100 * 4200 * 100) / vcopAmount = 125%
      if (vcopAmount > 0) {
        const ratio = (collateralValue * USDC_TO_VCOP_RATE * 100) / vcopAmount;
        setCollateralRatio(ratio);
        setIsValidPosition(ratio >= MIN_COLLATERALIZATION_RATIO);
      }
    }
  }, [collateralAmount, utilizationRate]);
  
  // Function to get transaction calls
  const getCalls = useCallback(async () => {
    if (!collateralAmount || !vcopToReceive || !address) return [];

    // Parse amounts with proper decimals
    const parsedCollateral = parseUnits(collateralAmount, DECIMALS);
    const parsedVcop = parseUnits(vcopToReceive, DECIMALS);

    console.log('\n=== TRANSACTION PREPARATION LOGS ===');
    console.log('Collateral Amount (human):', collateralAmount, 'USDC');
    console.log('VCOP to Mint (human):', vcopToReceive, 'VCOP');
    console.log('Collateral Amount (with decimals):', parsedCollateral.toString());
    console.log('VCOP Amount (with decimals):', parsedVcop.toString());
    console.log('Conversion rate:', USDC_TO_VCOP_RATE, 'VCOP per USDC');
    console.log('Utilization rate:', utilizationRate, '%');
    console.log('Needs Approval:', needsApproval);

    if (needsApproval) {
      // Siempre generar una nueva aprobación con el monto exacto
      console.log('Generating approval transaction');
      const approveData = encodeFunctionData({
        abi: USDC_ABI,
        functionName: 'approve',
        args: [collateralManagerAddress, parsedCollateral]
      });

      return [{
        to: usdcAddress,
        value: BigInt(0),
        data: approveData
      }];
    } else {
      // Crear posición después de la aprobación
      console.log('Generating create position transaction');
      const createPositionData = encodeFunctionData({
        abi: COLLATERAL_MANAGER_ABI,
        functionName: 'createPosition',
        args: [usdcAddress, parsedCollateral, parsedVcop]
      });

      return [{
        to: collateralManagerAddress,
        value: BigInt(0),
        data: createPositionData
      }];
    }
  }, [collateralAmount, vcopToReceive, needsApproval, address, usdcAddress, collateralManagerAddress, utilizationRate]);

  // Handle transaction status changes
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    setTransactionState(status.statusName as TransactionStateType);
    
    if (status.statusName === 'success') {
      if (needsApproval) {
        // Si la aprobación fue exitosa, actualizar el estado
        setNeedsApproval(false);
        
        // Forzar una nueva transacción para crear la posición después de un breve delay
        setTimeout(() => {
          const createPositionButton = document.querySelector('button[data-transaction-button]');
          if (createPositionButton instanceof HTMLButtonElement) {
            createPositionButton.click();
          }
        }, 1000);
      } else {
        // Si fue la creación de posición, resetear el formulario
        setCollateralAmount('100');
        setUtilizationRate(MAX_UTILIZATION_RATE);
        setVcopToReceive('0');
        setCollateralRatio(125);
        setIsValidPosition(false);
        setNeedsApproval(true); // Resetear el estado de aprobación
      }
    }
  }, [needsApproval]);

  // Handle transaction error
  const handleError = useCallback((error: any) => {
    console.error('Transaction error:', error);
    setTransactionState(TransactionState.ERROR);
  }, []);
  
  // Handle collateral input change
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCollateralAmount(value);
    }
  };
  
  // Handle utilization rate slider change
  const handleUtilizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUtilizationRate(parseInt(e.target.value));
  };
  
  // Modificar el useEffect inicial para siempre requerir aprobación
  useEffect(() => {
    setNeedsApproval(true); // Siempre requerir aprobación
  }, [collateralAmount]); // Solo depender del monto de colateral

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Crear préstamo</h3>
        <p className="text-sm text-gray-500">
          Deposita tu colateral en USDC y recibe tokens VCOP a cambio
        </p>
      </div>
      
      {/* Collateral input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de colateral (USDC)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            value={collateralAmount}
            onChange={handleCollateralChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
            placeholder="100"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USDC</span>
          </div>
        </div>
      </div>
      
      {/* Utilization rate slider */}
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Tasa de utilización: {utilizationRate}%
          </label>
          <span className="text-sm text-blue-600">Máx: 80%</span>
        </div>
        <input
          type="range"
          min="50"
          max="80"
          value={utilizationRate}
          onChange={handleUtilizationChange}
          className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>50%</span>
          <span>Seguro</span>
          <span>80%</span>
        </div>
      </div>
      
      {/* VCOP to receive */}
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">VCOP a recibir</span>
          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
            isValidPosition ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {isValidPosition ? 'Posición segura' : 'Posición riesgosa'}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">
            {parseFloat(vcopToReceive).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })}
            <span className="text-gray-500 text-sm ml-2">VCOP</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tasa de conversión: 1 USDC = {USDC_TO_VCOP_RATE} VCOP
          </p>
        </div>
        
        {/* Ratio information */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Ratio de colateralización:</span>
            <span className={`font-medium ${
              collateralRatio >= 200 ? "text-green-600" : 
              collateralRatio >= 150 ? "text-yellow-600" : 
              "text-red-600"
            }`}>
              {collateralRatio.toFixed(2)}%
            </span>
          </div>
          <span className="text-gray-500">Mínimo: {MIN_COLLATERALIZATION_RATIO}%</span>
        </div>
        
        {/* Progress bar for ratio */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full ${
              collateralRatio >= 200 ? "bg-green-500" : 
              collateralRatio >= 150 ? "bg-yellow-500" : 
              "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, (collateralRatio / 250) * 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message for invalid position */}
      {!isValidPosition && collateralAmount !== '100' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-red-700">
              La colateralización debe ser de al menos {MIN_COLLATERALIZATION_RATIO}% para crear una posición.
              Reduzca la tasa de utilización o aumente el colateral.
            </p>
          </div>
        </div>
      )}
      
      {/* Transaction button */}
      <div>
        {address ? (
          <Transaction 
            chainId={baseSepolia.id} 
            calls={getCalls}
            onStatus={handleStatus}
            onError={handleError}
          >
            <TransactionButton 
              className={`w-full py-3 px-4 text-white font-medium rounded-md ${
                isValidPosition && collateralAmount !== '100' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              text={needsApproval ? "Aprobar USDC" : "Crear posición de préstamo"}
              disabled={!isValidPosition || collateralAmount === '100'}
              data-transaction-button
            />
            <div className="mt-4">
              <TransactionStatus>
                <div className="flex items-center justify-between">
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </div>
              </TransactionStatus>
            </div>
            <TransactionToast>
              <div className="flex items-center gap-2">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <div className="ml-auto">
                  <TransactionToastAction />
                </div>
              </div>
            </TransactionToast>
          </Transaction>
        ) : (
          <Wallet>
            <ConnectWallet className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
              <Avatar className="h-5 w-5 mr-2" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <WalletAdvancedAddressDetails />
            </WalletDropdown>
          </Wallet>
        )}
      </div>
      
      {/* Informational note */}
      <div className="text-xs text-gray-600 mt-4">
        <p>Este préstamo utiliza USDC como colateral para obtener tokens VCOP. 
        Asegúrese de mantener un ratio de colateralización saludable para evitar 
        liquidaciones.</p>
      </div>
    </div>
  );
} 