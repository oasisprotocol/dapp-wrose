import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { EXPLORER_URL_BY_NETWORK, WROSE_CONTRACT_BY_NETWORK } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
// https://repo.sourcify.dev/contracts/full_match/23294/0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { UnknownNetworkError } from '../utils/errors'

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
  wRoseContract: ethers.Contract | null
  account: string | null
  explorerBaseUrl: string | null
}

interface Web3ProviderContext {
  readonly state: Web3ProviderState
  wrap: (amount: string) => Promise<TransactionResponse>
  unwrap: (amount: string) => Promise<TransactionResponse>
  connectWallet: () => Promise<void>
  switchNetwork: () => Promise<void>
  getBalance: () => Promise<BigNumber>
  getBalanceOfWROSE: () => Promise<BigNumber>
  getTransaction: (txHash: string) => Promise<TransactionResponse>
}

const web3ProviderInitialState: Web3ProviderState = {
  isConnected: false,
  ethProvider: null,
  sapphireEthProvider: null,
  wRoseContract: null,
  account: null,
  explorerBaseUrl: null
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

      if (!(network.chainId in WROSE_CONTRACT_BY_NETWORK)) {
        return Promise.reject(new UnknownNetworkError('Unknown network!'))
      }

      const contractAddress = WROSE_CONTRACT_BY_NETWORK[network.chainId]

      const wRoseContract = new ethers.Contract(
        contractAddress,
        WrappedRoseMetadata.output.abi,
        sapphireEthProvider.getSigner(),
      )

      const explorerBaseUrl = EXPLORER_URL_BY_NETWORK[network.chainId]

      setState(prevState => ({
        ...prevState,
        isConnected: true,
        ethProvider,
        sapphireEthProvider,
        wRoseContract,
        account,
        explorerBaseUrl
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
    // return utils.formatEther(balanceString)
  }

  const getBalanceOfWROSE = async () => {
    const { account, wRoseContract } = state

    if (!account || !wRoseContract) {
      throw new Error('[Web3Context] Unable to fetch WROSE balance!')
    }

    return await wRoseContract.balanceOf(account)
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
            chainName: 'Sapphire Mainnet',
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
      // Chain is not available in the Metamask
      if (e?.code !== 4902) {
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

    await sapphireEthProvider.waitForTransaction(txHash)

    return await sapphireEthProvider.getTransaction(txHash)
  }

  const providerState: Web3ProviderContext = {
    state,
    connectWallet,
    switchNetwork,
    wrap,
    unwrap,
    getBalance,
    getBalanceOfWROSE,
    getTransaction,
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
