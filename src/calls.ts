import { parseUnits } from 'viem';

// Get contract addresses from environment variables
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS as string;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as string;
const VCOP_COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as string;
const VCOP_COLLATERAL_HOOK_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as string;

// Basic ERC20 ABI for approvals

// Collateral Manager ABI (simplified for calls)

// Collateral Hook ABI (simplified for PSM swaps)

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
  try {
    // Validate and parse the collateral amount
    const parsedCollateral = parseUnits(collateralAmount, 6);
    console.log(`Adding collateral: positionId=${positionId}, amount=${collateralAmount} USDC (${parsedCollateral} raw)`);

    return [
      // 1. Approve USDC transfer
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
  } catch (error) {
    console.error('Error preparing addCollateral transaction:', error);
    throw new Error(`Failed to prepare addCollateral transaction: ${error}`);
  }
};

// Function to withdraw collateral from a position
export const withdrawCollateralCalls = (positionId: number, withdrawAmount: string) => {
  try {
    // Validate and parse the withdraw amount
    const parsedAmount = parseUnits(withdrawAmount, 6);
    console.log(`Withdrawing collateral: positionId=${positionId}, amount=${withdrawAmount} USDC (${parsedAmount} raw)`);

    return [
      {
        to: toHexString(VCOP_COLLATERAL_MANAGER_ADDRESS),
        data: toHexString(`0x047a52d2${padTo64(BigInt(positionId).toString(16))}${padTo64(parsedAmount.toString(16))}`),
        value: 0n
      }
    ];
  } catch (error) {
    console.error('Error preparing withdrawCollateral transaction:', error);
    throw new Error(`Failed to prepare withdrawCollateral transaction: ${error}`);
  }
};

// Function to repay loan debt
export const repayLoanCalls = (positionId: number, repayAmount: string) => {
  try {
    // Validate and parse the repay amount
    const parsedAmount = parseUnits(repayAmount, 6);
    console.log(`Repaying loan: positionId=${positionId}, amount=${repayAmount} VCOP (${parsedAmount} raw)`);

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
  } catch (error) {
    console.error('Error preparing repayLoan transaction:', error);
    throw new Error(`Failed to prepare repayLoan transaction: ${error}`);
  }
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