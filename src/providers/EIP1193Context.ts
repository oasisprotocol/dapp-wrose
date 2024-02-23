import { createContext } from 'react'
import { EIP1193Provider } from '../utils/types.ts'

export interface EIP1193ProviderContext {
  isEIP1193ProviderAvailable: () => Promise<boolean>
  connectWallet: (provider?: EIP1193Provider) => Promise<string>
  switchNetwork: (chainId: number, provider?: EIP1193Provider) => void
  addTokenToWallet: (wRoseContractAddress: string, provider?: EIP1193Provider) => Promise<void>
}

export const EIP1193Context = createContext<EIP1193ProviderContext>({} as EIP1193ProviderContext)
