import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  type LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { useRiskCalculator, RiskLevel, getRiskLevelColor, getRiskLevelBgColor } from '../../hooks/useRiskCalculator';

// Tipos para los préstamos flexibles
interface FlexibleLoanPosition {
  positionId: string;
  borrower: string;
  collateralAsset: string;
  collateralSymbol: string;
  collateralIcon: string;
  loanAsset: string;
  loanSymbol: string;
  loanIcon: string;
  collateralAmount: string;
  loanAmount: string;
  interestRate: string;
  createdAt: number;
  lastInterestUpdate: number;
  accruedInterest: string;
  isActive: boolean;
}

export default function FlexibleActiveLoans() {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<FlexibleLoanPosition[]>([]);
  const [loading, setLoading] = useState(true);

  // Simular carga de posiciones (después conectaremos al contrato)
  useEffect(() => {
    if (isConnected && address) {
      // Simular delay de carga
      setTimeout(() => {
        // Por ahora, mostrar posiciones vacías
        setPositions([]);
        setLoading(false);
      }, 1000);
    } else {
      setPositions([]);
      setLoading(false);
    }
  }, [isConnected, address]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-blue-500 mt-4 text-sm">Loading flexible loans...</p>
        </div>
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-50/30 backdrop-blur-sm rounded-xl border border-blue-100/50 h-48">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-blue-700 font-medium mb-2">No flexible loans yet</p>
        <p className="text-blue-500/80 text-sm text-center">Create your first flexible loan to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <FlexibleLoanCard key={position.positionId} position={position} />
      ))}
    </div>
  );
}

function FlexibleLoanCard({ position }: { position: FlexibleLoanPosition }) {
  const [isManaging, setIsManaging] = useState(false);
  const [actionType, setActionType] = useState<'addCollateral' | 'repayLoan' | 'withdrawCollateral' | 'increaseLoan' | null>(null);
  const [actionAmount, setActionAmount] = useState('');

  // Calcular valores
  const totalDebt = parseFloat(position.loanAmount) + parseFloat(position.accruedInterest);

  // Usar el hook de RiskCalculator para métricas reales
  const { riskMetrics, formatHealthFactor, formatCollateralizationRatio } = useRiskCalculator({
    collateralAsset: position.collateralAsset,
    loanAsset: position.loanAsset,
    collateralAmount: position.collateralAmount,
    loanAmount: totalDebt.toString(),
    interestRate: position.interestRate
  });

  const handleAction = (action: typeof actionType) => {
    setActionType(action);
    setIsManaging(true);
    setActionAmount('');
  };

  const closeModal = () => {
    setIsManaging(false);
    setActionType(null);
    setActionAmount('');
  };

  const getCalls = async () => {
    // Aquí implementaremos las llamadas a los contratos
    return [];
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100/50 shadow-lg p-6 transition-all hover:shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {/* Asset Information */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{position.collateralIcon}</span>
                <div>
                  <div className="font-medium text-blue-900">
                    {parseFloat(position.collateralAmount).toLocaleString()} {position.collateralSymbol}
                  </div>
                  <div className="text-sm text-blue-600">Collateral</div>
                </div>
              </div>
              
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">{position.loanIcon}</span>
                <div>
                  <div className="font-medium text-blue-900">
                    {totalDebt.toLocaleString()} {position.loanSymbol}
                  </div>
                  <div className="text-sm text-blue-600">Borrowed + Interest</div>
                </div>
              </div>
            </div>

            {/* Health Factor */}
            <div className="flex items-center gap-2 mb-3">
              {riskMetrics ? (
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRiskLevelBgColor(riskMetrics.riskLevel)}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className={getRiskLevelColor(riskMetrics.riskLevel)}>
                    Health: {formatHealthFactor(riskMetrics.healthFactor)}
                  </span>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  Health: Calculating...
                </div>
              )}
              <div className="text-sm text-blue-600">
                Interest: {position.interestRate}% APR
              </div>
            </div>

            {/* Position Details */}
            <div className="text-sm text-blue-600 space-y-1">
              <div>Position ID: #{position.positionId}</div>
              <div>Created: {new Date(position.createdAt * 1000).toLocaleDateString()}</div>
              {parseFloat(position.accruedInterest) > 0 && (
                <div className="text-yellow-600">
                  Accrued Interest: {parseFloat(position.accruedInterest).toFixed(4)} {position.loanSymbol}
                </div>
              )}
              {riskMetrics && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-gray-500">Collateral Ratio:</span>
                    <div className="font-medium">{formatCollateralizationRatio(riskMetrics.collateralizationRatio)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Liquidation Price:</span>
                    <div className="font-medium">${riskMetrics.liquidationPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Withdrawable:</span>
                    <div className="font-medium">{riskMetrics.maxWithdrawable.toFixed(2)} {position.collateralSymbol}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Price Drop Risk:</span>
                    <div className={`font-medium ${riskMetrics.priceDropToLiquidation < 10 ? 'text-red-600' : riskMetrics.priceDropToLiquidation < 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {riskMetrics.priceDropToLiquidation.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={() => handleAction('addCollateral')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Collateral
            </button>
            
            <button
              onClick={() => handleAction('increaseLoan')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Borrow More
            </button>
            
            <button
              onClick={() => handleAction('repayLoan')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Repay
            </button>
            
            <button
              onClick={() => handleAction('withdrawCollateral')}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {isManaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-900">
                {actionType === 'addCollateral' && 'Add Collateral'}
                {actionType === 'repayLoan' && 'Repay Loan'}
                {actionType === 'withdrawCollateral' && 'Withdraw Collateral'}
                {actionType === 'increaseLoan' && 'Increase Loan'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">
                    {(actionType === 'addCollateral' || actionType === 'withdrawCollateral') 
                      ? position.collateralSymbol 
                      : position.loanSymbol}
                  </span>
                </div>
              </div>

              <Transaction 
                chainId={84532}
                calls={getCalls}
                onStatus={(status: LifecycleStatus) => {
                  if (status.statusName === 'success') {
                    closeModal();
                  }
                }}
              >
                <TransactionButton 
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  text={
                    actionType === 'addCollateral' ? 'Add Collateral' :
                    actionType === 'repayLoan' ? 'Repay Loan' :
                    actionType === 'withdrawCollateral' ? 'Withdraw Collateral' :
                    'Increase Loan'
                  }
                  disabled={!actionAmount || parseFloat(actionAmount) <= 0}
                />
                
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
              </Transaction>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 