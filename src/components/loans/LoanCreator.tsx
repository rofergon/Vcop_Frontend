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

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-lg mx-auto border border-blue-100/50 transition-all hover:shadow-xl">
        <div className="flex flex-col gap-6 p-6">
          <div>
            <h2 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crear préstamo
            </h2>
            <p className="text-blue-600/80">Deposita tu colateral en USDC y recibe tokens VCOP a cambio</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cantidad de colateral (USDC)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={collateralAmount}
                  onChange={handleCollateralChange}
                  className="w-full p-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  min="0.000001"
                  step="0.000001"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-3 text-blue-500/80 font-medium">USDC</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Tasa de utilización: <span className="font-bold ml-1">{utilizationRate}%</span>
                </label>
                <span className="text-sm text-blue-600 font-medium">Máx: {SAFE_UTILIZATION_RATE}%</span>
              </div>
              <input
                type="range"
                min="50"
                max={SAFE_UTILIZATION_RATE}
                value={utilizationRate}
                onChange={handleSliderChange}
                className="w-full h-2 bg-blue-100/80 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-full flex justify-between text-xs text-blue-500 mt-1">
                <span>50%</span>
                <span>Seguro</span>
                <span>{SAFE_UTILIZATION_RATE}%</span>
              </div>
            </div>
            
            <div className="bg-blue-50/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 shadow-sm">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  VCOP a recibir
                </label>
                <div className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
                  isValidPosition ? "bg-green-100/80 text-green-800" : "bg-red-100/80 text-red-800"
                }`}>
                  {isValidPosition ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Posición segura
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Posición riesgosa
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center text-2xl font-bold text-blue-900 py-2">
                {formatNumberWithCommas(vcopToReceive)} <span className="ml-1 text-sm font-normal text-blue-500/80">VCOP</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-blue-700">Ratio de colateralización:</span>
                  <span className={`font-medium ${
                    collateralRatio >= 200 ? "text-green-600" : 
                    collateralRatio >= 150 ? "text-yellow-600" : 
                    "text-red-600"
                  }`}>
                    {collateralRatio.toFixed(2)}%
                  </span>
                </div>
                <span className="text-blue-500">Mínimo: 150%</span>
              </div>
              
              {/* Barra de progreso del ratio de colateralización */}
              <div className="w-full h-2 bg-blue-100/50 rounded-full mt-2">
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
              <div className="p-4 bg-red-50/30 backdrop-blur-sm border border-red-200/50 rounded-xl text-sm text-red-700 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>La colateralización debe ser de al menos 150% para crear una posición.
                Reduzca la tasa de utilización o aumente el colateral.</p>
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
                  className={`w-full py-3 px-4 text-white font-medium rounded-xl shadow-md transition-all ${
                    isValidPosition && collateralAmount !== '' 
                      ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  text={needsApproval ? "Aprobar USDC" : "Crear posición de préstamo"}
                  disabled={!isValidPosition || collateralAmount === ''}
                  data-transaction-button
                />
                
                <div className="mt-4">
                  <TransactionSponsor />
                </div>
                
                <div className="mt-4 bg-blue-50/30 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50">
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
                    <button className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-800 hover:to-blue-700 font-medium shadow-md transition-all">
                      Conectar cartera
                    </button>
                  </ConnectWallet>
                </Wallet>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-blue-500/80 bg-blue-50/30 p-3 rounded-lg backdrop-blur-sm border border-blue-100/50">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Este préstamo utiliza USDC como colateral para obtener tokens VCOP. Asegúrese de mantener un ratio de colateralización saludable para evitar liquidaciones.
            </p>
          </div>
        </div>
      </div>
      
      {/* Success modal with glassmorphism */}
      {transactionState === TransactionState.SUCCESS && isValidPosition && (
        <div 
          id="modal-backdrop"
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={handleCloseModal}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-blue-100/50 transform animate-fadeIn cursor-default" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              {/* Botón de cerrar en la esquina superior derecha */}
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Resto del contenido del modal */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100/80 backdrop-blur-sm border border-green-200/50 mb-4">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 mb-2">
                ¡Posición creada con éxito!
              </h3>
              <p className="text-blue-600/80 mb-6">
                Tu posición de préstamo ha sido creada exitosamente
              </p>
              
              <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-blue-100/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Colateral depositado:
                    </span>
                    <span className="font-medium text-blue-900">
                      {formatNumberWithCommas(collateralAmount)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      VCOP recibido:
                    </span>
                    <span className="font-medium text-blue-900">
                      {formatNumberWithCommas(vcopToReceive)} VCOP
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Ratio de colateralización:
                    </span>
                    <span className={`font-medium ${
                      collateralRatio >= 200 ? "text-green-600" : 
                      collateralRatio >= 150 ? "text-yellow-600" : 
                      "text-red-600"
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
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ver transacción en BaseScan
                  </a>
                )}
                
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md"
                >
                  Crear nueva posición
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 