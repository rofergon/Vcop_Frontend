import React from 'react';
import CollateralPositions from '../components/loans/CollateralPositions';
import CreatePosition from '../components/loans/CreatePosition';
import ManagePosition from '../components/loans/ManagePosition';
import MarketInfo from '../components/loans/MarketInfo';
import AnalyticsPanel from '../components/loans/AnalyticsPanel';

const Loans: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
          Préstamos Colateralizados VCOP
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Deposita colateral, acuña VCOP, y gestiona tus posiciones de forma segura con nuestro sistema de préstamos colateralizados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Market Information */}
        <div className="lg:col-span-5">
          <MarketInfo />
        </div>
        
        {/* Collateral Positions Overview */}
        <div className="lg:col-span-7">
          <CollateralPositions />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Create Position Interface */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md">
            <CreatePosition />
          </div>
        </div>
        
        {/* Manage Position */}
        <div className="lg:col-span-7">
          <ManagePosition />
        </div>
      </div>
      
      {/* Analytics Panel - Full width */}
      <div className="mt-16">
        <AnalyticsPanel />
      </div>
    </div>
  );
};

export default Loans; 