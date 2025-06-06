import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
  type LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { parseUnits, formatUnits } from 'viem';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { useRiskCalculator, RiskLevel } from '../../hooks/useRiskCalculator';

// Tipos de activos soportados
interface SupportedAsset {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  assetType: 'MINTABLE_BURNABLE' | 'VAULT_BASED';
  maxLoanAmount?: string;
  availableLiquidity?: string;
}

// Activos soportados (desde el .env y configuración)
const SUPPORTED_ASSETS: SupportedAsset[] = [
  {
    address: import.meta.env.VITE_ETH_ADDRESS,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: '⟠',
    assetType: 'VAULT_BASED'
  },
  {
    address: import.meta.env.VITE_WBTC_ADDRESS,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: '₿',
    assetType: 'VAULT_BASED'
  },
  {
    address: import.meta.env.VITE_USDC_ADDRESS,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '$',
    assetType: 'VAULT_BASED'
  },
  {
    address: import.meta.env.VITE_VCOP_ADDRESS,
    symbol: 'VCOP',
    name: 'VCOP Stablecoin',
    decimals: 18,
    icon: '🏛️',
    assetType: 'MINTABLE_BURNABLE'
  }
];

type TransactionStateType = 'transactionIdle' | 'transactionPending' | 'success' | 'error' | 'init' | 'buildingTransaction' | 'transactionLegacyExecuted' | 'reset';

const TransactionState = {
  IDLE: 'transactionIdle' as TransactionStateType,
  PENDING: 'transactionPending' as TransactionStateType,
  SUCCESS: 'success' as TransactionStateType,
  ERROR: 'error' as TransactionStateType,
  INIT: 'init' as TransactionStateType,
  BUILDING: 'buildingTransaction' as TransactionStateType,
  EXECUTED: 'transactionLegacyExecuted' as TransactionStateType,
  RESET: 'reset' as TransactionStateType,
};

