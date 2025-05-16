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
  // Initialize with default token info from constants
  const initialTokens = {
    USDC: { ...TOKENS.USDC, balance: 0 },
    VCOP: { ...TOKENS.VCOP, balance: 0 }
  };
  
  const [fromToken, setFromToken] = useState<TokenInfo>(initialTokens.USDC);
  const [toToken, setToToken] = useState<TokenInfo>(initialTokens.VCOP);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [needsApproval, setNeedsApproval] = useState<boolean>(true);
  const [, setAllowance] = useState<bigint>(BigInt(0));
  const [] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  // Environment variables
  const vcopCollateralHookAddress = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`;
  const usdcAddress = import.meta.env.VITE_USDC_ADDRESS as `0x${string}`;
  const vcopAddress = import.meta.env.VITE_VCOP_ADDRESS as `0x${string}`;
  
  // Get connected account and network
  const { address } = useAccount();
  const chainId = useChainId();
  
  // Read USDC balance from contract
  const { data: usdcBalanceData, refetch: refetchUsdcBalance } = useContractRead({
    address: usdcAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  // Read VCOP balance from contract
  const { data: vcopBalanceData, refetch: refetchVcopBalance } = useContractRead({
    address: vcopAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  // Update token balances when data changes
  useEffect(() => {
    if (usdcBalanceData) {
      const usdcBalance = Number(formatUnits(usdcBalanceData as bigint, 6));
      setFromToken(prev => 
        prev.symbol === 'USDC' 
          ? { ...prev, balance: usdcBalance } 
          : prev
      );
      setToToken(prev => 
        prev.symbol === 'USDC' 
          ? { ...prev, balance: usdcBalance } 
          : prev
      );
    }
    
    if (vcopBalanceData) {
      const vcopBalance = Number(formatUnits(vcopBalanceData as bigint, 6));
      setFromToken(prev => 
        prev.symbol === 'VCOP' 
          ? { ...prev, balance: vcopBalance } 
          : prev
      );
      setToToken(prev => 
        prev.symbol === 'VCOP' 
          ? { ...prev, balance: vcopBalance } 
          : prev
      );
    }
  }, [usdcBalanceData, vcopBalanceData]);
  
  // Refresh balances periodically and after transactions
  useEffect(() => {
    if (address) {
      // Initial fetch
      refetchUsdcBalance();
      refetchVcopBalance();
      
      // Set up refresh interval
      const intervalId = setInterval(() => {
        refetchUsdcBalance();
        refetchVcopBalance();
      }, 15000); // Refresh every 15 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [address, refetchUsdcBalance, refetchVcopBalance]);
  
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
  
  // Function to get maximum swappable amount based on token balances and PSM limits
  const getMaxSwapAmount = (): number => {
    if (fromToken.symbol === 'USDC') {
      // For USDC to VCOP, limited by user balance and PSM max swap amount
      return Math.min(fromToken.balance, psmMaxSwapAmount);
    } else {
      // For VCOP to USDC, limited by user balance and PSM reserves
      const psmUsdcReserves = psmStats ? Number(formatUnits(psmStats[1], 6)) : 0;
      return Math.min(fromToken.balance, psmUsdcReserves);
    }
  };
  
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
      
      // Refresh balances after transaction
      refetchUsdcBalance();
      refetchVcopBalance();
      
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
    <Card title="Swap" className="w-full h-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100/50 shadow-lg hover:shadow-xl transition-all dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30">
      <div className="space-y-6">
        {/* From Token Input */}
        <TokenInput
          token={fromToken}
          value={fromAmount}
          onChange={setFromAmount}
          label="From"
          maxValue={getMaxSwapAmount()}
        />
        
        {/* Swap Direction Button */}
        <div className="relative flex justify-center">
          <button
            onClick={handleSwitchTokens}
            className="absolute -mt-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-blue-50/80 border border-blue-100/50 shadow-md transition-all duration-200 transform hover:rotate-180 hover:scale-110"
          >
            <ArrowDownUp size={18} className="text-blue-600 dark:text-blue-400" />
          </button>
          <div className="border-t border-blue-100/50 dark:border-blue-800/30 w-full my-3"></div>
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
        <div className="space-y-3 pt-3 border-t border-blue-100/50 dark:border-blue-800/30 bg-blue-50/30 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-blue-700/80 dark:text-blue-300/80 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Exchange Rate
            </span>
            <span className="text-blue-900 dark:text-blue-100 font-medium">{getExchangeRateInfo()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-blue-700/80 dark:text-blue-300/80 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Fee ({(psmFee * 100).toFixed(2)}%)
            </span>
            <span className="text-blue-900 dark:text-blue-100 font-medium">{getFeeInfo() || '-'}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-blue-700/80 dark:text-blue-300/80 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Max Swap Amount
            </span>
            <span className="text-blue-900 dark:text-blue-100 font-medium">
              {formatCurrency(getMaxSwapAmount(), fromToken.symbol === 'USDC' ? 'USD' : 'COP', 2)}
            </span>
          </div>
          
          {psmStats && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-700/80 dark:text-blue-300/80 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                PSM Reserves
              </span>
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                {formatCurrency(Number(formatUnits(psmStats[1], 6)), 'USD', 2)} USDC / 
                {formatCurrency(Number(formatUnits(psmStats[0], 6)), 'COP', 0)} VCOP
              </span>
            </div>
          )}
          
          {isPsmPaused && (
            <div className="mt-2 text-center bg-red-50/30 backdrop-blur-sm rounded-lg p-2 border border-red-100/50 flex items-center justify-center text-red-600 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              PSM is currently paused
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
                className="w-full py-3 px-4 bg-blue-100/70 hover:bg-blue-200/70 text-blue-800 backdrop-blur-sm rounded-xl border border-blue-200/50 transition-all shadow-sm font-medium"
                disabled={
                  !fromAmount || 
                  parseFloat(fromAmount) <= 0 || 
                  parseFloat(fromAmount) > fromToken.balance
                }
                text={`Approve ${fromToken.symbol}`}
              />
              <TransactionSponsor />
              <TransactionStatus>
                <div className="flex items-center gap-2 text-sm bg-blue-50/30 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50 mt-3">
                  <TransactionStatusLabel />
                  <div className="ml-auto">
                    <TransactionStatusAction />
                  </div>
                </div>
              </TransactionStatus>
              <TransactionToast>
                <div className="flex items-center gap-3">
                  <TransactionToastIcon />
                  <TransactionToastLabel />
                  <div className="ml-auto">
                    <TransactionToastAction />
                  </div>
                </div>
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
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white rounded-xl transition-all shadow-md font-medium"
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
              <div className="flex items-center gap-2 text-sm bg-blue-50/30 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50 mt-3">
                <TransactionStatusLabel />
                <div className="ml-auto">
                  <TransactionStatusAction />
                </div>
              </div>
            </TransactionStatus>
            <TransactionToast>
              <div className="flex items-center gap-3">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <div className="ml-auto">
                  <TransactionToastAction />
                </div>
              </div>
            </TransactionToast>
          </Transaction>
        </div>
        
        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-100/50 dark:border-blue-800/30">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Transactions
            </h3>
            <div className="space-y-2 bg-blue-50/30 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="text-blue-800 dark:text-blue-200">
                      {tx.fromToken} to {tx.toToken}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'completed' 
                      ? 'bg-green-100/80 text-green-800 dark:bg-green-900/60 dark:text-green-200 border border-green-200/50' 
                      : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border border-yellow-200/50'
                  }`}>
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