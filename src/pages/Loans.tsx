import React, { useState } from 'react';
import CollateralPositions from '../components/loans/CollateralPositions';
import CreatePosition from '../components/loans/CreatePosition';
import ManagePosition from '../components/loans/ManagePosition';
import MarketInfo from '../components/loans/MarketInfo';
import AnalyticsPanel from '../components/loans/AnalyticsPanel';
import PSMSwap from '../components/loans/PSMSwap';

const Loans: React.FC = () => {
  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'swap'>('create');

  // Handle position selection
  const handleSelectPosition = (id: number) => {
    setSelectedPositionId(id);
    setActiveTab('manage');
  };

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
          <CollateralPositions onSelectPosition={handleSelectPosition} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Tab navigation */}
        <div className="lg:col-span-12 flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Position
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Position
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'swap' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('swap')}
          >
            PSM Swap
          </button>
        </div>
        
        {/* Tab content */}
        <div className="lg:col-span-12">
          {activeTab === 'create' && (
            <div className="max-w-md mx-auto">
              <CreatePosition />
            </div>
          )}
          
          {activeTab === 'manage' && (
            <div className="max-w-md mx-auto">
              <ManagePosition positionId={selectedPositionId} />
            </div>
          )}
          
          {activeTab === 'swap' && (
            <div className="max-w-md mx-auto">
              <PSMSwap />
            </div>
          )}
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