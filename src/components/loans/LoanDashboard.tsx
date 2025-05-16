import { useState } from 'react';
import CollateralPositions from './CollateralPositions';
import ManagePosition from './ManagePosition';
import CreateLoanForm from './CreateLoanForm';

export default function LoanDashboard() {
  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>(undefined);
  
  const handleSelectPosition = (id: number) => {
    setSelectedPositionId(id);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">VCOP Lending Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side - Loan creation */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <h2 className="text-xl font-bold mb-4">Create Loan Position</h2>
            <CreateLoanForm />
          </div>
        </div>
        
        {/* Right side - Position management */}
        <div className="lg:col-span-7">
          {selectedPositionId ? (
            <div className="bg-white rounded-xl shadow-md mb-6">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Position #{selectedPositionId}</h2>
                <button 
                  onClick={() => setSelectedPositionId(undefined)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Back to all positions
                </button>
              </div>
              <ManagePosition positionId={selectedPositionId} />
            </div>
          ) : (
            <CollateralPositions onSelectPosition={handleSelectPosition} />
          )}
        </div>
      </div>
    </div>
  );
} 