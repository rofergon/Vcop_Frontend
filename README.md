# VCOP Frontend

Frontend application for the VCOP (Venezuelan Coin Protocol) platform.

## Collateralized Loans System

The VCOP platform includes a collateralized lending system that allows users to deposit USDC as collateral and mint VCOP stablecoins. The system is built on smart contracts that maintain proper collateralization.

### Key Components

The loans section consists of several key components:

1. **Create Position**: Deposit USDC collateral and mint VCOP tokens
2. **Manage Position**: Add collateral, withdraw collateral, or repay debt
3. **PSM Swap**: Exchange between VCOP and USDC at near-peg rates using the Peg Stability Module
4. **Collateral Positions**: View and manage all your existing loan positions
5. **Market Info**: See current market data, including collateralization requirements

### How to Use

#### Creating a Loan Position

1. Navigate to the Loans page
2. Enter the amount of USDC you want to deposit as collateral
3. Adjust the utilization rate slider to determine how much VCOP to mint
   - Lower utilization = safer position but less efficient
   - Higher utilization = more VCOP but higher risk
4. Click "Create Loan" to create your position
5. Approve both the transaction to approve USDC spending and the transaction to create the position

#### Managing Positions

1. Select a position from the Collateral Positions list
2. Choose an operation:
   - **Add Collateral**: Deposit more USDC to improve your collateralization ratio
   - **Withdraw Collateral**: Remove excess collateral if your position is over-collateralized
   - **Repay Debt**: Pay back your VCOP debt to reduce your risk or close your position

#### Using the PSM Swap

The PSM (Peg Stability Module) allows for swapping between VCOP and USDC at a stable rate, with minimal fees:

1. Select your desired swap direction (USDC → VCOP or VCOP → USDC)
2. Enter the amount you wish to swap
3. Review the output amount (after fees)
4. Click "Swap" to execute the transaction

### Technical Implementation

The loans section is implemented using:

- React components for the UI
- OnchainKit's Transaction components for handling blockchain transactions
- Wagmi hooks for reading contract data
- Call functions that generate the transaction data needed for each operation

All components interact with the following smart contracts:

- `VCOPCollateralManager`: Manages collateral positions, collateralization ratios, and VCOP minting/burning
- `VCOPCollateralHook`: Handles PSM swaps and price stability mechanisms

## Development

### Environment Variables

The application requires the following environment variables:

```
VITE_VCOP_PRICE_CALCULATOR_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...
VITE_VCOP_ADDRESS=0x...
VITE_RESERVE_ADDRESS=0x...
VITE_VCOP_COLLATERAL_HOOK_ADDRESS=0x...
VITE_VCOP_COLLATERAL_MANAGER_ADDRESS=0x...
```

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```
