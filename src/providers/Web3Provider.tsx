import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { NETWORKS } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
// https://repo.sourcify.dev/contracts/full_match/23294/0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { UnknownNetworkError } from '../utils/errors'
import detectEthereumProvider from '@metamask/detect-provider';

const MAX_GAS_PRICE = utils.parseUnits('100', 'gwei').toNumber()
const MAX_GAS_LIMIT = 100000

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider
  }
}

interface Web3ProviderState {
  isConnected: boolean
  ethProvider: ethers.providers.Web3Provider | null
  sapphireEthProvider: (ethers.providers.Web3Provider & sapphire.SapphireAnnex) | null
  wRoseContractAddress: string | null
  wRoseContract: ethers.Contract | null
  account: string | null
  explorerBaseUrl: string | null
  networkName: string | null
}

interface Web3ProviderContext {
  readonly state: Web3ProviderState
  wrap: (amount: string) => Promise<TransactionResponse>
  unwrap: (amount: string) => Promise<TransactionResponse>
  isMetaMaskInstalled: () => Promise<boolean>
  connectWallet: () => Promise<void>
  switchNetwork: () => Promise<void>
  getBalance: () => Promise<BigNumber>
  getBalanceOfWROSE: () => Promise<BigNumber>
  getTransaction: (txHash: string) => Promise<TransactionResponse>
  addTokenToWallet: () => Promise<void>
}

const web3ProviderInitialState: Web3ProviderState = {
  isConnected: false,
  ethProvider: null,
  sapphireEthProvider: null,
  wRoseContractAddress: null,
  wRoseContract: null,
  account: null,
  explorerBaseUrl: null,
  networkName: null,
}

export const Web3Context = createContext<Web3ProviderContext>({} as Web3ProviderContext)

export const Web3ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<Web3ProviderState>({
    ...web3ProviderInitialState,
  })

  const _init = async (account: string) => {
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum)
      const sapphireEthProvider = sapphire.wrap(ethProvider) as (ethers.providers.Web3Provider & sapphire.SapphireAnnex)

      const network = await sapphireEthProvider.getNetwork()

      if (!(network.chainId in NETWORKS)) {
        return Promise.reject(new UnknownNetworkError('Unknown network!'))
      }

      const { wRoseContractAddress, explorerBaseUrl, networkName } = NETWORKS[network.chainId]

      const wRoseContract = new ethers.Contract(
        wRoseContractAddress,
        WrappedRoseMetadata.output.abi,
        sapphireEthProvider.getSigner(),
      )

      setState(prevState => ({
        ...prevState,
        isConnected: true,
        ethProvider,
        sapphireEthProvider,
        wRoseContract,
        account,
        explorerBaseUrl,
        networkName,
        wRoseContractAddress
      }))
    } catch (ex) {
      setState(prevState => ({
        ...prevState,
        isConnected: false,
      }))

      throw new Error('[Web3Context] Unable to initialize providers!')
    }
  }

  const getBalance = async () => {
    const { account, sapphireEthProvider } = state

    if (!account || !sapphireEthProvider) {
      throw new Error('[Web3Context] Unable to fetch balance!')
    }

    return await sapphireEthProvider.getBalance(account)
  }

  const getBalanceOfWROSE = async () => {
    const { account, wRoseContract } = state

    if (!account || !wRoseContract) {
      throw new Error('[Web3Context] Unable to fetch WROSE balance!')
    }

    return await wRoseContract.balanceOf(account)
  }

  const isMetaMaskInstalled = async () => {
    const provider = await detectEthereumProvider();

    return !!window.ethereum && provider === window.ethereum;
  }

  const connectWallet = async () => {
    const [account] = await window.ethereum.request?.({ method: 'eth_requestAccounts' })

    if (!account) {
      throw new Error('[Web3Context] Request account failed!')
    }

    await _init(account)
  }

  const _addNetwork = async (chainId: number) => {
    if (chainId === 0x5afe) {

      // Default to Sapphire Mainnet
      await window.ethereum.request?.({
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

  const switchNetwork = async (toNetworkChainId = 0x5afe) => {
    const ethProvider = new ethers.providers.Web3Provider(window.ethereum)
    const sapphireEthProvider = sapphire.wrap(ethProvider) as (ethers.providers.Web3Provider & sapphire.SapphireAnnex)

    const network = await sapphireEthProvider.getNetwork()

    if (network.chainId === toNetworkChainId) return
    try {
      await window.ethereum.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: utils.hexlify(toNetworkChainId) }],
      })
    } catch (e) {
      // Metamask desktop - Throws e.code 4902 when chain is not available
      // Metamask mobile - Error includes wallet_addEthereumChain & requested chainId in this case 0x5afe
      if (e?.code !== 4902 && !(e?.message?.includes('wallet_addEthereumChain') && e?.message?.includes(utils.hexlify(toNetworkChainId)))) {
        throw e
      } else {
        _addNetwork(toNetworkChainId)
      }
    }
  }

  const wrap = async (amount) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      throw new Error('[wRoseContract] not initialized!')
    }

    return await wRoseContract.deposit({ value: amount, gasLimit: MAX_GAS_LIMIT, gasPrice: MAX_GAS_PRICE })
  }

  const unwrap = async (amount) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      throw new Error('[wRoseContract] not initialized!')
    }

    return await wRoseContract.withdraw(amount, { gasLimit: MAX_GAS_LIMIT, gasPrice: MAX_GAS_PRICE })
  }

  const getTransaction = async (txHash: string) => {
    if (!txHash) {
      throw new Error('[txHash] is required!')
    }

    const { sapphireEthProvider } = state

    if (!sapphireEthProvider) {
      throw new Error('[sapphireEthProvider] not initialized!')
    }

    const txReceipt = await sapphireEthProvider.waitForTransaction(txHash)
    if (txReceipt.status === 0) throw new Error('Transaction failed')

    return await sapphireEthProvider.getTransaction(txHash)
  }

  const addTokenToWallet = async () => {
    const { wRoseContractAddress: address } = state
    const symbol = 'WROSE'

    try {
      await window.ethereum.request?.({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
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

  const providerState: Web3ProviderContext = {
    state,
    isMetaMaskInstalled,
    connectWallet,
    switchNetwork,
    wrap,
    unwrap,
    getBalance,
    getBalanceOfWROSE,
    getTransaction,
    addTokenToWallet,
  }

  return <Web3Context.Provider value={providerState}>{children}</Web3Context.Provider>
}

export const useWeb3 = () => {
  const value = useContext(Web3Context)
  if (value === undefined) {
    throw new Error('[useWeb3] Component not wrapped within a Provider')
  }

  return value
}
