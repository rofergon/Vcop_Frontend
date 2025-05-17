import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import type { Abi, Address } from 'viem';
import VCOPCollateralManagerABI from '../../abi/VCOPCollateralManager.json';
import { CollateralService, LiquidatablePosition } from '../../services/CollateralService';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  type LifecycleStatus 
} from '@coinbase/onchainkit/transaction';
import { parseUnits } from 'viem';

const COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;

// List of known addresses that have positions we can examine
// In a real application, this would be dynamically discovered through events or a graph node
const KNOWN_USERS: Address[] = [
  // You would populate this with actual addresses from your network
  // This could also be replaced with a subgraph query in a production app
];

// Mock data for demonstration purposes
const MOCK_LIQUIDATABLE_POSITIONS: LiquidatablePosition[] = [
  {
    owner: '0x1234567890123456789012345678901234567890' as Address,
    positionId: 1,
    collateralToken: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address,
    collateralAmount: BigInt(1500000000), // 1,500 USDC
    vcopMinted: BigInt(1400000000),       // 1,400 VCOP
    ratio: 107.14,                        // 107.14%
    liquidationThreshold: 120.00          // 120%
  },
  {
    owner: '0x2345678901234567890123456789012345678901' as Address,
    positionId: 3,
    collateralToken: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address,
    collateralAmount: BigInt(2500000000), // 2,500 USDC
    vcopMinted: BigInt(2200000000),       // 2,200 VCOP
    ratio: 113.64,                        // 113.64%
    liquidationThreshold: 120.00          // 120%
  },
  {
    owner: '0x3456789012345678901234567890123456789012' as Address,
    positionId: 5,
    collateralToken: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address,
    collateralAmount: BigInt(5000000000), // 5,000 USDC
    vcopMinted: BigInt(4350000000),       // 4,350 VCOP
    ratio: 114.94,                        // 114.94%
    liquidationThreshold: 120.00          // 120%
  }
];

