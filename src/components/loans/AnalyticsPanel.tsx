import React, { useState } from 'react';
import { LineChart, PieChart, BarChart, Sliders, AlertCircle } from 'lucide-react';

// Mock data for charts
const MOCK_CHART_DATA = {
  tvlHistory: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    value: 2000000 + Math.random() * 1000000 + i * 50000
  })),
  collateralDistribution: [
    { name: 'USDC', value: 70, color: '#2775CA' },
    { name: 'ETH', value: 25, color: '#627EEA' },
    { name: 'WBTC', value: 5, color: '#F7931A' }
  ],
  liquidationEvents: Array.from({ length: 5 }, (_, i) => ({
    id: `liq-${i + 1}`,
    date: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000),
    collateralType: i % 3 === 0 ? 'ETH' : i % 2 === 0 ? 'WBTC' : 'USDC',
    collateralAmount: i % 3 === 0 ? 1.5 : i % 2 === 0 ? 0.1 : 2000,
    vcopAmount: (i + 1) * 1000000 + Math.random() * 500000,
    liquidator: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
  }))
};

type Tab = 'overview' | 'risk' | 'liquidations';

const AnalyticsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Panel Analítico</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <LineChart size={16} className="inline mr-2" />
          Visión General
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'risk'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Sliders size={16} className="inline mr-2" />
          Simulador de Riesgo
        </button>
        <button
          onClick={() => setActiveTab('liquidations')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'liquidations'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <AlertCircle size={16} className="inline mr-2" />
          Liquidaciones
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* TVL Chart */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Valor Total Bloqueado (TVL)
              </h3>
              <div className="h-64 flex items-center justify-center">
                {/* Placeholder for actual chart */}
                <div className="relative w-full h-48">
                  <div className="absolute inset-0 flex items-end">
                    {MOCK_CHART_DATA.tvlHistory.map((point, index) => (
                      <div 
                        key={index}
                        className="flex-1 mx-0.5 bg-blue-500 dark:bg-blue-600 rounded-t"
                        style={{ 
                          height: `${(point.value / 3500000) * 100}%`,
                          opacity: 0.5 + (index / MOCK_CHART_DATA.tvlHistory.length) * 0.5
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Últimos 30 días
              </div>
            </div>
            
            {/* Collateral Distribution */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Distribución del Colateral
              </h3>
              <div className="flex items-center justify-center h-64">
                {/* Placeholder for actual chart */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden">
                  {MOCK_CHART_DATA.collateralDistribution.map((segment, index, arr) => {
                    // Calculate rotation for pie segments
                    const previousSegments = arr.slice(0, index);
                    const previousTotal = previousSegments.reduce((acc, curr) => acc + curr.value, 0);
                    const rotation = (previousTotal / 100) * 360;
                    const degrees = (segment.value / 100) * 360;
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-full h-full origin-center"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          clip: `rect(0, 24rem, 24rem, 12rem)`
                        }}
                      >
                        <div 
                          className="absolute w-full h-full"
                          style={{
                            background: segment.color,
                            transform: `rotate(${degrees}deg)`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                {MOCK_CHART_DATA.collateralDistribution.map((item, index) => (
                  <div key={index} className="flex items-center mx-2">
                    <div 
                      className="w-3 h-3 rounded-sm mr-1" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Posiciones Activas</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">234</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Ratio Medio</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">1.47x</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Comisiones Generadas</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">23,450 VCOP</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Liquidaciones (7d)</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">3</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Risk Simulator Tab */}
      {activeTab === 'risk' && (
        <div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Simulador de Escenarios
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cambio en el precio del colateral
              </label>
              <div className="flex items-center">
                <span className="text-red-500 font-medium mr-2">-50%</span>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  defaultValue="0"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-green-500 font-medium ml-2">+50%</span>
              </div>
              <div className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">0%</div>
            </div>
            
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Impacto en tus posiciones</h4>
              
              <div className="space-y-4">
                <div className="border-b dark:border-gray-700 pb-2">
                  <div className="flex justify-between text-sm">
                    <span>Posición #1</span>
                    <span className="font-medium text-green-500">Segura</span>
                  </div>
                  <div className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full rounded-full bg-green-500 dark:bg-green-400" style={{ width: '75%' }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Ratio actual: 1.50x</span>
                    <span>Liquidación a: 1.05x</span>
                  </div>
                </div>
                
                <div className="border-b dark:border-gray-700 pb-2">
                  <div className="flex justify-between text-sm">
                    <span>Posición #2</span>
                    <span className="font-medium text-yellow-500">Precaución</span>
                  </div>
                  <div className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full rounded-full bg-yellow-500 dark:bg-yellow-400" style={{ width: '35%' }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Ratio actual: 1.25x</span>
                    <span>Liquidación a: 1.15x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex">
                <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 mr-2" />
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Este simulador te ayuda a anticipar riesgos, pero los valores reales pueden diferir. 
                  Siempre mantén un margen de seguridad en tus posiciones.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Recomendaciones
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 border-l-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 rounded-r-md">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <span className="font-medium">Posición #1:</span> Esta posición está bien colateralizada.
                  Podrías acuñar hasta 500,000 VCOP adicionales de forma segura.
                </p>
              </div>
              
              <div className="p-3 border-l-4 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <span className="font-medium">Posición #2:</span> Considera añadir más colateral. 
                  Una caída del 8% en el precio pondría esta posición en riesgo de liquidación.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Liquidations Tab */}
      {activeTab === 'liquidations' && (
        <div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Posiciones en Riesgo
            </h3>
            
            <div className="rounded-md border dark:border-gray-600 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Colateral
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ratio
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="bg-red-50 dark:bg-red-900/20">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      #42
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      0.75 ETH
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-red-600 dark:text-red-400 font-medium mr-2">1.06x</span>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full rounded-full bg-red-500" style={{ width: '10%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      #86
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      5000 USDC
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium mr-2">1.12x</span>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full rounded-full bg-yellow-500" style={{ width: '30%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Historial de Liquidaciones
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Colateral</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">VCOP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Liquidador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {MOCK_CHART_DATA.liquidationEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {event.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {event.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {event.collateralAmount} {event.collateralType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {event.vcopAmount.toLocaleString()} VCOP
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {event.liquidator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel; 