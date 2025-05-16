/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONCHAINKIT_API_KEY: string
  readonly VITE_VCOP_PRICE_CALCULATOR_ADDRESS: string
  readonly VITE_USDC_ADDRESS: string
  readonly VITE_VCOP_ADDRESS: string
  readonly VITE_RESERVE_ADDRESS: string
  readonly VITE_VCOP_COLLATERAL_HOOK_ADDRESS: string
  readonly VITE_VCOP_COLLATERAL_MANAGER_ADDRESS: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
