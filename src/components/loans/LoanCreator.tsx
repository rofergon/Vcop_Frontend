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

// Constantes para manejo de decimales
const DECIMALS = 6;
const DECIMAL_FACTOR = 10 ** DECIMALS;

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

// Función para formatear números con separadores de miles
const formatNumberWithCommas = (x: string | number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function LoanCreator() {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  
  // Usamos valores amigables para el usuario (sin los 6 decimales)
  const [displayCollateralAmount, setDisplayCollateralAmount] = useState('100');
  const [displayVcopAmount, setDisplayVcopAmount] = useState('0');
  const [utilizationRate, setUtilizationRate] = useState(SAFE_UTILIZATION_RATE);
  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [needsApproval, setNeedsApproval] = useState(false);
  
  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
  
  // Convertimos el valor de entrada a la cantidad real con 6 decimales para transacciones blockchain
  const parsedCollateral = parseUnits(displayCollateralAmount || '0', DECIMALS);
  
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
      // Valor real con todos los decimales
      const maxAmount = Number(formatUnits(maxVcop as bigint, DECIMALS));
      
      // Usar el ratio de utilización seguro
      const safeUtilizationRate = Math.min(utilizationRate, SAFE_UTILIZATION_RATE);
      const calculatedAmount = (maxAmount * safeUtilizationRate) / 100;
      
      // Establecemos el valor formateado para mostrar (sin 6 ceros adicionales)
      setDisplayVcopAmount(calculatedAmount.toFixed(2));
    }
  }, [maxVcop, utilizationRate]);

  // Calculate current collateralization ratio
  const collateralizationRatio = maxVcop && Number(displayVcopAmount) > 0
    ? Math.floor(Number(formatUnits(maxVcop as bigint, DECIMALS)) * 100 / Number(displayVcopAmount))
    : 0;
    
  // Determina si la posición es segura
  const isPositionSafe = collateralizationRatio >= MIN_COLLATERALIZATION_RATIO;

  // Refetch when collateral amount changes
  useEffect(() => {
    if (address && displayCollateralAmount && parseFloat(displayCollateralAmount) > 0) {
      refetch();
    }
  }, [address, displayCollateralAmount, refetch]);

  // Handle utilization slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Number(e.target.value);
    setUtilizationRate(newRate);
  };

  // Handle collateral amount input
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) { // Solo números y un punto decimal
      setDisplayCollateralAmount(value);
    }
  };

  // Prepare transaction calls
  const getCalls = useCallback(async () => {
    console.log('\n=== TRANSACTION PREPARATION LOGS ===');
    
    // Convertir valores a BigInt con 6 decimales para transacciones blockchain
    const collateralAmountBigInt = parseUnits(displayCollateralAmount || '0', DECIMALS);
    const vcopAmountBigInt = parseUnits(displayVcopAmount || '0', DECIMALS);
    
    if (needsApproval) {
      // Encode approve function data
      const approveData = encodeFunctionData({
        abi: USDC_ABI,
        functionName: 'approve',
        args: [collateralManagerAddress, collateralAmountBigInt]
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
      args: [usdcAddress, collateralAmountBigInt, vcopAmountBigInt]
    });
    
    console.log('Create Position Transaction Data:', createPositionData);
    console.log('Collateral Amount (with decimals):', collateralAmountBigInt.toString());
    console.log('VCOP Amount (with decimals):', vcopAmountBigInt.toString());
    
    return [{
      to: collateralManagerAddress,
      value: BigInt(0),
      data: createPositionData
    }];
  }, [
    needsApproval,
    usdcAddress,
    collateralManagerAddress,
    displayCollateralAmount,
    displayVcopAmount,
    address
  ]);

  // Handle transaction status changes
  const handleStatusChange = useCallback((status: any) => {
    console.log('\n=== TRANSACTION STATUS UPDATE ===');
    console.log('Status:', status);
    console.log('Status Name:', status.statusName);
    
    setTransactionStatus(status.statusName || "unknown");
    
    // Si la transacción fue exitosa y era una aprobación, actualizar el estado
    if (status.statusName === 'success' && needsApproval) {
      console.log('Approval successful, updating state to proceed with position creation');
      setNeedsApproval(false);
    }
  }, [needsApproval]);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg mx-auto border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Crear préstamo</h2>
          <p className="text-gray-600 dark:text-gray-300">Deposita tu colateral en USDC y recibe tokens VCOP a cambio</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cantidad de colateral (USDC)</label>
            <div className="relative">
              <input
                type="text"
                value={displayCollateralAmount}
                onChange={handleCollateralChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0.000001"
                step="0.000001"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-3 text-gray-500 dark:text-gray-400">USDC</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tasa de utilización: <span className="font-bold">{utilizationRate}%</span>
              </label>
              <span className="text-sm text-blue-600 dark:text-blue-400">Máx: {SAFE_UTILIZATION_RATE}%</span>
            </div>
            <input
              type="range"
              min="50"
              max={SAFE_UTILIZATION_RATE}
              value={utilizationRate}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>50%</span>
              <span>Seguro</span>
              <span>{SAFE_UTILIZATION_RATE}%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">VCOP a recibir</label>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                isPositionSafe ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}>
                {isPositionSafe ? 'Posición segura' : 'Posición riesgosa'}
              </div>
            </div>
            <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white py-2">
              {formatNumberWithCommas(displayVcopAmount)} <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">VCOP</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-300">Ratio de colateralización:</span>
                <span className={`font-medium ${
                  collateralizationRatio >= 200 ? "text-green-600 dark:text-green-400" : 
                  collateralizationRatio >= 150 ? "text-yellow-600 dark:text-yellow-400" : 
                  "text-red-600 dark:text-red-400"
                }`}>
                  {collateralizationRatio}%
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">Mínimo: 150%</span>
            </div>
            
            {/* Barra de progreso del ratio de colateralización */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
              <div 
                className={`h-2 rounded-full ${
                  collateralizationRatio >= 200 ? "bg-green-500" : 
                  collateralizationRatio >= 150 ? "bg-yellow-500" : 
                  "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, (collateralizationRatio / 250) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {!isPositionSafe && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2zm0 0v-5a1 1 0 10-2 0v5a1 1 0 002 0z" clipRule="evenodd" />
                </svg>
                <p>La colateralización debe ser de al menos 150% para crear una posición.
                Reduzca la tasa de utilización o aumente el colateral.</p>
              </div>
            </div>
          )}

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
                className={`w-full py-3 px-4 font-medium text-base rounded-lg transition-colors ${
                  isPositionSafe 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
                disabled={!isPositionSafe}
                text={needsApproval ? "Aprobar USDC" : "Crear posición de préstamo"}
              />
              
              <div className="mt-4">
                <TransactionSponsor />
              </div>
              
              <div className="mt-4">
                <TransactionStatus>
                  <div className="flex items-center gap-2 text-sm">
                    <TransactionStatusLabel />
                    <div className="ml-auto">
                      <TransactionStatusAction />
                    </div>
                  </div>
                </TransactionStatus>
              </div>
              
              <TransactionToast>
                <div className="flex items-center gap-3">
                  <TransactionToastIcon />
                  <TransactionToastLabel />
                  <div className="ml-auto">
                    <TransactionToastAction />
                  </div>
                </div>
              </TransactionToast>
            </Transaction>
          ) : (
            <div className="text-center mt-2">
              <Wallet>
                <ConnectWallet>
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium text-base shadow-sm transition-colors">
                    Conectar cartera
                  </button>
                </ConnectWallet>
              </Wallet>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Este préstamo utiliza USDC como colateral para obtener tokens VCOP. Asegúrese de mantener un ratio de colateralización saludable para evitar liquidaciones.</p>
        </div>
      </div>
    </div>
  );
} 