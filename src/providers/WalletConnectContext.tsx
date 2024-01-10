import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { createContext } from 'react'

type Web3ModalAccountState = Partial<ReturnType<typeof useWeb3ModalAccount>>
type Web3ModalProviderState = Partial<ReturnType<typeof useWeb3ModalProvider>>
type Web3ModalState = Web3ModalAccountState & Web3ModalProviderState

export interface WalletConnectProviderState extends Web3ModalState {}

export interface WalletConnectProviderContext {
  readonly state: WalletConnectProviderState
  connectWallet: () => Promise<void>
  switchAccount: () => Promise<void>
  switchNetwork: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

export const WalletConnectContext = createContext<WalletConnectProviderContext>(
  {} as WalletConnectProviderContext,
)
