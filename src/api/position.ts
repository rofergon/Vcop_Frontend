import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// ABI for getting position data
const COLLATERAL_MANAGER_ABI = [
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

// Public client for reading blockchain data
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(import.meta.env.VITE_RPC_URL),
});

// Contract address from environment variables
const collateralManagerAddress = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;

/**
 * Get position data for a specific user and position ID
 */
export async function getPositionData(address: string, positionId: number) {
  try {
    // Fetch position details
    const positionData = await publicClient.readContract({
      address: collateralManagerAddress as `0x${string}`,
      abi: COLLATERAL_MANAGER_ABI,
      functionName: 'positions',
      args: [address as `0x${string}`, BigInt(positionId)],
    }) as [string, bigint, bigint];
    
    // Fetch collateral ratio
    const collateralRatio = await publicClient.readContract({
      address: collateralManagerAddress as `0x${string}`,
      abi: COLLATERAL_MANAGER_ABI,
      functionName: 'getCurrentCollateralRatio',
      args: [address as `0x${string}`, BigInt(positionId)],
    }) as bigint;
    
    // Format data for response
    return {
      collateralToken: positionData[0],
      collateralAmount: positionData[1].toString(),
      vcopMinted: positionData[2].toString(),
      ratio: Number(collateralRatio) / 10000, // Convert BPS to percentage
    };
    
  } catch (error) {
    console.error('Error fetching position data:', error);
    throw new Error(`Failed to fetch position data for ${address}, position ${positionId}`);
  }
}

// Handler for API requests
export default async function handler(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get('address');
  const id = url.searchParams.get('id');
  
  if (!address || !id) {
    return new Response(
      JSON.stringify({ error: 'Missing address or position ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' }}
    );
  }
  
  try {
    const positionData = await getPositionData(address, parseInt(id));
    
    return new Response(
      JSON.stringify(positionData),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
} 