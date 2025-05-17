import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import type { Abi, Address } from 'viem';
import VCOPCollateralManagerABI from '../../abi/VCOPCollateralManager.json';
import { CollateralService } from '../../services/CollateralService';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  type LifecycleStatus 
} from '@coinbase/onchainkit/transaction';
import { parseUnits } from 'viem';

interface Position {
  collateralToken: string;
  collateralAmount: bigint;
  vcopMinted: bigint;
  ratio: number;
  isAtRisk: boolean;
  positionId: number;
}

// The contract returns an array with [collateralToken, collateralAmount, vcopMinted]
type ContractPositionResult = [Address, bigint, bigint];

interface CollateralInfo {
  token: Address;
  ratio: bigint;
  mintFee: bigint;
  burnFee: bigint;
  liquidationThreshold: bigint;
  active: boolean;
}

const COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;

// Custom hook to fetch collateral info
function useCollateralInfo(token: Address | undefined) {
  const { data: collateralInfo } = useContractRead({
    address: COLLATERAL_MANAGER_ADDRESS as Address,
    abi: VCOPCollateralManagerABI as Abi,
    functionName: 'collaterals',
    args: token ? [token] : undefined,
    chainId: 84532,
    query: {
      enabled: !!token
    }
  });

  return collateralInfo as CollateralInfo | undefined;
}

export default function ActiveLoans() {
  const { address } = useAccount();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // Get total position count
  const { data: positionCount } = useContractRead({
    address: COLLATERAL_MANAGER_ADDRESS as Address,
    abi: VCOPCollateralManagerABI as Abi,
    functionName: 'positionCount',
    args: address ? [address] : undefined,
    chainId: 84532,
  });

  // Get all positions using useContractReads
  const { data: positionsData } = useContractReads({
    contracts: address && positionCount ? 
      Array.from({ length: Number(positionCount) }, (_, i) => ({
        address: COLLATERAL_MANAGER_ADDRESS as Address,
        abi: VCOPCollateralManagerABI as Abi,
        functionName: 'positions',
        args: [address, BigInt(i)],
        chainId: 84532,
      })) : [],
  });

  // Get all ratios using useContractReads
  const { data: ratiosData } = useContractReads({
    contracts: address && positionCount && positionsData ? 
      positionsData.map((_position, i) => ({
        address: COLLATERAL_MANAGER_ADDRESS as Address,
        abi: VCOPCollateralManagerABI as Abi,
        functionName: 'getCurrentCollateralRatio',
        args: [address, BigInt(i)],
        chainId: 84532,
      })).filter(contract => 
        // Only get ratios for positions with collateral
        (positionsData[Number(contract.args[1])]?.result as ContractPositionResult)?.[1] > 0n
      ) : [],
  });

  // Get collateral info for the first position's token
  const firstPositionResult = positionsData?.[0]?.result as ContractPositionResult | undefined;
  const collateralInfo = useCollateralInfo(firstPositionResult?.[0]);

  // Update positions when data changes
  useEffect(() => {
    if (!address || !positionCount || !positionsData) {
      setLoading(false);
      setPositions([]);
      return;
    }

    const newPositions: Position[] = [];
    
    for (let i = 0; i < positionsData.length; i++) {
      const positionResult = positionsData[i].result as ContractPositionResult;
      
      if (positionResult && positionResult[1] > 0n) { // Check if collateralAmount > 0
        const ratio = ratiosData?.[i]?.result as bigint ?? 0n;
        
        newPositions.push({
          collateralToken: positionResult[0],
          collateralAmount: positionResult[1],
          vcopMinted: positionResult[2],
          ratio: Number(ratio) / 10000, // Convert from basis points to percentage
          isAtRisk: collateralInfo ? ratio < collateralInfo.liquidationThreshold : false,
          positionId: i
        });
      }
    }

    setPositions(newPositions);
    setLoading(false);
  }, [address, positionCount, positionsData, ratiosData, collateralInfo]);

  // Debug logging
  useEffect(() => {
    console.log('Current address:', address);
    console.log('Position count:', positionCount);
    console.log('Positions data:', positionsData?.map(p => ({
      ...p,
      result: p.result ? {
        collateralToken: (p.result as ContractPositionResult)[0],
        collateralAmount: (p.result as ContractPositionResult)[1].toString(),
        vcopMinted: (p.result as ContractPositionResult)[2].toString()
      } : null
    })));
    console.log('Ratios data:', ratiosData?.map(r => ({
      ...r,
      result: r.result ? Number(r.result as bigint) / 10000 + '%' : null
    })));
    console.log('Processed positions:', positions);
  }, [address, positionCount, positionsData, ratiosData, positions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-blue-500 mt-4 text-sm">Loading loans...</p>
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
        <p className="text-blue-700 font-medium mb-2">You don't have any active loans</p>
        <p className="text-blue-500/80 text-sm text-center">Create a new loan to start using the platform!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <PositionCard key={position.positionId} position={position} />
      ))}
    </div>
  );
}

