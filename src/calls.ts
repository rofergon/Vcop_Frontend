import { parseUnits } from 'viem';

// Get contract addresses from environment variables
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS as string;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as string;
const VCOP_COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as string;
const VCOP_COLLATERAL_HOOK_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as string;

// Basic ERC20 ABI for approvals
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// Collateral Manager ABI (simplified for calls)
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
  },
  {
    name: 'addCollateral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'positionId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'withdrawCollateral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'positionId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'repayDebt',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'positionId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getMaxVCOPforCollateral',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// Collateral Hook ABI (simplified for PSM swaps)
const COLLATERAL_HOOK_ABI = [
  {
    name: 'psmSwapVCOPForCollateral',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'vcopAmount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'psmSwapCollateralForVCOP',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'collateralAmount', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'getPSMStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'vcopReserve', type: 'uint256' },
      { name: 'collateralReserve', type: 'uint256' },
      { name: 'lastOperationTimestamp', type: 'uint256' },
      { name: 'totalSwapsCount', type: 'uint256' }
    ]
  }
];

// Function to create a hex string with 0x prefix
const toHexString = (value: string | bigint): `0x${string}` => {
  // If string starts with 0x, ensure it's lowercase for consistency
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value.toLowerCase() as `0x${string}`;
  }
  
  // For bigint or non-0x strings, convert to hex
  const hexString = typeof value === 'bigint' 
    ? value.toString(16) 
    : value.startsWith('0x') 
      ? value.slice(2) 
      : value;
      
  return `0x${hexString}` as `0x${string}`;
};

// Function to pad a hex string (without 0x prefix) to 64 characters
const padTo64 = (hex: string): string => {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return cleanHex.padStart(64, '0');
};

// Function to create a new loan position
export const createLoanCalls = (collateralAmount: string, vcopToMint: string) => {
  const parsedCollateral = parseUnits(collateralAmount, 6); // USDC has 6 decimals
  const parsedVcop = parseUnits(vcopToMint, 6); // VCOP has 6 decimals

  // Convert contract parameters to Call format expected by OnchainKit
  return [
    // 1. Approve USDC transfer to CollateralManager
    {
      to: toHexString(USDC_ADDRESS),
      data: toHexString(`0x095ea7b3${padTo64(VCOP_COLLATERAL_MANAGER_ADDRESS.slice(2))}${padTo64(parsedCollateral.toString(16))}`),
      value: 0n
    },
    // 2. Create loan position
    {
      to: toHexString(VCOP_COLLATERAL_MANAGER_ADDRESS),
      data: toHexString(`0x8a69fdb7${padTo64(USDC_ADDRESS.slice(2))}${padTo64(parsedCollateral.toString(16))}${padTo64(parsedVcop.toString(16))}`),
      value: 0n
    }
  ];
};

// Function to add more collateral to an existing position
export const addCollateralCalls = (positionId: number, collateralAmount: string) => {
  const parsedCollateral = parseUnits(collateralAmount, 6);

  return [
    // 1. Approve additional USDC transfer
    {
      to: toHexString(USDC_ADDRESS),
      data: toHexString(`0x095ea7b3${padTo64(VCOP_COLLATERAL_MANAGER_ADDRESS.slice(2))}${padTo64(parsedCollateral.toString(16))}`),
      value: 0n
    },
    // 2. Add collateral to existing position
    {
      to: toHexString(VCOP_COLLATERAL_MANAGER_ADDRESS),
      data: toHexString(`0xf68016b7${padTo64(BigInt(positionId).toString(16))}${padTo64(parsedCollateral.toString(16))}`),
      value: 0n
    }
  ];
};

// Function to withdraw collateral from a position
export const withdrawCollateralCalls = (positionId: number, withdrawAmount: string) => {
  const parsedAmount = parseUnits(withdrawAmount, 6);

  return [
    {
      to: toHexString(VCOP_COLLATERAL_MANAGER_ADDRESS),
      data: toHexString(`0x047a52d2${padTo64(BigInt(positionId).toString(16))}${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    }
  ];
};

// Function to repay loan debt
export const repayLoanCalls = (positionId: number, repayAmount: string) => {
  const parsedAmount = parseUnits(repayAmount, 6);

  return [
    // 1. Approve VCOP for CollateralManager
    {
      to: toHexString(VCOP_ADDRESS),
      data: toHexString(`0x095ea7b3${padTo64(VCOP_COLLATERAL_MANAGER_ADDRESS.slice(2))}${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    },
    // 2. Repay debt
    {
      to: toHexString(VCOP_COLLATERAL_MANAGER_ADDRESS),
      data: toHexString(`0xba636ccb${padTo64(BigInt(positionId).toString(16))}${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    }
  ];
};

// Function to swap VCOP for USDC through PSM
export const swapVcopToUsdcCalls = (amount: string) => {
  const parsedAmount = parseUnits(amount, 6);

  return [
    // 1. Approve VCOP for Hook
    {
      to: toHexString(VCOP_ADDRESS),
      data: toHexString(`0x095ea7b3${padTo64(VCOP_COLLATERAL_HOOK_ADDRESS.slice(2))}${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    },
    // 2. Execute swap
    {
      to: toHexString(VCOP_COLLATERAL_HOOK_ADDRESS),
      data: toHexString(`0x0e52c9d1${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    }
  ];
};

// Function to swap USDC for VCOP through PSM
export const swapUsdcToVcopCalls = (amount: string) => {
  const parsedAmount = parseUnits(amount, 6);

  return [
    // 1. Approve USDC for Hook
    {
      to: toHexString(USDC_ADDRESS),
      data: toHexString(`0x095ea7b3${padTo64(VCOP_COLLATERAL_HOOK_ADDRESS.slice(2))}${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    },
    // 2. Execute swap
    {
      to: toHexString(VCOP_COLLATERAL_HOOK_ADDRESS),
      data: toHexString(`0x5bae8417${padTo64(parsedAmount.toString(16))}`),
      value: 0n
    }
  ];
}; 