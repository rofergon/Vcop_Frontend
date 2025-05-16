import { parseUnits } from 'viem';

// Get contract addresses from environment variables
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS as `0x${string}`;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
const VCOP_COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`;
const VCOP_COLLATERAL_HOOK_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`;

// Base Sepolia Chain ID
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// ERC20 ABI para verificación de allowances
export const ERC20_ALLOWANCE_ABI = [
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

// Valor máximo para aprobaciones (uint256.max)
export const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// Función para crear una llamada de aprobación de token ERC20 (usando MAX_UINT256)
export const createApproveCall = (token: `0x${string}`, spender: `0x${string}`, amount: string) => {
  // Si no se especifica cantidad, usamos uint256.max
  const parsedAmount = amount === 'max' ? MAX_UINT256 : parseUnits(amount, 6);
  console.log(`Creating approval call: token=${token}, spender=${spender}, amount=${amount === 'max' ? 'MAX_UINT256' : amount}`);
  
  return {
    to: token,
    data: `0x095ea7b3${spender.slice(2).padStart(64, '0')}${BigInt(parsedAmount.toString()).toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create a transaction call to create a loan position
export const createPositionCall = (collateralAmount: string, vcopAmount: string) => {
  const parsedCollateral = parseUnits(collateralAmount, 6);
  const parsedVcop = parseUnits(vcopAmount, 6);
  
  console.log(`Creating position call: collateral=${collateralAmount} USDC, vcop=${vcopAmount} VCOP`);
  console.log(`Parsed values: collateral=${parsedCollateral.toString()}, vcop=${parsedVcop.toString()}`);
  
  return {
    to: VCOP_COLLATERAL_MANAGER_ADDRESS,
    data: `0x8a69fdb7${USDC_ADDRESS.slice(2).padStart(64, '0')}${parsedCollateral.toString(16).padStart(64, '0')}${parsedVcop.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create a transaction call to add collateral to an existing position
export const addCollateralCall = (positionId: number, amount: string) => {
  const parsedAmount = parseUnits(amount, 6);
  
  console.log(`Adding collateral call: positionId=${positionId}, amount=${amount} USDC`);
  
  return {
    to: VCOP_COLLATERAL_MANAGER_ADDRESS,
    data: `0xf68016b7${BigInt(positionId).toString(16).padStart(64, '0')}${parsedAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create a transaction call to withdraw collateral from a position
export const withdrawCollateralCall = (positionId: number, amount: string) => {
  const parsedAmount = parseUnits(amount, 6);
  
  console.log(`Withdrawing collateral call: positionId=${positionId}, amount=${amount} USDC`);
  
  return {
    to: VCOP_COLLATERAL_MANAGER_ADDRESS,
    data: `0x047a52d2${BigInt(positionId).toString(16).padStart(64, '0')}${parsedAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create a transaction call to repay loan debt
export const repayDebtCall = (positionId: number, amount: string) => {
  const parsedAmount = parseUnits(amount, 6);
  
  console.log(`Repaying debt call: positionId=${positionId}, amount=${amount} VCOP`);
  
  return {
    to: VCOP_COLLATERAL_MANAGER_ADDRESS,
    data: `0xba636ccb${BigInt(positionId).toString(16).padStart(64, '0')}${parsedAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create transaction calls for PSM swap VCOP -> USDC
export const psmSwapVcopForCollateralCall = (amount: string) => {
  const parsedAmount = parseUnits(amount, 6);
  
  console.log(`PSM swap VCOP -> USDC call: amount=${amount} VCOP`);
  
  return {
    to: VCOP_COLLATERAL_HOOK_ADDRESS,
    data: `0x0e52c9d1${parsedAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to create transaction calls for PSM swap USDC -> VCOP
export const psmSwapCollateralForVcopCall = (amount: string) => {
  const parsedAmount = parseUnits(amount, 6);
  
  console.log(`PSM swap USDC -> VCOP call: amount=${amount} USDC`);
  
  return {
    to: VCOP_COLLATERAL_HOOK_ADDRESS,
    data: `0x5bae8417${parsedAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
    value: 0n
  };
};

// Function to generate create loan position transaction calls
export const generateCreateLoanCalls = (collateralAmount: string, vcopAmount: string) => {
  console.log('Generating create loan calls without allowance check');
  return [
    // 1. Approve USDC spending by collateral manager (using max uint256)
    createApproveCall(USDC_ADDRESS, VCOP_COLLATERAL_MANAGER_ADDRESS, 'max'),
    // 2. Create the loan position
    createPositionCall(collateralAmount, vcopAmount)
  ];
};

// Function to generate add collateral transaction calls
export const generateAddCollateralCalls = (positionId: number, amount: string) => {
  console.log('Generating add collateral calls');
  return [
    // 1. Approve USDC spending by collateral manager (using max uint256)
    createApproveCall(USDC_ADDRESS, VCOP_COLLATERAL_MANAGER_ADDRESS, 'max'),
    // 2. Add collateral to position
    addCollateralCall(positionId, amount)
  ];
};

// Function to generate withdraw collateral transaction call
export const generateWithdrawCollateralCalls = (positionId: number, amount: string) => {
  console.log('Generating withdraw collateral calls');
  return [
    // Single step to withdraw collateral
    withdrawCollateralCall(positionId, amount)
  ];
};

// Function to generate repay debt transaction calls
export const generateRepayDebtCalls = (positionId: number, amount: string) => {
  console.log('Generating repay debt calls');
  return [
    // 1. Approve VCOP spending by collateral manager (using max uint256)
    createApproveCall(VCOP_ADDRESS, VCOP_COLLATERAL_MANAGER_ADDRESS, 'max'),
    // 2. Repay debt
    repayDebtCall(positionId, amount)
  ];
};

// Function to generate PSM swap VCOP for USDC transaction calls
export const generateSwapVcopForUsdcCalls = (amount: string) => {
  console.log('Generating VCOP -> USDC swap calls');
  return [
    // 1. Approve VCOP spending by hook (using max uint256)
    createApproveCall(VCOP_ADDRESS, VCOP_COLLATERAL_HOOK_ADDRESS, 'max'),
    // 2. Swap VCOP for collateral
    psmSwapVcopForCollateralCall(amount)
  ];
};

// Function to generate PSM swap USDC for VCOP transaction calls
export const generateSwapUsdcForVcopCalls = (amount: string) => {
  console.log('Generating USDC -> VCOP swap calls');
  return [
    // 1. Approve USDC spending by hook (using max uint256)
    createApproveCall(USDC_ADDRESS, VCOP_COLLATERAL_HOOK_ADDRESS, 'max'),
    // 2. Swap USDC for VCOP
    psmSwapCollateralForVcopCall(amount)
  ];
}; 