function PositionCard({ position }: { position: Position }) {
  const [isAddingCollateral, setIsAddingCollateral] = useState(false);
  const [isRepayingDebt, setIsRepayingDebt] = useState(false);
  const [isWithdrawingCollateral, setIsWithdrawingCollateral] = useState(false);
  const [amount, setAmount] = useState('');
  const [calls, setCalls] = useState<any>(null);

  const handleAddCollateral = () => {
    setIsAddingCollateral(true);
  };

  const handleRepayDebt = () => {
    setIsRepayingDebt(true);
  };

  const handleWithdrawCollateral = () => {
    setIsWithdrawingCollateral(true);
  };

  const handleConfirmAction = async () => {
    if (!amount) return;

    try {
      console.log('Preparing transaction...', {
        isAddingCollateral,
        isRepayingDebt,
        isWithdrawingCollateral,
        positionId: position.positionId,
        amount,
        parsedAmount: parseUnits(amount, 6).toString()
      });

      let transactionCalls;
      if (isAddingCollateral) {
        transactionCalls = await CollateralService.addCollateral(
          position.positionId,
          parseUnits(amount, 6) // USDC has 6 decimals
        );
      } else if (isRepayingDebt) {
        transactionCalls = await CollateralService.repayDebt(
          position.positionId,
          parseUnits(amount, 18) // VCOP has 18 decimals
        );
      } else if (isWithdrawingCollateral) {
        transactionCalls = await CollateralService.withdrawCollateral(
          position.positionId,
          parseUnits(amount, 6) // USDC has 6 decimals
        );
      }

      console.log('Transaction calls prepared:', transactionCalls);

      // Set the calls for the Transaction component
      setCalls(Array.isArray(transactionCalls) ? transactionCalls : [transactionCalls]);
    } catch (error) {
      console.error('Error preparing transaction:', error);
    }
  };

  const handleTransactionStatus = (status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    if (status.statusName === 'success') {
      console.log('Transaction successful, cleaning up...');
      handleCancel();
      // Aquí podrías refrescar los datos de la posición si es necesario
      window.location.reload(); // Recargar la página para ver los cambios
    }
  };

  const handleCancel = () => {
    setAmount('');
    setIsAddingCollateral(false);
    setIsRepayingDebt(false);
    setIsWithdrawingCollateral(false);
    setCalls(null);
  };

  const renderActionModal = () => {
    if (!isAddingCollateral && !isRepayingDebt && !isWithdrawingCollateral) return null;

    let title = '';
    let actionText = '';
    let maxAmount = '';

    if (isAddingCollateral) {
      title = 'Add Collateral';
      actionText = 'Add';
      maxAmount = formatUnits(position.collateralAmount, 6);
    } else if (isRepayingDebt) {
      title = 'Repay Debt';
      actionText = 'Repay';
      maxAmount = formatEther(position.vcopMinted);
    } else {
      title = 'Withdraw Collateral';
      actionText = 'Withdraw';
      maxAmount = formatUnits(position.collateralAmount, 6);
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">{title}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Amount ({isRepayingDebt ? 'VCOP' : 'USDC'})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Max: ${maxAmount}`}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setAmount(maxAmount)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Max
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {!calls ? (
                <button
                  onClick={handleConfirmAction}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {actionText}
                </button>
              ) : (
                <Transaction
                  chainId={84532}
                  calls={calls}
                  onStatus={handleTransactionStatus}
                >
                  <TransactionButton 
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    text={actionText}
                  />
                  <div className="mt-3">
                    <TransactionStatus>
                      <div className="flex items-center gap-2 text-sm bg-blue-50/30 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50">
                        <TransactionStatusLabel />
                        <div className="ml-auto">
                          <TransactionStatusAction />
                        </div>
                      </div>
                    </TransactionStatus>
                  </div>
                </Transaction>
              )}
              
              <button
                onClick={handleCancel}
                className="w-full px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border transition-all hover:shadow-lg ${
      position.isAtRisk ? 'border-red-300 bg-red-50/20' : 'border-blue-100/50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Position #{position.positionId + 1}
          </h3>
          <p className="text-sm text-blue-500/80 mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatUnits(position.collateralAmount, 6)} USDC
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
          position.isAtRisk 
            ? 'bg-red-100/80 text-red-800' 
            : 'bg-green-100/80 text-green-800'
        }`}>
          {position.isAtRisk ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              At risk
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Safe
            </>
          )}
        </div>
      </div>

      <div className="bg-blue-50/50 backdrop-blur-sm rounded-lg p-4 border border-blue-100/50 space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-blue-700 flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Debt:
          </span>
          <span className="font-medium text-blue-900">{formatEther(position.vcopMinted)} VCOP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700 flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Collateral ratio:
          </span>
          <span className={`font-medium ${
            position.isAtRisk ? 'text-red-600' : 'text-green-600'
          }`}>
            {position.ratio.toFixed(2)}%
          </span>
        </div>
        
        {/* Progress bar for collateral ratio */}
        <div className="w-full bg-gray-200/60 rounded-full h-2.5 mt-1">
          <div 
            className={`h-2.5 rounded-full ${
              position.ratio >= 200 ? "bg-green-500" : 
              position.ratio >= 150 ? "bg-yellow-500" : 
              "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, (position.ratio / 250) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAddCollateral}
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all shadow-sm flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Collateral
        </button>
        <button
          onClick={handleRepayDebt}
          className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Repay Debt
        </button>
        {!position.isAtRisk && (
          <button
            onClick={handleWithdrawCollateral}
            className="col-span-2 px-4 py-2 bg-blue-50/50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100/50 transition-all mt-1 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Withdraw Collateral
          </button>
        )}
      </div>
      
      {renderActionModal()}
    </div>
  );
} 