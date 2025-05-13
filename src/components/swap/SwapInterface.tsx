import React, { useState, useEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import TokenInput from '../common/TokenInput';
import { TokenInfo } from '../../types';
import { TOKENS, MOCK_PSM_STATS, USDC_TO_VCOP_RATE } from '../../utils/constants';
import { calculateSwapOutput, formatCurrency, simulateTransaction } from '../../utils/helpers';

interface SwapInterfaceProps {
  onSwapComplete?: (txHash: string) => void;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ onSwapComplete }) => {
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS.USDC);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS.VCOP);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  
  // Effect to calculate the swap output
  useEffect(() => {
    if (fromAmount) {
      const parsedAmount = parseFloat(fromAmount);
      const isVcopToUsdc = fromToken.symbol === 'VCOP';
      
      const calculatedOutput = calculateSwapOutput(
        parsedAmount,
        USDC_TO_VCOP_RATE,
        MOCK_PSM_STATS.psmFee,
        isVcopToUsdc
      );
      
      setToAmount(calculatedOutput.toString());
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken]);
  
  // Handle token swap direction
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };
  
  // Handle approval
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await simulateTransaction();
      setNeedsApproval(false);
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };
  
  // Handle swap execution
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    
    setIsSwapping(true);
    try {
      const txHash = await simulateTransaction();
      if (onSwapComplete) {
        onSwapComplete(txHash);
      }
      
      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };
  
  // Calculate price info
  const getExchangeRateInfo = () => {
    const isVcopToUsdc = fromToken.symbol === 'VCOP';
    
    if (isVcopToUsdc) {
      return `1 VCOP ≈ ${formatCurrency(1 / USDC_TO_VCOP_RATE, 'USD', 6)}`;
    } else {
      return `1 USDC ≈ ${formatCurrency(USDC_TO_VCOP_RATE, 'COP', 2)}`;
    }
  };
  
  // Calculate fee amount
  const getFeeInfo = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return null;
    
    const parsedAmount = parseFloat(fromAmount);
    const feeAmount = parsedAmount * MOCK_PSM_STATS.psmFee;
    
    return fromToken.symbol === 'VCOP' 
      ? formatCurrency(feeAmount, 'COP', 0)
      : formatCurrency(feeAmount, 'USD', 2);
  };
  
  return (
    <Card title="Swap" className="max-w-md mx-auto w-full">
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
            <span className="text-gray-500 dark:text-gray-400">Fee ({MOCK_PSM_STATS.psmFee * 100}%)</span>
            <span className="text-gray-700 dark:text-gray-300">{getFeeInfo() || '-'}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Max Swap Amount</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(MOCK_PSM_STATS.psmMaxSwapAmount, 'USD', 0)}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {needsApproval && fromToken.symbol === 'USDC' && (
            <Button
              variant="outline"
              onClick={handleApprove}
              isLoading={isApproving}
              fullWidth
            >
              Approve {fromToken.symbol}
            </Button>
          )}
          
          <Button
            onClick={handleSwap}
            isLoading={isSwapping}
            disabled={
              !fromAmount || 
              parseFloat(fromAmount) <= 0 || 
              parseFloat(fromAmount) > fromToken.balance ||
              (needsApproval && fromToken.symbol === 'USDC')
            }
            fullWidth
          >
            {!fromAmount || parseFloat(fromAmount) <= 0
              ? 'Enter an amount'
              : parseFloat(fromAmount) > fromToken.balance
              ? 'Insufficient balance'
              : `Swap ${fromToken.symbol} to ${toToken.symbol}`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SwapInterface;