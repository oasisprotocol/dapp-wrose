import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react'
import {
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers5/react'
import {
  WalletConnectContext,
  WalletConnectProviderContext,
  WalletConnectProviderState,
} from './WalletConnectContext'

const walletConnectProviderInitialState: WalletConnectProviderState = {}

export const WalletConnectContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const web3ModalAccountState = useWeb3ModalAccount()
  const web3ModalProviderState = useWeb3ModalProvider()

  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()

  const [state] = useState<WalletConnectProviderState>({
    ...walletConnectProviderInitialState,
  })

  const prevChainId = useRef(web3ModalAccountState.chainId)

  // Handle chain change
  useEffect(() => {
    if (
      web3ModalAccountState.chainId &&
      prevChainId.current &&
      prevChainId.current !== web3ModalAccountState.chainId
    ) {
      window.location.reload()
    }

    prevChainId.current = web3ModalAccountState.chainId
  }, [web3ModalAccountState.chainId])

  const connectWallet = async () => {
    await open()
  }

  const switchAccount = async () => {
    await open({ view: 'Account' })
  }

  const switchNetwork = async () => {
    await open({ view: 'Networks' })
  }

  const disconnectWallet = async () => {
    await disconnect()
  }

  const providerState: WalletConnectProviderContext = {
    state: {
      ...state,
      ...web3ModalAccountState,
      ...web3ModalProviderState,
    },
    connectWallet,
    switchAccount,
    switchNetwork,
    disconnectWallet,
  }

  return <WalletConnectContext.Provider value={providerState}>{children}</WalletConnectContext.Provider>
}
