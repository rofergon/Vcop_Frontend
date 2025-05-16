import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { parseUnits } from 'viem';
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

export default function CreateLoanForm() {
  const { address } = useAccount();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [utilizationRate, setUtilizationRate] = useState(80);
  const [vcopToReceive, setVcopToReceive] = useState('0');
  const [collateralRatio, setCollateralRatio] = useState(125);
  const [isValidPosition, setIsValidPosition] = useState(false);
  const [transactionState, setTransactionState] = useState('idle');
  const [needsApproval, setNeedsApproval] = useState(false);

  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;

  // Check USDC allowance
  const { data: allowance } = useContractRead({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && collateralManagerAddress ? [address, collateralManagerAddress] : undefined,
    enabled: !!address && !!collateralManagerAddress
  });

  // Check if approval is needed when allowance or collateral amount changes
  useEffect(() => {
    if (allowance && collateralAmount) {
      const parsedCollateral = parseUnits(collateralAmount, 6);
      setNeedsApproval(BigInt(allowance.toString()) < parsedCollateral);
    }
  }, [allowance, collateralAmount]);

  // Update VCOP amount and ratio when collateral or utilization rate changes
  useEffect(() => {
    if (collateralAmount && !isNaN(Number(collateralAmount))) {
      const amount = parseFloat(collateralAmount);
      // Calculate VCOP to receive based on utilization rate
      const vcop = amount * (utilizationRate / 100);
      setVcopToReceive(vcop.toFixed(2));
      
      // Calculate collateral ratio
      if (vcop > 0) {
        const ratio = (amount / vcop) * 100;
        setCollateralRatio(ratio);
        setIsValidPosition(ratio >= 150);
      }
    }
  }, [collateralAmount, utilizationRate]);
  
  // Function to get transaction calls
  const getCalls = useCallback(async () => {
    if (!collateralAmount || !vcopToReceive) return [];
    
    console.log('Creating loan calls:', {
      collateralAmount,
      vcopToReceive,
      needsApproval
    });
    
    return createLoanCalls(collateralAmount, vcopToReceive);
  }, [collateralAmount, vcopToReceive, needsApproval]);

  // Handle transaction status changes
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    setTransactionState(status.statusName);
    
    if (status.statusName === 'success') {
      // Reset form on success
      setCollateralAmount('');
      setUtilizationRate(80);
      setVcopToReceive('0');
      setCollateralRatio(125);
      setIsValidPosition(false);
    }
  }, []);

  // Handle transaction error
  const handleError = useCallback((error: any) => {
    console.error('Transaction error:', error);
    setTransactionState('error');
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
          <span className={isValidPosition ? '' : 'text-red-600'}>Posición {isValidPosition ? '' : 'riesgosa'}</span>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{vcopToReceive} <span className="text-gray-500 text-sm">VCOP</span></p>
        </div>
        
        {/* Ratio information */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <span>Ratio de colateralización: {collateralRatio.toFixed(0)}%</span>
          <span>Mínimo: 150%</span>
        </div>
        
        {/* Progress bar for ratio */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full ${collateralRatio >= 150 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, (collateralRatio / 2))}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message for invalid position */}
      {!isValidPosition && collateralAmount !== '' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm text-red-700">
              La colateralización debe ser de al menos 150% para crear una posición. Reduzca la tasa de utilización o aumente el colateral.
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
                isValidPosition && collateralAmount !== '' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              text={needsApproval ? "Aprobar USDC" : "Crear posición de préstamo"}
              disabled={!isValidPosition || collateralAmount === ''}
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