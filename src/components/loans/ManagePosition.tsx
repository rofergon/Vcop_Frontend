import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';

// Mock position for demonstration
const MOCK_POSITION = {
  id: '1',
  collateralType: 'USDC',
  collateralAmount: 1000,
  mintedVcop: 2800000,
  healthRatio: 1.5,
  liquidationRatio: 1.1,
  creationDate: new Date(2023, 6, 15)
};

// Mock exchange rates
const EXCHANGE_RATE = 4000; // 1 USDC = 4000 COP

type ActionType = 'add-collateral' | 'withdraw-collateral' | 'repay-vcop' | 'mint-more' | null;

const ManagePosition: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState<string>('');
  const [simulatedHealthRatio, setSimulatedHealthRatio] = useState<number | null>(null);
  const [isSimulationSafe, setIsSimulationSafe] = useState<boolean>(true);
  
  // Reset form when action changes
  const handleActionChange = (action: ActionType) => {
    setSelectedAction(action);
    setAmount('');
    setSimulatedHealthRatio(null);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      // Simulate health ratio based on action
      if (value && parseFloat(value) > 0) {
        simulateAction(selectedAction, parseFloat(value));
      } else {
        setSimulatedHealthRatio(null);
      }
    }
  };
  
  const simulateAction = (action: ActionType, inputAmount: number) => {
    if (!action) return;
    
    let newCollateralAmount = MOCK_POSITION.collateralAmount;
    let newMintedVcop = MOCK_POSITION.mintedVcop;
    
    switch(action) {
      case 'add-collateral':
        newCollateralAmount += inputAmount;
        break;
      case 'withdraw-collateral':
        newCollateralAmount = Math.max(0, newCollateralAmount - inputAmount);
        break;
      case 'repay-vcop':
        newMintedVcop = Math.max(0, newMintedVcop - inputAmount);
        break;
      case 'mint-more':
        newMintedVcop += inputAmount;
        break;
    }
    
    // Calculate new health ratio
    const collateralValue = newCollateralAmount * EXCHANGE_RATE;
    const newRatio = newMintedVcop > 0 ? collateralValue / newMintedVcop : Infinity;
    
    setSimulatedHealthRatio(newRatio);
    setIsSimulationSafe(newRatio >= MOCK_POSITION.liquidationRatio);
  };
  
  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Acción: ${selectedAction}, Cantidad: ${amount}`);
    // Here would go the interaction with the blockchain
  };

  const actionIcons = {
    'add-collateral': <ArrowUpCircle size={18} className="mr-2 text-green-500" />,
    'withdraw-collateral': <ArrowDownCircle size={18} className="mr-2 text-red-500" />,
    'repay-vcop': <ArrowUpCircle size={18} className="mr-2 text-blue-500" />,
    'mint-more': <ArrowDownCircle size={18} className="mr-2 text-purple-500" />
  };
  
  const getActionTitle = (action: ActionType): string => {
    switch(action) {
      case 'add-collateral': return 'Añadir Colateral';
      case 'withdraw-collateral': return 'Retirar Colateral';
      case 'repay-vcop': return 'Devolver VCOP';
      case 'mint-more': return 'Acuñar Más VCOP';
      default: return '';
    }
  };

  const getMaxAmount = (): number => {
    if (!selectedAction) return 0;
    
    switch(selectedAction) {
      case 'add-collateral': 
        return 10000; // Mock wallet balance
      case 'withdraw-collateral': {
        // Max withdraw while keeping minimum health ratio (safe buffer)
        const minRequiredCollateral = MOCK_POSITION.mintedVcop * (MOCK_POSITION.liquidationRatio + 0.1) / EXCHANGE_RATE;
        return Math.max(0, MOCK_POSITION.collateralAmount - minRequiredCollateral);
      }
      case 'repay-vcop':
        return MOCK_POSITION.mintedVcop; // Can repay up to full debt
      case 'mint-more': {
        // Max additional VCOP while maintaining minimum health ratio (safe buffer)
        const collateralValue = MOCK_POSITION.collateralAmount * EXCHANGE_RATE;
        const maxTotalVcop = collateralValue / (MOCK_POSITION.liquidationRatio + 0.1);
        return Math.max(0, maxTotalVcop - MOCK_POSITION.mintedVcop);
      }
      default:
        return 0;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Gestionar Posición</h2>
      
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Detalles de la Posición #{MOCK_POSITION.id}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Colateral</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{MOCK_POSITION.collateralType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad de Colateral</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{MOCK_POSITION.collateralAmount.toLocaleString()} {MOCK_POSITION.collateralType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">VCOP Acuñado</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{MOCK_POSITION.mintedVcop.toLocaleString()} VCOP</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ratio de Salud</p>
            <p className="font-medium text-green-600 dark:text-green-400">{MOCK_POSITION.healthRatio.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ratio de Liquidación</p>
            <p className="font-medium text-red-600 dark:text-red-400">{MOCK_POSITION.liquidationRatio.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {MOCK_POSITION.creationDate.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">¿Qué deseas hacer?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => handleActionChange('add-collateral')}
            className={`flex items-center justify-center p-3 rounded-md transition ${
              selectedAction === 'add-collateral' 
                ? 'bg-green-100 dark:bg-green-900 border border-green-500'
                : 'bg-gray-50 hover:bg-green-50 dark:bg-gray-700 dark:hover:bg-green-900/30'
            }`}
          >
            {actionIcons['add-collateral']} Añadir Colateral
          </button>
          
          <button 
            onClick={() => handleActionChange('withdraw-collateral')}
            className={`flex items-center justify-center p-3 rounded-md transition ${
              selectedAction === 'withdraw-collateral' 
                ? 'bg-red-100 dark:bg-red-900 border border-red-500'
                : 'bg-gray-50 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-900/30'
            }`}
          >
            {actionIcons['withdraw-collateral']} Retirar Colateral
          </button>
          
          <button 
            onClick={() => handleActionChange('repay-vcop')}
            className={`flex items-center justify-center p-3 rounded-md transition ${
              selectedAction === 'repay-vcop' 
                ? 'bg-blue-100 dark:bg-blue-900 border border-blue-500'
                : 'bg-gray-50 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/30'
            }`}
          >
            {actionIcons['repay-vcop']} Devolver VCOP
          </button>
          
          <button 
            onClick={() => handleActionChange('mint-more')}
            className={`flex items-center justify-center p-3 rounded-md transition ${
              selectedAction === 'mint-more' 
                ? 'bg-purple-100 dark:bg-purple-900 border border-purple-500'
                : 'bg-gray-50 hover:bg-purple-50 dark:bg-gray-700 dark:hover:bg-purple-900/30'
            }`}
          >
            {actionIcons['mint-more']} Acuñar Más VCOP
          </button>
        </div>
      </div>
      
      {selectedAction && (
        <form onSubmit={handleExecuteAction} className="border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {getActionTitle(selectedAction)}
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedAction === 'add-collateral' || selectedAction === 'withdraw-collateral' 
                  ? `Cantidad (${MOCK_POSITION.collateralType})` 
                  : 'Cantidad (VCOP)'}
              </label>
              <button 
                type="button"
                onClick={() => setAmount(getMaxAmount().toFixed(selectedAction === 'add-collateral' || selectedAction === 'withdraw-collateral' ? 2 : 0))}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Máximo: {getMaxAmount().toLocaleString(undefined, {
                  maximumFractionDigits: selectedAction === 'add-collateral' || selectedAction === 'withdraw-collateral' ? 2 : 0
                })}
              </button>
            </div>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Ingresa cantidad"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {simulatedHealthRatio !== null && (
            <div className="mb-6 p-4 rounded-md bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nuevo ratio de salud (simulado)
                </span>
                <span className={`text-sm font-medium ${
                  isSimulationSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {simulatedHealthRatio === Infinity ? '∞' : simulatedHealthRatio.toFixed(2)}x
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    isSimulationSafe ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                  }`}
                  style={{ 
                    width: `${simulatedHealthRatio === Infinity ? 100 : Math.min(100, (simulatedHealthRatio / (MOCK_POSITION.liquidationRatio * 1.5)) * 100)}%` 
                  }}
                />
              </div>
              
              {!isSimulationSafe && (
                <div className="mt-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-700 dark:text-red-400">
                  Esta acción pondrá tu posición en riesgo de liquidación.
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || (simulatedHealthRatio !== null && !isSimulationSafe)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => handleActionChange(null)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-8 pt-4 border-t dark:border-gray-700">
        <button 
          className="flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
        >
          <Trash2 size={16} className="mr-2" /> Cerrar esta posición (devolver todo)
        </button>
      </div>
    </div>
  );
};

export default ManagePosition; 