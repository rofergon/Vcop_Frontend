import React, { useState, useCallback } from 'react';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { 
  Transaction, 
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';

// Contract addresses from environment variables
const VCOP_ADDRESS = import.meta.env.VITE_VCOP_ADDRESS;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const VCOP_COLLATERAL_MANAGER_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_MANAGER_ADDRESS;
const VCOP_COLLATERAL_HOOK_ADDRESS = import.meta.env.VITE_VCOP_COLLATERAL_HOOK_ADDRESS;

// Import ABIs
import collateralManagerABI from '../../Abis /simplified_abi_VCOPCollateralManager.json';
import collateralHookABI from '../../Abis /simplified_abi_VCOPCollateralHook.json';
import vcopABI from '../../Abis /simplified_abi_VCOPCollateralized.json';
import mockERC20ABI from '../../Abis /simplified_abi_MockERC20.json';

// Main component
const CollateralLoan: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [loanAction, setLoanAction] = useState<'create' | 'addCollateral' | 'withdraw' | 'repay' | 'psm'>('create');
  const [collateralAmount, setCollateralAmount] = useState<string>('0');
  const [mintAmount, setMintAmount] = useState<string>('0');
  const [positionId, setPositionId] = useState<string>('0');
  const [activeTab, setActiveTab] = useState<'loan' | 'psm'>('loan');
  const [psmAction, setPsmAction] = useState<'buyVCOP' | 'sellVCOP'>('buyVCOP');
  const [psmAmount, setPsmAmount] = useState<string>('0');

  // Handle transaction status changes
  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction Status:', status);
  }, []);

  // Create transaction calls based on selected action
  const generateTransactionCalls = useCallback(async () => {
    if (!address) return [];
    
    switch (loanAction) {
      case 'create': {
        // Create a new collateralized position
        const collateralAmountValue = parseUnits(collateralAmount, 6); // USDC has 6 decimals
        const mintAmountValue = parseUnits(mintAmount, 6); // VCOP has 6 decimals
        
        // First approve USDC spending
        const approveCall = {
          to: USDC_ADDRESS as `0x${string}`,
          data: createApproveCalldata(
            mockERC20ABI,
            VCOP_COLLATERAL_MANAGER_ADDRESS,
            collateralAmountValue
          ) as `0x${string}`
        };
        
        // Then create position
        const createPositionCall = {
          to: VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
          data: createPositionCalldata(
            collateralManagerABI,
            USDC_ADDRESS,
            collateralAmountValue,
            mintAmountValue
          ) as `0x${string}`
        };
        
        return [approveCall, createPositionCall];
      }
      
      case 'addCollateral': {
        // Add collateral to an existing position
        const collateralAmountValue = parseUnits(collateralAmount, 6);
        const positionIdValue = parseInt(positionId);
        
        // First approve USDC spending
        const approveCall = {
          to: USDC_ADDRESS as `0x${string}`,
          data: createApproveCalldata(
            mockERC20ABI,
            VCOP_COLLATERAL_MANAGER_ADDRESS,
            collateralAmountValue
          ) as `0x${string}`
        };
        
        // Then add collateral
        const addCollateralCall = {
          to: VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
          data: createAddCollateralCalldata(
            collateralManagerABI,
            positionIdValue,
            collateralAmountValue
          ) as `0x${string}`
        };
        
        return [approveCall, addCollateralCall];
      }
      
      case 'withdraw': {
        // Withdraw collateral from an existing position
        const collateralAmountValue = parseUnits(collateralAmount, 6);
        const positionIdValue = parseInt(positionId);
        
        const withdrawCall = {
          to: VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
          data: createWithdrawCollateralCalldata(
            collateralManagerABI,
            positionIdValue,
            collateralAmountValue
          ) as `0x${string}`
        };
        
        return [withdrawCall];
      }
      
      case 'repay': {
        // Repay debt and retrieve collateral
        const repayAmountValue = parseUnits(mintAmount, 6); // Using mintAmount field for repay amount
        const positionIdValue = parseInt(positionId);
        
        // First approve VCOP spending
        const approveCall = {
          to: VCOP_ADDRESS as `0x${string}`,
          data: createApproveCalldata(
            vcopABI,
            VCOP_COLLATERAL_MANAGER_ADDRESS,
            repayAmountValue
          ) as `0x${string}`
        };
        
        // Then repay debt
        const repayCall = {
          to: VCOP_COLLATERAL_MANAGER_ADDRESS as `0x${string}`,
          data: createRepayDebtCalldata(
            collateralManagerABI,
            positionIdValue,
            repayAmountValue
          ) as `0x${string}`
        };
        
        return [approveCall, repayCall];
      }
      
      case 'psm': {
        if (psmAction === 'buyVCOP') {
          // Buy VCOP with collateral (USDC)
          const collateralAmountValue = parseUnits(psmAmount, 6);
          
          // First approve USDC spending
          const approveCall = {
            to: USDC_ADDRESS as `0x${string}`,
            data: createApproveCalldata(
              mockERC20ABI,
              VCOP_COLLATERAL_HOOK_ADDRESS,
              collateralAmountValue
            ) as `0x${string}`
          };
          
          // Then swap collateral for VCOP
          const swapCall = {
            to: VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`,
            data: createPSMSwapCollateralForVCOPCalldata(
              collateralHookABI,
              collateralAmountValue
            ) as `0x${string}`
          };
          
          return [approveCall, swapCall];
        } else {
          // Sell VCOP for collateral (USDC)
          const vcopAmountValue = parseUnits(psmAmount, 6);
          
          // First approve VCOP spending
          const approveCall = {
            to: VCOP_ADDRESS as `0x${string}`,
            data: createApproveCalldata(
              vcopABI,
              VCOP_COLLATERAL_HOOK_ADDRESS,
              vcopAmountValue
            ) as `0x${string}`
          };
          
          // Then swap VCOP for collateral
          const swapCall = {
            to: VCOP_COLLATERAL_HOOK_ADDRESS as `0x${string}`,
            data: createPSMSwapVCOPForCollateralCalldata(
              collateralHookABI,
              vcopAmountValue
            ) as `0x${string}`
          };
          
          return [approveCall, swapCall];
        }
      }
      
      default:
        return [];
    }
  }, [address, loanAction, psmAction, collateralAmount, mintAmount, positionId, psmAmount]);

  // Helper functions to create contract call data
  function createApproveCalldata(abi: any, spender: string, amount: bigint) {
    const approveFunction = abi.find((item: any) => item.name === 'approve');
    if (!approveFunction) return '0x';
    
    const functionSelector = `0x${approveFunction.name}(${approveFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      approveFunction.inputs.map((i: any) => i.type),
      [spender, amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`; // Remove '0x' from encodedParams
  }
  
  function createPositionCalldata(abi: any, collateralToken: string, collateralAmount: bigint, vcopToMint: bigint) {
    const createPositionFunction = abi.find((item: any) => item.name === 'createPosition');
    if (!createPositionFunction) return '0x';
    
    const functionSelector = `0x${createPositionFunction.name}(${createPositionFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      createPositionFunction.inputs.map((i: any) => i.type),
      [collateralToken, collateralAmount.toString(), vcopToMint.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  function createAddCollateralCalldata(abi: any, positionId: number, amount: bigint) {
    const addCollateralFunction = abi.find((item: any) => item.name === 'addCollateral');
    if (!addCollateralFunction) return '0x';
    
    const functionSelector = `0x${addCollateralFunction.name}(${addCollateralFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      addCollateralFunction.inputs.map((i: any) => i.type),
      [positionId.toString(), amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  function createWithdrawCollateralCalldata(abi: any, positionId: number, amount: bigint) {
    const withdrawCollateralFunction = abi.find((item: any) => item.name === 'withdrawCollateral');
    if (!withdrawCollateralFunction) return '0x';
    
    const functionSelector = `0x${withdrawCollateralFunction.name}(${withdrawCollateralFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      withdrawCollateralFunction.inputs.map((i: any) => i.type),
      [positionId.toString(), amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  function createRepayDebtCalldata(abi: any, positionId: number, amount: bigint) {
    const repayDebtFunction = abi.find((item: any) => item.name === 'repayDebt');
    if (!repayDebtFunction) return '0x';
    
    const functionSelector = `0x${repayDebtFunction.name}(${repayDebtFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      repayDebtFunction.inputs.map((i: any) => i.type),
      [positionId.toString(), amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  function createPSMSwapCollateralForVCOPCalldata(abi: any, amount: bigint) {
    const swapFunction = abi.find((item: any) => item.name === 'psmSwapCollateralForVCOP');
    if (!swapFunction) return '0x';
    
    const functionSelector = `0x${swapFunction.name}(${swapFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      swapFunction.inputs.map((i: any) => i.type),
      [amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  function createPSMSwapVCOPForCollateralCalldata(abi: any, amount: bigint) {
    const swapFunction = abi.find((item: any) => item.name === 'psmSwapVCOPForCollateral');
    if (!swapFunction) return '0x';
    
    const functionSelector = `0x${swapFunction.name}(${swapFunction.inputs.map((i: any) => i.type).join(',')})`.slice(0, 10);
    const encodedParams = encodeParameters(
      swapFunction.inputs.map((i: any) => i.type),
      [amount.toString()]
    );
    
    return `${functionSelector}${encodedParams.slice(2)}`;
  }
  
  // Simple parameter encoding (not full ABI encoding)
  function encodeParameters(types: string[], values: string[]) {
    // This is a simplified version - in a real app you would use a proper encoding library
    return '0x' + values.map((value, i) => {
      if (types[i] === 'address') {
        return value.slice(2).padStart(64, '0');
      } else if (types[i] === 'uint256') {
        const bn = BigInt(value);
        return bn.toString(16).padStart(64, '0');
      }
      return value;
    }).join('');
  }

  // Base Sepolia Chain ID
  const BASE_SEPOLIA_CHAIN_ID = 84532;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">VCOP Collateral System</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button 
          className={`px-4 py-2 rounded-md ${activeTab === 'loan' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('loan')}
        >
          Loan Management
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${activeTab === 'psm' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('psm')}
        >
          Peg Stability Module
        </button>
      </div>
      
      {activeTab === 'loan' ? (
        <div>
          <div className="flex space-x-4 mb-6">
            <button 
              className={`px-4 py-2 rounded-md ${loanAction === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setLoanAction('create')}
            >
              Create Position
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${loanAction === 'addCollateral' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setLoanAction('addCollateral')}
            >
              Add Collateral
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${loanAction === 'withdraw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setLoanAction('withdraw')}
            >
              Withdraw
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${loanAction === 'repay' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setLoanAction('repay')}
            >
              Repay
            </button>
          </div>
          
          {(loanAction === 'addCollateral' || loanAction === 'withdraw' || loanAction === 'repay') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position ID</label>
              <input
                type="number"
                min="0"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {(loanAction === 'create' || loanAction === 'addCollateral' || loanAction === 'withdraw') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {loanAction === 'withdraw' ? 'Withdraw Amount (USDC)' : 'Collateral Amount (USDC)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {(loanAction === 'create' || loanAction === 'repay') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {loanAction === 'repay' ? 'Repay Amount (VCOP)' : 'Mint Amount (VCOP)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.000001"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex space-x-4 mb-6">
            <button 
              className={`px-4 py-2 rounded-md ${psmAction === 'buyVCOP' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setPsmAction('buyVCOP')}
            >
              Buy VCOP
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${psmAction === 'sellVCOP' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setPsmAction('sellVCOP')}
            >
              Sell VCOP
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {psmAction === 'buyVCOP' ? 'USDC Amount' : 'VCOP Amount'}
            </label>
            <input
              type="number"
              min="0"
              step="0.000001"
              value={psmAmount}
              onChange={(e) => setPsmAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {activeTab === 'psm' && (
            <div className="mt-2 mb-4 text-sm text-gray-600">
              <p>The Peg Stability Module enables buying and selling VCOP at a rate near 1:1 with the Colombian Peso.</p>
              <p>- Buy VCOP: Exchange USDC for newly minted VCOP.</p>
              <p>- Sell VCOP: Exchange VCOP for USDC from reserves.</p>
            </div>
          )}

          {loanAction === 'psm' && (
            <div className="hidden">
              {/* Hidden inputs for PSM logic to work with loanAction state */}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'psm' && (
        <div className="mb-2 mt-4">
          <button 
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => setLoanAction('psm')}
          >
            Continue with PSM
          </button>
        </div>
      )}
      
      <div className="mt-8">
        {isConnected ? (
          <Transaction
            chainId={BASE_SEPOLIA_CHAIN_ID}
            calls={generateTransactionCalls}
            onStatus={handleOnStatus}
          >
            <TransactionButton 
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" 
              text={
                loanAction === 'create' ? 'Create Collateralized Position' :
                loanAction === 'addCollateral' ? 'Add Collateral' :
                loanAction === 'withdraw' ? 'Withdraw Collateral' :
                loanAction === 'repay' ? 'Repay Debt' :
                psmAction === 'buyVCOP' ? 'Buy VCOP with USDC' : 'Sell VCOP for USDC'
              }
            />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        ) : (
          <Wallet>
            <ConnectWallet className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              <Avatar className="h-6 w-6 mr-2" />
              <Name />
            </ConnectWallet>
          </Wallet>
        )}
      </div>
    </div>
  );
};

export default CollateralLoan; 