import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import type { Abi, Address } from 'viem';
import VCOPCollateralManagerABI from '../../abi/VCOPCollateralManager.json';

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
      positionsData.map((position, i) => ({
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-2">You don't have any active loans yet.</p>
        <p className="text-sm text-gray-500">Create a new loan to get started!</p>
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
  const handleAddCollateral = async (positionId: number) => {
    // TODO: Implement add collateral logic
    console.log('Adding collateral to position:', positionId);
  };

  const handleRepayDebt = async (positionId: number) => {
    // TODO: Implement repay debt logic
    console.log('Repaying debt for position:', positionId);
  };

  const handleWithdrawCollateral = async (positionId: number) => {
    // TODO: Implement withdraw collateral logic
    console.log('Withdrawing collateral from position:', positionId);
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${
      position.isAtRisk ? 'border-red-300' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Position #{position.positionId + 1}</h3>
          <p className="text-sm text-gray-500">
            Collateral: {formatUnits(position.collateralAmount, 6)} USDC
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          position.isAtRisk 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {position.isAtRisk ? 'At Risk' : 'Safe'}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Debt:</span>
          <span className="font-medium">{formatEther(position.vcopMinted)} VCOP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Collateral Ratio:</span>
          <span className={`font-medium ${
            position.isAtRisk ? 'text-red-600' : 'text-green-600'
          }`}>
            {position.ratio.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleAddCollateral(position.positionId)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Collateral
        </button>
        <button
          onClick={() => handleRepayDebt(position.positionId)}
          className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          Repay Debt
        </button>
        {!position.isAtRisk && (
          <button
            onClick={() => handleWithdrawCollateral(position.positionId)}
            className="col-span-2 px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Withdraw Collateral
          </button>
        )}
      </div>
    </div>
  );
} 