export default function LiquidationMarketplace() {
  const { address } = useAccount();
  const [liquidatablePositions, setLiquidatablePositions] = useState<LiquidatablePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPositions, setFetchingPositions] = useState(false);
  const [showingMockData, setShowingMockData] = useState(false);

  // Manually trigger a scan for liquidatable positions
  const scanForLiquidatablePositions = async () => {
    setFetchingPositions(true);
    
    try {
      // This is a simplified example - in a production environment you would:
      // 1. Use a subgraph to index all positions
      // 2. Or scan events from the blockchain for PositionCreated events
      // 3. Or have a backend service that maintains a list of all positions

      const liquidatablePositionsFound: LiquidatablePosition[] = [];
      
      // For now we'll just check known users
      for (const user of KNOWN_USERS) {
        try {
          // Get position count for this user
          const positionCountResponse = await fetch(`https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 1,
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: COLLATERAL_MANAGER_ADDRESS,
                data: `0x8f601f66000000000000000000000000${user.slice(2)}`  // positionCount(address)
              }, 'latest']
            })
          });
          
          const positionCountData = await positionCountResponse.json();
          const positionCount = parseInt(positionCountData.result, 16);
          
          // Check each position
          for (let i = 0; i < positionCount; i++) {
            try {
              // Get position details
              const positionResponse = await fetch(`https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: 1,
                  jsonrpc: '2.0',
                  method: 'eth_call',
                  params: [{
                    to: COLLATERAL_MANAGER_ADDRESS,
                    data: `0x9223b115000000000000000000000000${user.slice(2)}${i.toString(16).padStart(64, '0')}` // positions(address,uint256)
                  }, 'latest']
                })
              });
              
              const positionData = await positionResponse.json();
              // Parse position data (collateralToken, collateralAmount, vcopMinted)
              // This is a simplification - you'd need to properly decode the response
              const collateralToken = '0x' + positionData.result.slice(26, 66);
              const collateralAmount = BigInt('0x' + positionData.result.slice(66, 130));
              const vcopMinted = BigInt('0x' + positionData.result.slice(130, 194));
              
              if (collateralAmount > 0n) {
                // Get collateral ratio
                const ratioResponse = await fetch(`https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                      to: COLLATERAL_MANAGER_ADDRESS,
                      data: `0x69a4246d000000000000000000000000${user.slice(2)}${i.toString(16).padStart(64, '0')}` // getCurrentCollateralRatio(address,uint256)
                    }, 'latest']
                  })
                });
                
                const ratioData = await ratioResponse.json();
                const ratio = parseInt('0x' + ratioData.result.slice(2), 16) / 10000; // convert from basis points
                
                // Get liquidation threshold
                const collateralInfoResponse = await fetch(`https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                      to: COLLATERAL_MANAGER_ADDRESS,
                      data: `0x4108936c000000000000000000000000${collateralToken.slice(2)}` // collaterals(address)
                    }, 'latest']
                  })
                });
                
                const collateralInfoData = await collateralInfoResponse.json();
                // Extract liquidation threshold (5th parameter)
                const liquidationThreshold = parseInt('0x' + collateralInfoData.result.slice(258, 322), 16) / 10000;
                
                // Check if position is liquidatable
                if (ratio < liquidationThreshold) {
                  liquidatablePositionsFound.push({
                    owner: user,
                    positionId: i,
                    collateralToken: collateralToken as Address,
                    collateralAmount,
                    vcopMinted,
                    ratio,
                    liquidationThreshold
                  });
                }
              }
            } catch (error) {
              console.error(`Error checking position ${i} for user ${user}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error getting position count for user ${user}:`, error);
        }
      }
      
      // If no real positions found, use mock data
      if (liquidatablePositionsFound.length === 0) {
        setLiquidatablePositions(MOCK_LIQUIDATABLE_POSITIONS);
        setShowingMockData(true);
      } else {
        setLiquidatablePositions(liquidatablePositionsFound);
        setShowingMockData(false);
      }
    } catch (error) {
      console.error('Error scanning for liquidatable positions:', error);
      // Show mock data in case of error
      setLiquidatablePositions(MOCK_LIQUIDATABLE_POSITIONS);
      setShowingMockData(true);
    } finally {
      setFetchingPositions(false);
      setLoading(false);
    }
  };

  // Initial scan
  useEffect(() => {
    scanForLiquidatablePositions();
  }, []);

  if (loading && !fetchingPositions) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-blue-500 mt-4 text-sm">Loading liquidation marketplace...</p>
        </div>
      </div>
    );
  }

  if (!liquidatablePositions.length) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-50/30 backdrop-blur-sm rounded-xl border border-blue-100/50 h-48">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-blue-700 font-medium mb-2">No liquidatable positions found</p>
          <p className="text-blue-500/80 text-sm text-center mb-4">All positions are currently well-collateralized.</p>
          
          <button 
            onClick={scanForLiquidatablePositions}
            disabled={fetchingPositions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
          >
            {fetchingPositions ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Scanning...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scan Again
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Liquidatable Positions</h2>
          {showingMockData && (
            <p className="text-xs text-gray-500 mt-1">
              Mostrando datos de demostración (mock). Estas posiciones no existen en la blockchain.
            </p>
          )}
        </div>
        <button 
          onClick={scanForLiquidatablePositions}
          disabled={fetchingPositions}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
        >
          {fetchingPositions ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Scanning...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>
      
      {liquidatablePositions.map((position) => (
        <LiquidatablePositionCard 
          key={`${position.owner}-${position.positionId}`} 
          position={position} 
          isMock={showingMockData} 
        />
      ))}
    </div>
  );
}

function LiquidatablePositionCard({ position, isMock }: { position: LiquidatablePosition, isMock: boolean }) {
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [calls, setCalls] = useState<any>(null);

  // Format VCOP amount with proper decimals (6 decimals)
  const formattedVCOPDebt = Number(position.vcopMinted) / 1e6;
  // Format USDC amount with proper decimals (6 decimals)
  const formattedCollateral = Number(position.collateralAmount) / 1e6;

  // Format for display with commas and fixed decimals
  const displayVCOPDebt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(formattedVCOPDebt);

  const displayCollateral = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(formattedCollateral);

  // Get profit estimates
  const collateralValue = formattedCollateral;
  const debtValue = formattedVCOPDebt;
  const estimatedProfit = collateralValue - debtValue;

  const handleLiquidate = async () => {
    if (isMock) {
      alert("Esta es una demostración. En un entorno real, esta acción liquidaría la posición en la blockchain.");
      return;
    }
    
    setIsLiquidating(true);

    try {
      console.log('Preparing liquidation transaction...', {
        owner: position.owner,
        positionId: position.positionId,
        vcopAmount: position.vcopMinted.toString()
      });

      const transactionCalls = await CollateralService.liquidatePosition(
        position.owner,
        position.positionId,
        position.vcopMinted
      );

      console.log('Transaction calls prepared:', transactionCalls);

      // Set the calls for the Transaction component
      setCalls(Array.isArray(transactionCalls) ? transactionCalls : [transactionCalls]);
    } catch (error) {
      console.error('Error preparing transaction:', error);
      setIsLiquidating(false);
    }
  };

  const handleTransactionStatus = (status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    if (status.statusName === 'success') {
      console.log('Liquidation successful!');
      setIsLiquidating(false);
      setCalls(null);
      window.location.reload(); // Refresh the page to update the list
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-red-100/50 hover:shadow transition-all">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-100 text-red-700 text-xs font-semibold mr-2">
              #{position.positionId}
            </span>
            <span className="text-sm font-medium text-gray-500 truncate">
              Owner: {position.owner.slice(0, 6)}...{position.owner.slice(-4)}
            </span>
            {isMock && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">MOCK</span>
            )}
          </div>
          
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Collateral:</span>
              <span className="text-sm font-medium text-blue-800">{displayCollateral} USDC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Debt:</span>
              <span className="text-sm font-medium text-red-700">{displayVCOPDebt} VCOP</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium mr-1.5 text-gray-500">Ratio:</span>
            <span className="font-medium text-sm text-red-600">{position.ratio.toFixed(2)}%</span>
            <span className="text-xs text-gray-400 ml-1">/ {position.liquidationThreshold.toFixed(2)}%</span>
          </div>
          
          <div className="mb-2">
            <div className="text-xs font-medium text-green-600">
              Est. Profit: {estimatedProfit.toFixed(2)} USDC
            </div>
          </div>
          
          {!calls ? (
            <button
              onClick={handleLiquidate}
              disabled={isLiquidating}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center"
            >
              {isLiquidating ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1.5"></div>
                  Preparing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Liquidate Position
                </>
              )}
            </button>
          ) : (
            <Transaction
              chainId={84532}
              calls={calls}
              onStatus={handleTransactionStatus}
            >
              <TransactionButton 
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
                text="Liquidate"
              />
              <div className="mt-2">
                <TransactionStatus>
                  <div className="flex items-center gap-2 text-xs bg-red-50/30 backdrop-blur-sm rounded p-2 border border-red-100/50">
                    <TransactionStatusLabel />
                    <div className="ml-auto">
                      <TransactionStatusAction />
                    </div>
                  </div>
                </TransactionStatus>
              </div>
            </Transaction>
          )}
        </div>
      </div>
    </div>
  );
} 