import { Transaction } from '@coinbase/onchainkit/transaction';
import { Address, parseAbi } from 'viem';

const COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS as Address;
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS as Address;

// Define the minimal ABI needed for our functions
const MINIMAL_ABI = parseAbi([
  'function withdrawCollateral(uint256 positionId, uint256 amount)',
  'function addCollateral(uint256 positionId, uint256 amount)',
  'function repayDebt(uint256 positionId, uint256 amount)',
  'function approve(address spender, uint256 amount)',
]);

export class CollateralService {
  /**
   * Add collateral to an existing position
   * @param positionId The ID of the position to add collateral to
   * @param amount The amount of collateral to add (in base units)
   */
  static async addCollateral(positionId: number, amount: bigint) {
    return {
      address: COLLATERAL_MANAGER_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'addCollateral',
      args: [BigInt(positionId), amount],
      chainId: 84532,
    };
  }

  /**
   * Withdraw collateral from a position
   * @param positionId The ID of the position to withdraw from
   * @param amount The amount of collateral to withdraw (in base units)
   */
  static async withdrawCollateral(positionId: number, amount: bigint) {
    console.log('Preparing withdrawCollateral transaction with:', {
      positionId,
      amount: amount.toString(),
      formattedAmount: Number(amount) / 1e6 + ' USDC'
    });

    return {
      address: COLLATERAL_MANAGER_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'withdrawCollateral',
      args: [BigInt(positionId), amount],
      chainId: 84532,
    };
  }

  /**
   * Repay VCOP debt for a position
   * @param positionId The ID of the position to repay debt for
   * @param amount The amount of VCOP to repay (in base units)
   */
  static async repayDebt(positionId: number, amount: bigint) {
    // First we need to approve VCOP transfer
    const approveCall = {
      address: VCOP_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'approve',
      args: [COLLATERAL_MANAGER_ADDRESS, amount],
      chainId: 84532,
    };

    // Then we can repay the debt
    const repayCall = {
      address: COLLATERAL_MANAGER_ADDRESS,
      abi: MINIMAL_ABI,
      functionName: 'repayDebt',
      args: [BigInt(positionId), amount],
      chainId: 84532,
    };

    return [approveCall, repayCall];
  }
} 