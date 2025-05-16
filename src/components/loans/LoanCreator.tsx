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
  TransactionToastAction,
  type LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { 
  BASE_SEPOLIA_CHAIN_ID, 
  generateCreateLoanCalls, 
  ERC20_ALLOWANCE_ABI
} from '../../utils/transactionUtils';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';

// Constantes para manejo de decimales
const DECIMALS = 6;
const DECIMAL_FACTOR = 10 ** DECIMALS;
const USDC_TO_VCOP_RATE = 4200; // 1 USDC = 4200 VCOP

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
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
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
  const [collateralAmount, setCollateralAmount] = useState('100');
  const [utilizationRate, setUtilizationRate] = useState(SAFE_UTILIZATION_RATE);
  const [vcopToReceive, setVcopToReceive] = useState('0');
  const [collateralRatio, setCollateralRatio] = useState(125);
  const [isValidPosition, setIsValidPosition] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionStateType>(TransactionState.IDLE);
  const [transactionHash, setTransactionHash] = useState<string>("");
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
    chainId: 84532,
  });

  // Check if approval is needed when allowance or collateral amount changes
  useEffect(() => {
    if (allowance && collateralAmount) {
      const parsedCollateral = parseUnits(collateralAmount, 6);
      setIsValidPosition(BigInt(allowance.toString()) >= parsedCollateral);
    }
  }, [allowance, collateralAmount]);

  // Update VCOP amount and ratio when collateral or utilization rate changes
  useEffect(() => {
    if (collateralAmount && !isNaN(Number(collateralAmount))) {
      const amount = parseFloat(collateralAmount);
      // Calculate VCOP to receive based on utilization rate and conversion rate
      // For example: 100 USDC * 4200 * 80% = 336,000 VCOP
      const baseVcopAmount = amount * USDC_TO_VCOP_RATE;
      const vcop = baseVcopAmount * (utilizationRate / 100);
      setVcopToReceive(vcop.toFixed(2));
      
      // Calculate collateral ratio
      // For example: (100 USDC * 4200) / (336,000 VCOP) * 100 = 125%
      if (vcop > 0) {
        const ratio = (amount * USDC_TO_VCOP_RATE) / vcop * 100;
        setCollateralRatio(ratio);
        setIsValidPosition(ratio >= MIN_COLLATERALIZATION_RATIO);
      }
    }
  }, [collateralAmount, utilizationRate]);

  // Handle utilization slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Number(e.target.value);
    setUtilizationRate(newRate);
  };

  // Handle collateral amount input
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) { // Solo números y un punto decimal
      setCollateralAmount(value);
    }
  };

  // Handle transaction status changes
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('\n=== TRANSACTION STATUS UPDATE ===');
    console.log('Status:', status);

    setTransactionState(status.statusName as TransactionStateType);

    if (status.statusName === 'success') {
      if (needsApproval) {
        // Si la aprobación fue exitosa, actualizar el estado y forzar una nueva transacción
        setNeedsApproval(false);
        
        // Pequeño delay para asegurar que la UI se actualice
        setTimeout(() => {
          // Forzar una nueva transacción para crear la posición
          const createPositionButton = document.querySelector('button[data-transaction-button]');
          if (createPositionButton instanceof HTMLButtonElement) {
            createPositionButton.click();
          }
        }, 1000);
      } else {
        // Si fue la creación de posición, resetear el formulario
        setCollateralAmount('100');
        setUtilizationRate(SAFE_UTILIZATION_RATE);
        setVcopToReceive('0');
        setCollateralRatio(125);
        setIsValidPosition(false);
      }
    }
  }, [needsApproval]);

  // Function to get transaction calls
  const getCalls = useCallback(async () => {
    if (!collateralAmount || !vcopToReceive || !address) return [];

    const parsedCollateral = parseUnits(collateralAmount, 6);
    const parsedVcop = parseUnits(vcopToReceive, 6);

    console.log('\n=== TRANSACTION PREPARATION LOGS ===');
    console.log('Collateral Amount:', collateralAmount, 'USDC');
    console.log('VCOP to Mint:', vcopToReceive, 'VCOP');
    console.log('Needs Approval:', needsApproval);

    if (needsApproval) {
      // Solo aprobación si se necesita
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
      // Crear posición si ya tenemos la aprobación
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
  }, [collateralAmount, vcopToReceive, needsApproval, address, usdcAddress, collateralManagerAddress]);

  // Función para cerrar el modal
  const handleCloseModal = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Solo cerrar si se hace clic en el fondo oscuro (no en el contenido del modal)
    if ((e.target as HTMLDivElement).id === 'modal-backdrop') {
      setTransactionState(TransactionState.RESET);
      setCollateralAmount('100');
      setUtilizationRate(SAFE_UTILIZATION_RATE);
    }
  }, []);

  // Función para reiniciar el formulario
  const handleReset = useCallback(() => {
    setTransactionState(TransactionState.RESET);
    setCollateralAmount('100');
    setUtilizationRate(SAFE_UTILIZATION_RATE);
  }, []);

  // Componente de mensaje de éxito
  const SuccessMessage = () => {
    if (transactionState !== TransactionState.SUCCESS || !isValidPosition) return null;

    return (
      <div 
        id="modal-backdrop"
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 cursor-pointer"
        onClick={handleCloseModal}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform animate-fadeIn cursor-default" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            {/* Botón de cerrar en la esquina superior derecha */}
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Resto del contenido del modal */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg className="h-10 w-10 text-green-500 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Posición creada con éxito!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tu posición de préstamo ha sido creada exitosamente
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Colateral depositado:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumberWithCommas(collateralAmount)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">VCOP recibido:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumberWithCommas(vcopToReceive)} VCOP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Ratio de colateralización:</span>
                  <span className={`font-medium ${
                    collateralRatio >= 200 ? "text-green-600 dark:text-green-400" : 
                    collateralRatio >= 150 ? "text-yellow-600 dark:text-yellow-400" : 
                    "text-red-600 dark:text-red-400"
                  }`}>
                    {collateralRatio.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {transactionHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm block"
                >
                  Ver transacción en BaseScan →
                </a>
              )}
              
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Crear nueva posición
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
                  value={collateralAmount}
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
                  isValidPosition ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                  {isValidPosition ? 'Posición segura' : 'Posición riesgosa'}
                </div>
              </div>
              <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white py-2">
                {vcopToReceive} <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">VCOP</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-300">Ratio de colateralización:</span>
                  <span className={`font-medium ${
                    collateralRatio >= 200 ? "text-green-600 dark:text-green-400" : 
                    collateralRatio >= 150 ? "text-yellow-600 dark:text-yellow-400" : 
                    "text-red-600 dark:text-red-400"
                  }`}>
                    {collateralRatio.toFixed(2)}%
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">Mínimo: 150%</span>
              </div>
              
              {/* Barra de progreso del ratio de colateralización */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
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
            
            {!isValidPosition && collateralAmount !== '' && (
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
                chainId={84532}
                calls={getCalls}
                onStatus={handleStatus}
                onError={(error) => {
                  console.error('Transaction Error:', error);
                }}
              >
                <TransactionButton 
                  className={`w-full py-3 px-4 text-white font-medium rounded-md ${
                    isValidPosition && collateralAmount !== '' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  text={needsApproval ? "Aprobar USDC" : "Crear posición de préstamo"}
                  disabled={!isValidPosition || collateralAmount === ''}
                  data-transaction-button
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
      <SuccessMessage />
    </>
  );
} 