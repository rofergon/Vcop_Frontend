import React from 'react';
import LiquidationMarketplace from '../components/loans/LiquidationMarketplace';

export default function LiquidationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Liquidation Marketplace
          </h1>
          <p className="text-blue-600/80 dark:text-blue-300/80 max-w-2xl">
            Earn profit by liquidating undercollateralized positions. Liquidate positions with collateral ratio below the threshold and receive the full collateral.
          </p>
        </div>
      </div>

      <div>
        <LiquidationMarketplace />
      </div>
    </div>
  );
} 