export default function FlexibleLoanCreator() {
  const { address, isConnected } = useAccount();
  
  // Estados principales
  const [collateralAsset, setCollateralAsset] = useState<SupportedAsset | null>(null);
  const [loanAsset, setLoanAsset] = useState<SupportedAsset | null>(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5'); // 5% default
  
  // Estados de UI
  const [showCollateralSelector, setShowCollateralSelector] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [transactionState, setTransactionState] = useState<TransactionStateType>(TransactionState.IDLE);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Validaciones y cálculos
  const isValidConfiguration = useMemo(() => {
    if (!collateralAsset || !loanAsset) return false;
    if (collateralAsset.address === loanAsset.address) return false;
    if (!collateralAmount || !loanAmount) return false;
    if (parseFloat(collateralAmount) <= 0 || parseFloat(loanAmount) <= 0) return false;
    return true;
  }, [collateralAsset, loanAsset, collateralAmount, loanAmount]);

  // Cálculo de riesgo usando el hook
  const { 
    riskMetrics, 
    priceImpact, 
    formatCollateralizationRatio, 
    formatHealthFactor, 
    getRiskLevelColor, 
    getRiskLevelBgColor 
  } = useRiskCalculator({
    collateralAsset: collateralAsset?.address || '',
    loanAsset: loanAsset?.address || '',
    collateralAmount,
    loanAmount,
    interestRate
  });

  // Función para obtener las llamadas de transacción
  const getCalls = useCallback(async () => {
    if (!isValidConfiguration) return [];
    
    // Aquí implementaremos las llamadas al FlexibleLoanManager
    // Por ahora retornamos un array vacío para mostrar la UI
    return [];
  }, [isValidConfiguration, collateralAsset, loanAsset, collateralAmount, loanAmount, interestRate, needsApproval]);

  // Manejar cambios en inputs
  const handleCollateralAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCollateralAmount(value);
    }
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLoanAmount(value);
    }
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 100) {
      setInterestRate(value);
    }
  };

  // Seleccionar activo de collateral
  const selectCollateralAsset = (asset: SupportedAsset) => {
    setCollateralAsset(asset);
    setShowCollateralSelector(false);
    // Si es el mismo que el loan asset, limpiar loan asset
    if (loanAsset && asset.address === loanAsset.address) {
      setLoanAsset(null);
      setLoanAmount('');
    }
  };

  // Seleccionar activo de préstamo
  const selectLoanAsset = (asset: SupportedAsset) => {
    setLoanAsset(asset);
    setShowLoanSelector(false);
    // Si es el mismo que el collateral asset, limpiar collateral asset
    if (collateralAsset && asset.address === collateralAsset.address) {
      setCollateralAsset(null);
      setCollateralAmount('');
    }
  };

  // Filtrar activos disponibles
  const availableCollateralAssets = SUPPORTED_ASSETS.filter(asset => 
    !loanAsset || asset.address !== loanAsset.address
  );

  const availableLoanAssets = SUPPORTED_ASSETS.filter(asset => 
    !collateralAsset || asset.address !== collateralAsset.address
  );

  // Manejar estado de transacción
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    setTransactionState(status.statusName as TransactionStateType);
    
    if (status.statusName === 'success') {
      setShowSuccess(true);
      if (status.statusData && 'transactionReceipts' in status.statusData && status.statusData.transactionReceipts.length > 0) {
        setTransactionHash(status.statusData.transactionReceipts[0].transactionHash);
      }
    }
  }, []);

  // Resetear formulario
  const handleReset = useCallback(() => {
    setCollateralAsset(null);
    setLoanAsset(null);
    setCollateralAmount('');
    setLoanAmount('');
    setInterestRate('5');
    setNeedsApproval(true);
    setShowSuccess(false);
    setTransactionHash(null);
    setTransactionState(TransactionState.RESET);
  }, []);

  // Componente para seleccionar activo
  const AssetSelector = ({ 
    title, 
    selectedAsset, 
    onSelect, 
    availableAssets, 
    isOpen, 
    onToggle 
  }: {
    title: string;
    selectedAsset: SupportedAsset | null;
    onSelect: (asset: SupportedAsset) => void;
    availableAssets: SupportedAsset[];
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-blue-800 mb-2">
        {title}
      </label>
      <button
        onClick={onToggle}
        className="w-full p-4 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-blue-50/80 transition-all flex items-center justify-between"
      >
        {selectedAsset ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedAsset.icon}</span>
            <div className="text-left">
              <div className="font-medium text-blue-900">{selectedAsset.symbol}</div>
              <div className="text-sm text-blue-600">{selectedAsset.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-blue-500">Select an asset</span>
        )}
        <svg 
          className={`w-5 h-5 text-blue-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {availableAssets.map((asset) => (
            <button
              key={asset.address}
              onClick={() => onSelect(asset)}
              className="w-full p-4 hover:bg-blue-50/80 transition-colors flex items-center gap-3 border-b border-blue-100 last:border-b-0"
            >
              <span className="text-2xl">{asset.icon}</span>
              <div className="text-left flex-1">
                <div className="font-medium text-blue-900">{asset.symbol}</div>
                <div className="text-sm text-blue-600">{asset.name}</div>
                <div className="text-xs text-blue-500">
                  {asset.assetType === 'MINTABLE_BURNABLE' ? 'Mintable' : 'Vault-based'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (showSuccess) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6">
        <div className="text-center">
          <div className="inline-flex p-4 mb-4 rounded-full bg-green-100/80">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Loan Created Successfully!</h3>
          <p className="text-green-600 mb-6">Your flexible loan position has been created</p>
          
          <div className="bg-green-50/50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700 text-sm">Collateral:</span>
              <span className="font-medium text-green-800">
                {collateralAmount} {collateralAsset?.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700 text-sm">Loan:</span>
              <span className="font-medium text-green-800">
                {loanAmount} {loanAsset?.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700 text-sm">Interest Rate:</span>
              <span className="font-medium text-green-800">{interestRate}%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {transactionHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 hover:underline text-sm flex items-center justify-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View transaction on BaseScan
              </a>
            )}
            
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-md"
            >
              Create New Loan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 flex items-center mb-2">
            <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Flexible Loan
          </h3>
          <p className="text-blue-600/80">
            Choose any supported asset as collateral and borrow any other asset
          </p>
        </div>

        {/* Asset Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AssetSelector
            title="Collateral Asset"
            selectedAsset={collateralAsset}
            onSelect={selectCollateralAsset}
            availableAssets={availableCollateralAssets}
            isOpen={showCollateralSelector}
            onToggle={() => setShowCollateralSelector(!showCollateralSelector)}
          />
          
          <AssetSelector
            title="Loan Asset"
            selectedAsset={loanAsset}
            onSelect={selectLoanAsset}
            availableAssets={availableLoanAssets}
            isOpen={showLoanSelector}
            onToggle={() => setShowLoanSelector(!showLoanSelector)}
          />
        </div>

        {/* Amount Inputs */}
        {collateralAsset && loanAsset && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Collateral Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={collateralAmount}
                  onChange={handleCollateralAmountChange}
                  className="w-full p-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-3 text-blue-500/80 font-medium">
                  {collateralAsset.symbol}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Loan Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loanAmount}
                  onChange={handleLoanAmountChange}
                  className="w-full p-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-3 text-blue-500/80 font-medium">
                  {loanAsset.symbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interest Rate */}
        {collateralAsset && loanAsset && (
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Interest Rate (Annual %)
            </label>
            <div className="relative">
              <input
                type="text"
                value={interestRate}
                onChange={handleInterestRateChange}
                className="w-full p-3 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="5.0"
              />
              <span className="absolute right-3 top-3 text-blue-500/80 font-medium">%</span>
            </div>
          </div>
        )}

        {/* Advanced Risk Assessment */}
        {collateralAsset && loanAsset && collateralAmount && loanAmount && riskMetrics && (
          <div className="space-y-4">
            {/* Risk Overview */}
            <div className={`border rounded-xl p-4 ${getRiskLevelBgColor(riskMetrics.riskLevel)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Risk Analysis
                </h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskMetrics.riskLevel)}`}>
                  {riskMetrics.riskLevel.toLowerCase().replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Health Factor:</span>
                  <div className={`font-bold ${getRiskLevelColor(riskMetrics.riskLevel)}`}>
                    {formatHealthFactor(riskMetrics.healthFactor)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Collateral Ratio:</span>
                  <div className="font-medium text-gray-800">
                    {formatCollateralizationRatio(riskMetrics.collateralizationRatio)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Liquidation Price:</span>
                  <div className="font-medium text-gray-800">
                    ${riskMetrics.liquidationPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Price Drop Risk:</span>
                  <div className="font-medium text-gray-800">
                    {riskMetrics.priceDropToLiquidation.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Position Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Max Withdrawable:</span>
                  <div className="font-medium text-blue-900">
                    {riskMetrics.maxWithdrawable.toFixed(4)} {collateralAsset.symbol}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Max Borrowable:</span>
                  <div className="font-medium text-blue-900">
                    ${riskMetrics.maxBorrowable.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Volatility Risk:</span>
                  <div className="font-medium text-blue-900">
                    {riskMetrics.volatilityRisk.toFixed(1)}% annual
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Time to Liquidation:</span>
                  <div className="font-medium text-blue-900">
                    {riskMetrics.timeToLiquidation > 8760 ? '1+ year' : 
                     riskMetrics.timeToLiquidation > 720 ? `${Math.round(riskMetrics.timeToLiquidation / 720)} months` :
                     riskMetrics.timeToLiquidation > 24 ? `${Math.round(riskMetrics.timeToLiquidation / 24)} days` :
                     riskMetrics.timeToLiquidation > 0 ? `${Math.round(riskMetrics.timeToLiquidation)}h` : 'Immediate risk'}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Impact Analysis */}
            {priceImpact && (
              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Price Impact Scenarios
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-purple-600">10% Risk:</span>
                    <div className="font-medium text-purple-900">
                      {priceImpact.priceDropFor10PercentLiquidation.toFixed(1)}% drop
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-600">50% Risk:</span>
                    <div className="font-medium text-purple-900">
                      {priceImpact.priceDropFor50PercentLiquidation.toFixed(1)}% drop
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-600">90% Risk:</span>
                    <div className="font-medium text-purple-900">
                      {priceImpact.priceDropFor90PercentLiquidation.toFixed(1)}% drop
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning based on risk level */}
            <div className={`border rounded-xl p-4 ${
              riskMetrics.riskLevel === RiskLevel.LIQUIDATABLE ? 'bg-red-50/50 border-red-200' :
              riskMetrics.riskLevel === RiskLevel.CRITICAL ? 'bg-red-50/50 border-red-200' :
              riskMetrics.riskLevel === RiskLevel.DANGER ? 'bg-orange-50/50 border-orange-200' :
              riskMetrics.riskLevel === RiskLevel.WARNING ? 'bg-yellow-50/50 border-yellow-200' :
              'bg-green-50/50 border-green-200'
            }`}>
              <div className="flex items-start gap-2">
                <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  riskMetrics.riskLevel === RiskLevel.LIQUIDATABLE || riskMetrics.riskLevel === RiskLevel.CRITICAL ? 'text-red-500' :
                  riskMetrics.riskLevel === RiskLevel.DANGER ? 'text-orange-500' :
                  riskMetrics.riskLevel === RiskLevel.WARNING ? 'text-yellow-500' :
                  'text-green-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={riskMetrics.riskLevel === RiskLevel.HEALTHY ? 
                      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" :
                      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
                </svg>
                <div>
                  <h4 className={`font-medium ${
                    riskMetrics.riskLevel === RiskLevel.LIQUIDATABLE || riskMetrics.riskLevel === RiskLevel.CRITICAL ? 'text-red-800' :
                    riskMetrics.riskLevel === RiskLevel.DANGER ? 'text-orange-800' :
                    riskMetrics.riskLevel === RiskLevel.WARNING ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {riskMetrics.riskLevel === RiskLevel.HEALTHY ? 'Healthy Position' :
                     riskMetrics.riskLevel === RiskLevel.WARNING ? 'Moderate Risk' :
                     riskMetrics.riskLevel === RiskLevel.DANGER ? 'High Risk Position' :
                     riskMetrics.riskLevel === RiskLevel.CRITICAL ? 'Critical Risk!' :
                     'Liquidation Risk!'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    riskMetrics.riskLevel === RiskLevel.LIQUIDATABLE || riskMetrics.riskLevel === RiskLevel.CRITICAL ? 'text-red-700' :
                    riskMetrics.riskLevel === RiskLevel.DANGER ? 'text-orange-700' :
                    riskMetrics.riskLevel === RiskLevel.WARNING ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {riskMetrics.riskLevel === RiskLevel.HEALTHY ? 
                      'This position has a healthy collateralization ratio and low liquidation risk.' :
                     riskMetrics.riskLevel === RiskLevel.WARNING ? 
                      'Monitor this position regularly. Consider adding more collateral for safety.' :
                     riskMetrics.riskLevel === RiskLevel.DANGER ? 
                      'This position is at high risk. Strongly consider increasing collateral or reducing loan amount.' :
                     riskMetrics.riskLevel === RiskLevel.CRITICAL ? 
                      'CRITICAL: This position may be liquidated soon. Take immediate action!' :
                     'DANGER: This position can be liquidated immediately. Do not create!'}
                  </p>
                  {(riskMetrics.riskLevel === RiskLevel.WARNING || riskMetrics.riskLevel === RiskLevel.DANGER) && (
                    <div className="mt-2 text-xs text-gray-600">
                      • Ultra-flexible protocol with minimal restrictions • Monitor price movements closely • Set up alerts for position health
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Button */}
        <div>
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
                  isValidConfiguration && (!riskMetrics || riskMetrics.riskLevel !== RiskLevel.LIQUIDATABLE)
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                text={
                  riskMetrics?.riskLevel === RiskLevel.LIQUIDATABLE ? "Position Too Risky" :
                  needsApproval ? `Approve ${collateralAsset?.symbol || 'Asset'}` : 
                  "Create Flexible Loan"
                }
                disabled={!isValidConfiguration || (riskMetrics?.riskLevel === RiskLevel.LIQUIDATABLE)}
              />
              
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
            <Wallet>
              <ConnectWallet>
                <button className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-800 hover:to-blue-700 font-medium shadow-md transition-all">
                  Connect Wallet
                </button>
              </ConnectWallet>
            </Wallet>
          )}
        </div>

        {/* Info note */}
        <div className="text-xs text-blue-500/80 bg-blue-50/30 p-3 rounded-lg backdrop-blur-sm border border-blue-100/50">
          <p className="flex items-start">
            <svg className="h-4 w-4 mr-1 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New flexible loan system allows borrowing any supported asset using any other asset as collateral. 
            Please manage your risk carefully as there are minimal protocol restrictions.
          </p>
        </div>
      </div>
    </div>
  );
} 