import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { useNavigate } from 'react-router-dom';

// ABI for getting positions
const COLLATERAL_MANAGER_ABI = [
  {
    name: 'positionCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'positions',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'positionId', type: 'uint256' }
    ],
    outputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'collateralAmount', type: 'uint256' },
      { name: 'vcopMinted', type: 'uint256' }
    ]
  },
  {
    name: 'getCurrentCollateralRatio',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'positionId', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// Type for a position
interface Position {
  id: number;
  collateralToken: string;
  collateralAmount: bigint;
  vcopMinted: bigint;
  ratio: number;
  formattedCollateral: string;
  formattedDebt: string;
  formattedRatio: string;
  isAtRisk: boolean;
}

// Props for position selection
interface CollateralPositionsProps {
  onSelectPosition?: (id: number) => void;
}

export default function CollateralPositions({ onSelectPosition }: CollateralPositionsProps) {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Contract addresses from environment variables
  const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;
  
  // Get user position count
  const { data: positionCount, refetch: refetchCount } = useContractRead({
    address: collateralManagerAddress as `0x${string}`,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'positionCount',
    args: [address as `0x${string}`],
  });
  
  // Load position data
  useEffect(() => {
    const loadPositions = async () => {
      if (!address || !positionCount || !collateralManagerAddress) {
        setPositions([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Create array of position ids to fetch
        const count = Number(positionCount);
        const positionIds = Array.from({ length: count }, (_, i) => i);
        
        // Create fetcher for position data
        const fetchPosition = async (id: number): Promise<Position | null> => {
          try {
            // Get position data
            const positionResult = await fetch(`/api/position?address=${address}&id=${id}`);
            
            if (!positionResult.ok) {
              console.error(`Failed to fetch position ${id}:`, await positionResult.text());
              return null;
            }
            
            const positionData = await positionResult.json();
            const collateralAmount = BigInt(positionData.collateralAmount);
            const vcopMinted = BigInt(positionData.vcopMinted);
            const ratio = positionData.ratio;
            
            // Format values for display
            const formattedCollateral = (Number(collateralAmount) / 10**6).toFixed(2);
            const formattedDebt = (Number(vcopMinted) / 10**6).toFixed(2);
            const formattedRatio = ratio.toFixed(2);
            
            return {
              id,
              collateralToken: positionData.collateralToken,
              collateralAmount,
              vcopMinted,
              ratio,
              formattedCollateral,
              formattedDebt,
              formattedRatio,
              isAtRisk: ratio < 150
            };
          } catch (error) {
            console.error(`Error fetching position ${id}:`, error);
            return null;
          }
        };
        
        // Fetch all positions in parallel
        const positionPromises = positionIds.map(fetchPosition);
        const positionResults = await Promise.all(positionPromises);
        
        // Filter out null results and sort by ID
        const validPositions = positionResults.filter((p): p is Position => p !== null)
          .sort((a, b) => a.id - b.id);
        
        setPositions(validPositions);
      } catch (error) {
        console.error('Error loading positions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPositions();
  }, [address, positionCount, collateralManagerAddress]);
  
  // Refresh position data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (address) {
        refetchCount();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [address, refetchCount]);
  
  // Handle position selection
  const handlePositionClick = (id: number) => {
    if (onSelectPosition) {
      onSelectPosition(id);
    } else {
      navigate(`/loans/position/${id}`);
    }
  };
  
  // Create a new position
  const handleCreatePosition = () => {
    navigate('/loans/create');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Collateral Positions</h2>
        <button 
          onClick={handleCreatePosition}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          New Position
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading positions...</p>
        </div>
      ) : positions.length > 0 ? (
        <div className="space-y-4">
          {positions.map((position) => (
            <div 
              key={position.id}
              onClick={() => handlePositionClick(position.id)}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Position #{position.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  position.isAtRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {position.isAtRisk ? 'At Risk' : 'Healthy'}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Collateral</p>
                  <p>{position.formattedCollateral} USDC</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Debt</p>
                  <p>{position.formattedDebt} VCOP</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ratio</p>
                  <p className={position.isAtRisk ? 'text-red-600' : 'text-green-600'}>
                    {position.formattedRatio}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500 mb-4">You don't have any collateral positions yet.</p>
          <button 
            onClick={handleCreatePosition}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          >
            Create Your First Position
          </button>
        </div>
      )}
    </div>
  );
} 