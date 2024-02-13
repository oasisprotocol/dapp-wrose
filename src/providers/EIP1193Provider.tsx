import { FC, PropsWithChildren } from 'react'
import { ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { MetaMaskError } from '../utils/errors'
import detectEthereumProvider from '@metamask/detect-provider'
import { EIP1193Context, EIP1193ProviderContext } from './EIP1193Context.ts'

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & ethers.providers.Web3Provider
  }
}

export const EIP1193ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const isEIP1193ProviderAvailable = async () => {
    const provider = await detectEthereumProvider({
      // Explicitly set, provider doesn't have to be MetaMask
      mustBeMetaMask: false,
    })

    return !!window.ethereum && provider === window.ethereum
  }

  const connectWallet = async (): Promise<string> => {
    const accounts: string[] = await (window.ethereum?.request?.({ method: 'eth_requestAccounts' }) ||
      Promise.resolve([]))

    if (!accounts || accounts?.length <= 0) {
      throw new Error('[EIP1193Context] Request account failed!')
    }

    return accounts[0]
  }

  const _addNetwork = (chainId: number) => {
    if (chainId === 0x5afe) {
      // Default to Sapphire Mainnet
      return window.ethereum?.request?.({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afe',
            chainName: 'Oasis Sapphire',
            nativeCurrency: {
              name: 'ROSE',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: ['https://sapphire.oasis.io/', 'wss://sapphire.oasis.io/ws'],
            blockExplorerUrls: ['https://explorer.oasis.io/mainnet/sapphire'],
          },
        ],
      })
    }

    throw new Error('Unable to automatically add the network, please do it manually!')
  }

  const switchNetwork = async (chainId = 0x5afe) => {
    const ethProvider = new ethers.providers.Web3Provider(window.ethereum!)
    const sapphireEthProvider = sapphire.wrap(ethProvider) as ethers.providers.Web3Provider &
      sapphire.SapphireAnnex

    const network = await sapphireEthProvider.getNetwork()

    if (network.chainId === chainId) return
    try {
      await window.ethereum!.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: utils.hexlify(chainId) }],
      })
    } catch (e) {
      const metaMaskError = e as MetaMaskError
      // Metamask desktop - Throws e.code 4902 when chain is not available
      // Metamask mobile - Throws generic -32603 (https://github.com/MetaMask/metamask-mobile/issues/3312)

      if (metaMaskError?.code !== 4902 && metaMaskError?.code !== -32603) {
        throw metaMaskError
      } else {
        _addNetwork(chainId)
      }
    }
  }

  const addTokenToWallet = async (wRoseContractAddress: string) => {
    const symbol = 'WROSE'

    try {
      await window.ethereum?.request?.({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: wRoseContractAddress,
            symbol,
            decimals: 18,
          },
          // Fails if Array
        } as unknown as never,
      })
    } catch (ex) {
      // Silently fail
      console.error(ex)
    }
  }

  const providerState: EIP1193ProviderContext = {
    isEIP1193ProviderAvailable,
    connectWallet,
    switchNetwork,
    addTokenToWallet,
  }

  return <EIP1193Context.Provider value={providerState}>{children}</EIP1193Context.Provider>
}
