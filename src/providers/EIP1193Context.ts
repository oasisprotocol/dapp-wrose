import { createContext } from 'react'

export interface EIP1193ProviderContext {
  isEIP1193ProviderAvailable: () => Promise<boolean>
  connectWallet: () => Promise<string>
  switchNetwork: (chainId: number) => void
  addTokenToWallet: (wRoseContractAddress: string) => Promise<void>
}

export const EIP1193Context = createContext<EIP1193ProviderContext>({} as EIP1193ProviderContext)
