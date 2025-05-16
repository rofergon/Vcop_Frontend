import { parseUnits } from 'viem';

// Contract addresses from environment
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS;
const COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;

/**
 * Generate calls for creating a new loan position
 */
export async function createLoanCalls(collateralAmount: string, utilizationRate: string) {
  const collateralWei = parseUnits(collateralAmount, 6); // USDC has 6 decimals
  const utilizationBps = parseInt(utilizationRate) * 100; // Convert percentage to basis points
  
  return [
    // First approve USDC transfer to collateral manager
    {
      address: USDC_ADDRESS as `0x${string}`,
      abi: [{
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }],
      functionName: 'approve',
      args: [COLLATERAL_MANAGER_ADDRESS as `0x${string}`, collateralWei]
    },
    // Then create the position
    {
      address: COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
      abi: [{
        name: 'createPosition',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'collateralToken', type: 'address' },
          { name: 'collateralAmount', type: 'uint256' },
          { name: 'utilizationRate', type: 'uint256' }
        ],
        outputs: []
      }],
      functionName: 'createPosition',
      args: [USDC_ADDRESS as `0x${string}`, collateralWei, BigInt(utilizationBps)]
    }
  ];
}

/**
 * Generate calls for adding collateral to an existing position
 */
export async function addCollateralCalls(positionId: number, collateralAmount: string) {
  const collateralWei = parseUnits(collateralAmount, 6); // USDC has 6 decimals
  
  return [
    // First approve USDC transfer to collateral manager
    {
      address: USDC_ADDRESS as `0x${string}`,
      abi: [{
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }],
      functionName: 'approve',
      args: [COLLATERAL_MANAGER_ADDRESS as `0x${string}`, collateralWei]
    },
    // Then add collateral
    {
      address: COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
      abi: [{
        name: 'addCollateral',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'positionId', type: 'uint256' },
          { name: 'collateralAmount', type: 'uint256' }
        ],
        outputs: []
      }],
      functionName: 'addCollateral',
      args: [BigInt(positionId), collateralWei]
    }
  ];
}

/**
 * Generate calls for withdrawing collateral from an existing position
 */
export async function withdrawCollateralCalls(positionId: number, collateralAmount: string) {
  const collateralWei = parseUnits(collateralAmount, 6); // USDC has 6 decimals
  
  return [
    {
      address: COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
      abi: [{
        name: 'withdrawCollateral',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'positionId', type: 'uint256' },
          { name: 'collateralAmount', type: 'uint256' }
        ],
        outputs: []
      }],
      functionName: 'withdrawCollateral',
      args: [BigInt(positionId), collateralWei]
    }
  ];
}

/**
 * Generate calls for repaying a loan
 */
export async function repayLoanCalls(positionId: number, vcopAmount: string) {
  const vcopWei = parseUnits(vcopAmount, 6); // VCOP has 6 decimals
  
  return [
    // First approve VCOP transfer to collateral manager
    {
      address: VCOP_ADDRESS as `0x${string}`,
      abi: [{
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }],
      functionName: 'approve',
      args: [COLLATERAL_MANAGER_ADDRESS as `0x${string}`, vcopWei]
    },
    // Then repay the loan
    {
      address: COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
      abi: [{
        name: 'repayLoan',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'positionId', type: 'uint256' },
          { name: 'vcopAmount', type: 'uint256' }
        ],
        outputs: []
      }],
      functionName: 'repayLoan',
      args: [BigInt(positionId), vcopWei]
    }
  ];
} 