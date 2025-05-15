import React, { useState, useEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import Card from '../common/Card';
import TokenInput from '../common/TokenInput';
import { TokenInfo } from '../../types';
import { TOKENS, MOCK_PSM_STATS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useContractRead } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionSponsor,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction
} from '@coinbase/onchainkit/transaction';

// Import ABIs
import VCOPCollateralHookABI from '../../Abis/VCOPCollateralHook.json';
import ERC20ABI from '../../Abis/ERC20.json';

interface SwapInterfaceProps {
  onSwapComplete?: (txHash: string) => void;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ onSwapComplete }) => {
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS.USDC);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS.VCOP);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [needsApproval, setNeedsApproval] = useState<boolean>(true);
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [showSwapDetails, setShowSwapDetails] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  // Environment variables
  const vcopCollateralHookAddress = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
  const vcopAddress = import.meta.env.VITE_VCOP_ADDRESS as `0x${string}`;
  
  // Get connected account and network
  const { address } = useAccount();
  const chainId = useChainId();
  
  // Read PSM stats from contract
  const { data: psmStatsResult } = useContractRead({
    address: vcopCollateralHookAddress,
    abi: VCOPCollateralHookABI,
    functionName: 'getPSMStats',
  });
  
  // Read PSM fee from contract
  const { data: psmFeeData } = useContractRead({
    address: vcopCollateralHookAddress,
    abi: VCOPCollateralHookABI,
    functionName: 'psmFee',
  });
  
  // Read PSM max swap amount from contract
  const { data: psmMaxSwapAmountData } = useContractRead({
    address: vcopCollateralHookAddress,
    abi: VCOPCollateralHookABI,
    functionName: 'psmMaxSwapAmount',
  });
  
  // Read PSM paused status from contract
  const { data: psmPausedData } = useContractRead({
    address: vcopCollateralHookAddress,
    abi: VCOPCollateralHookABI,
    functionName: 'psmPaused',
  });
  
  // Contract data calculated values
  const psmFee = psmFeeData ? Number(psmFeeData as bigint) / 1000000 : MOCK_PSM_STATS.psmFee;
  const psmMaxSwapAmount = psmMaxSwapAmountData ? Number(formatUnits(psmMaxSwapAmountData as bigint, 6)) : MOCK_PSM_STATS.psmMaxSwapAmount;
  const isPsmPaused = psmPausedData as boolean ?? false;
  
  // Type-safe PSM stats
  const psmStats = psmStatsResult as unknown as [bigint, bigint, bigint, bigint] | undefined;
  
  // Read token allowance when the account or fromToken changes
  const { data: allowanceData } = useContractRead({
    address: fromToken.symbol === 'VCOP' ? vcopAddress : usdcAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address as `0x${string}`, vcopCollateralHookAddress] : undefined,
  });
  
  // Update allowance when data changes
  useEffect(() => {
    if (allowanceData) {
      setAllowance(allowanceData as bigint);
      setNeedsApproval((allowanceData as bigint) < (fromAmount ? parseUnits(fromAmount, 6) : BigInt(0)));
    }
  }, [allowanceData, fromAmount]);
  
  // Dynamic conversion calculation using contract
  const { data: conversionResult } = useContractRead({
    address: vcopCollateralHookAddress,
    abi: VCOPCollateralHookABI,
    functionName: fromToken.symbol === 'VCOP' ? 'calculateCollateralForVCOPView' : 'calculateVCOPForCollateralView',
    args: fromAmount ? [parseUnits(fromAmount, 6)] : undefined,
  });
  
  // Update toAmount when conversion result changes
  useEffect(() => {
    if (conversionResult && fromAmount) {
      setToAmount(formatUnits(conversionResult as bigint, 6));
    } else {
      setToAmount('');
    }
  }, [conversionResult, fromAmount]);
  
  // Handle token swap direction
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };
  
  // Generate transaction calls for swap
  const generateSwapCalls = () => {
    if (!fromAmount || !address) return [];
    
    const amountInWei = parseUnits(fromAmount, 6);
    
    if (fromToken.symbol === 'VCOP') {
      // VCOP to USDC swap
      const data = encodeFunctionData({
        abi: VCOPCollateralHookABI,
        functionName: 'psmSwapVCOPForCollateral',
        args: [amountInWei]
      });
      
      return [{
        to: vcopCollateralHookAddress,
        data
      }];
    } else {
      // USDC to VCOP swap
      const data = encodeFunctionData({
        abi: VCOPCollateralHookABI,
        functionName: 'psmSwapCollateralForVCOP',
        args: [amountInWei]
      });
      
      return [{
        to: vcopCollateralHookAddress,
        data
      }];
    }
  };
  
  // Generate approval calls
  const generateApprovalCalls = () => {
    if (!fromAmount || !address) return [];
    
    const amountInWei = parseUnits(fromAmount, 6);
    const tokenAddress = fromToken.symbol === 'VCOP' ? vcopAddress : usdcAddress;
    
    const data = encodeFunctionData({
      abi: ERC20ABI,
      functionName: 'approve',
      args: [vcopCollateralHookAddress, amountInWei]
    });
    
    return [{
      to: tokenAddress,
      data
    }];
  };
  
  // Calculate exchange rate info
  const getExchangeRateInfo = () => {
    // Use real data from contract if available
    if (conversionResult && fromAmount) {
      const rate = Number(formatUnits(conversionResult as bigint, 6)) / Number(fromAmount);
      
      if (fromToken.symbol === 'VCOP') {
        return `1 VCOP ≈ ${formatCurrency(rate, 'USD', 6)}`;
      } else {
        return `1 USDC ≈ ${formatCurrency(rate, 'COP', 2)}`;
      }
    }
    
    return fromToken.symbol === 'VCOP' 
      ? `1 VCOP ≈ ${formatCurrency(0, 'USD', 6)}`
      : `1 USDC ≈ ${formatCurrency(0, 'COP', 2)}`;
  };
  
  // Calculate fee amount
  const getFeeInfo = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return null;
    
    const parsedAmount = parseFloat(fromAmount);
    const feeAmount = parsedAmount * psmFee;
    
    return fromToken.symbol === 'VCOP' 
      ? formatCurrency(feeAmount, 'COP', 0)
      : formatCurrency(feeAmount, 'USD', 2);
  };
  
  // Update transaction status handler
  const handleTransactionStatus = (status: any) => {
    console.log('Transaction status:', status);
    
    if (status.statusName === 'confirmed') {
      // Reset form
      setFromAmount('');
      setToAmount('');
      
      // Add to recent transactions
      if (status.statusData?.hash) {
        const newTx = {
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount: fromAmount,
          toAmount: toAmount,
          hash: status.statusData.hash,
          timestamp: Date.now(),
          status: 'completed'
        };
        
        setRecentTransactions(prev => [newTx, ...prev].slice(0, 5));
        
        if (onSwapComplete) {
          onSwapComplete(status.statusData.hash);
        }
      }
    }
  };
  
  return (
    <Card title="Swap" className="w-full h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-6">
        {/* From Token Input */}
        <TokenInput
          token={fromToken}
          value={fromAmount}
          onChange={setFromAmount}
          label="From"
          maxValue={fromToken.balance}
        />
        
        {/* Swap Direction Button */}
        <div className="relative flex justify-center">
          <button
            onClick={handleSwitchTokens}
            className="absolute -mt-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 transform hover:rotate-180"
          >
            <ArrowDownUp size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 w-full my-3"></div>
        </div>
        
        {/* To Token Input */}
        <TokenInput
          token={toToken}
          value={toAmount}
          onChange={setToAmount}
          label="To"
          disabled={true}
        />
        
        {/* Rate and Fee Information */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
            <span className="text-gray-700 dark:text-gray-300">{getExchangeRateInfo()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Fee ({(psmFee * 100).toFixed(2)}%)</span>
            <span className="text-gray-700 dark:text-gray-300">{getFeeInfo() || '-'}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Max Swap Amount</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(psmMaxSwapAmount, 'USD', 0)}
            </span>
          </div>
          
          {psmStats && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">PSM Reserves</span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatCurrency(Number(formatUnits(psmStats[1], 6)), 'USD', 2)} USDC / 
                {formatCurrency(Number(formatUnits(psmStats[0], 6)), 'COP', 0)} VCOP
              </span>
            </div>
          )}
          
          {isPsmPaused && (
            <div className="mt-2 text-center text-red-500 font-medium">
              ⚠️ PSM is currently paused
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {needsApproval && (
            <Transaction
              chainId={chainId}
              calls={generateApprovalCalls()}
              onStatus={handleTransactionStatus}
              isSponsored={true}
            >
              <TransactionButton
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                disabled={
                  !fromAmount || 
                  parseFloat(fromAmount) <= 0 || 
                  parseFloat(fromAmount) > fromToken.balance
                }
                text={`Approve ${fromToken.symbol}`}
              />
              <TransactionSponsor />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
              <TransactionToast>
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          )}
          
          <Transaction
            chainId={chainId}
            calls={generateSwapCalls()}
            onStatus={handleTransactionStatus}
            isSponsored={true}
          >
            <TransactionButton
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              disabled={
                !fromAmount || 
                parseFloat(fromAmount) <= 0 || 
                parseFloat(fromAmount) > fromToken.balance ||
                needsApproval ||
                isPsmPaused
              }
              text={
                !fromAmount || parseFloat(fromAmount) <= 0
                  ? 'Enter an amount'
                  : parseFloat(fromAmount) > fromToken.balance
                  ? 'Insufficient balance'
                  : isPsmPaused
                  ? 'PSM is paused'
                  : `Swap ${fromToken.symbol} to ${toToken.symbol}`
              }
            />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
            <TransactionToast>
              <TransactionToastIcon />
              <TransactionToastLabel />
              <TransactionToastAction />
            </TransactionToast>
          </Transaction>
        </div>
        
        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Transactions</h3>
            <div className="space-y-2">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {tx.fromToken} to {tx.toToken}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SwapInterface;