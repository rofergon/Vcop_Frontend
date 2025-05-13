import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// Mock collateral types for demonstration
const COLLATERAL_TYPES = [
  { id: 'usdc', name: 'USDC', minRatio: 1.05, fee: 0.001 },
  { id: 'eth', name: 'ETH', minRatio: 1.20, fee: 0.002 },
  { id: 'wbtc', name: 'WBTC', minRatio: 1.15, fee: 0.0015 }
];

// Mock exchange rates
const EXCHANGE_RATES = {
  usdc: 4000, // 1 USDC = 4000 COP
  eth: 8000000, // 1 ETH = 8,000,000 COP
  wbtc: 120000000 // 1 WBTC = 120,000,000 COP
};

const CreatePosition: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState(COLLATERAL_TYPES[0]);
  const [collateralAmount, setCollateralAmount] = useState<string>('');
  const [vcopAmount, setVcopAmount] = useState<string>('');
  const [collateralRatio, setCollateralRatio] = useState<number>(0);
  const [maxVcopPossible, setMaxVcopPossible] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [isRatioSafe, setIsRatioSafe] = useState<boolean>(true);

  // Calculate max VCOP and collateral ratio when inputs change
  useEffect(() => {
    if (collateralAmount && parseFloat(collateralAmount) > 0) {
      const collateralValue = parseFloat(collateralAmount) * EXCHANGE_RATES[selectedCollateral.id as keyof typeof EXCHANGE_RATES];
      const safeMaxVcop = collateralValue / (selectedCollateral.minRatio + 0.05);
      setMaxVcopPossible(safeMaxVcop);
      
      if (vcopAmount && parseFloat(vcopAmount) > 0) {
        const currentRatio = collateralValue / parseFloat(vcopAmount);
        setCollateralRatio(currentRatio);
        setIsRatioSafe(currentRatio >= selectedCollateral.minRatio);
        
        // Calculate fee
        const mintFee = parseFloat(vcopAmount) * selectedCollateral.fee;
        setFees(mintFee);
      } else {
        setCollateralRatio(0);
        setFees(0);
      }
    } else {
      setMaxVcopPossible(0);
      setCollateralRatio(0);
      setFees(0);
    }
  }, [collateralAmount, vcopAmount, selectedCollateral]);

  const handleCollateralTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COLLATERAL_TYPES.find(type => type.id === e.target.value);
    if (selected) {
      setSelectedCollateral(selected);
    }
  };

  const handleCollateralAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCollateralAmount(value);
    }
  };

  const handleVcopAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setVcopAmount(value);
    }
  };

  const handleMaxVcop = () => {
    setVcopAmount(maxVcopPossible.toFixed(0));
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Esta funcionalidad estaría conectada al smart contract');
    // Here would go the interaction with the blockchain
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Crear Nueva Posición</h2>
      
      <form onSubmit={handleCreatePosition}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            Tipo de Colateral
          </label>
          <select
            value={selectedCollateral.id}
            onChange={handleCollateralTypeChange}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COLLATERAL_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} (Ratio min: {type.minRatio.toFixed(2)}x)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
            Cantidad de Colateral ({selectedCollateral.name})
          </label>
          <input
            type="text"
            value={collateralAmount}
            onChange={handleCollateralAmountChange}
            placeholder={`Cantidad en ${selectedCollateral.name}`}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
              Cantidad de VCOP a acuñar
            </label>
            {maxVcopPossible > 0 && (
              <button 
                type="button"
                onClick={handleMaxVcop}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Max seguro: {maxVcopPossible.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </button>
            )}
          </div>
          <input
            type="text"
            value={vcopAmount}
            onChange={handleVcopAmountChange}
            placeholder="Cantidad en VCOP"
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Collateral Ratio Indicator */}
        {collateralRatio > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ratio de Colateralización</span>
              <span className={`text-sm font-medium ${isRatioSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {collateralRatio.toFixed(2)}x
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div 
                className={`h-full rounded-full ${isRatioSafe ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(100, (collateralRatio / (selectedCollateral.minRatio * 1.5)) * 100)}%` 
                }}
              />
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Mínimo: {selectedCollateral.minRatio.toFixed(2)}x</span>
                <span>Recomendado: {(selectedCollateral.minRatio * 1.2).toFixed(2)}x</span>
              </div>
            </div>
            
            {!isRatioSafe && (
              <div className="mt-2 flex items-start text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                <span>La ratio está por debajo del mínimo requerido y podría ser liquidada.</span>
              </div>
            )}
          </div>
        )}
        
        {/* Fee Information */}
        {fees > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between mb-1">
                <span>Comisión de acuñado ({(selectedCollateral.fee * 100).toFixed(2)}%)</span>
                <span>{fees.toLocaleString(undefined, {maximumFractionDigits: 2})} VCOP</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>VCOP total a recibir</span>
                <span>{(parseFloat(vcopAmount) - fees).toLocaleString(undefined, {maximumFractionDigits: 2})} VCOP</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isRatioSafe || !collateralAmount || !vcopAmount || parseFloat(collateralAmount) <= 0 || parseFloat(vcopAmount) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Crear Posición
        </button>
      </form>
    </div>
  );
};

export default CreatePosition; 