import { createContext } from 'react'
import { EIP6963ClassProvider } from '../utils/EIP6963Provider.class.ts'

export interface EIP6963ProviderState {
  provider: EIP6963ClassProvider
  isEIP6963ProviderAvailable: boolean
}

export interface EIP6963ProviderContext {
  readonly state: EIP6963ProviderState
  isEIP6963ProviderAvailableSync: () => boolean
  connectWallet: () => Promise<string>
  switchNetwork: (chainId: number) => void
  addTokenToWallet: (wRoseContractAddress: string) => Promise<void>
}

export const EIP6963Context = createContext<EIP6963ProviderContext>({} as EIP6963ProviderContext)
