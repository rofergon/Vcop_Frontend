import React from 'react';
import Card from '../common/Card';
import { Transaction } from '../../types';
import { formatRelativeTime, formatAddress } from '../../utils/helpers';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  maxItems?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = 'Recent Transactions',
  maxItems
}) => {
  const displayedTransactions = maxItems 
    ? transactions.slice(0, maxItems) 
    : transactions;
  
  // Status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex px-2 text-xs font-semibold leading-5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Failed
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card title={title} className="h-full">
      {displayedTransactions.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 -mt-2">
          {displayedTransactions.map((tx) => (
            <div key={tx.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tx.type === 'swap' 
                        ? `Swap ${tx.fromToken} to ${tx.toToken}`
                        : `Approve ${tx.fromToken}`}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {tx.type === 'swap' && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatRelativeTime(tx.timestamp)}</span>
                    <span>•</span>
                    <a 
                      href={`https://explorer.example.com/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {formatAddress(tx.hash)}
                    </a>
                  </div>
                </div>
                <div>
                  {getStatusIndicator(tx.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TransactionList;