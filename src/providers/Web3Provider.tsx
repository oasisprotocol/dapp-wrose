import { createContext, FC, PropsWithChildren, useCallback, useState } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { NETWORKS } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
// https://repo.sourcify.dev/contracts/full_match/23294/0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { MetaMaskError, UnknownNetworkError } from '../utils/errors'
import detectEthereumProvider from '@metamask/detect-provider'

const MAX_GAS_PRICE = utils.parseUnits('100', 'gwei').toNumber()
const MAX_GAS_LIMIT = 100000

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & ethers.providers.Web3Provider
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

  const _connectionChanged = (isConnected: boolean) => {
    setState(prevState => ({
      ...prevState,
      isConnected,
    }))
  }

  const _accountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length <= 0) {
      _connectionChanged(false)
      return
    }

    const [account] = accounts
    setState(prevState => ({
      ...prevState,
      account,
    }))
  }, [])

  const _setNetworkSpecificVars = (
    chainId: number,
    sapphireEthProvider = state.sapphireEthProvider!,
  ): void => {
    if (!sapphireEthProvider) {
      throw new Error('[Web3Context] Sapphire provider is required!')
    }

    if (!(chainId in NETWORKS)) {
      throw new UnknownNetworkError('Unknown network!')
    }

    const { wRoseContractAddress, explorerBaseUrl, networkName } = NETWORKS[chainId]

    const wRoseContract = new ethers.Contract(
      wRoseContractAddress,
      WrappedRoseMetadata.output.abi,
      sapphireEthProvider.getSigner(),
    )

    setState(prevState => ({
      ...prevState,
      wRoseContract,
      explorerBaseUrl,
      networkName,
      wRoseContractAddress,
    }))
  }

  const _chainChanged = useCallback(() => {
    window.location.reload()
  }, [])

  // TODO: This should probably use separate status, like isOffline(with warning message), to not interrupt the user flow
  const _connect = useCallback(() => _connectionChanged(true), [])
  const _disconnect = useCallback(() => _connectionChanged(false), [])

  const _addEventListeners = (ethProvider = window.ethereum!) => {
    ethProvider.on('accountsChanged', _accountsChanged)
    ethProvider.on('chainChanged', _chainChanged)
    ethProvider.on('connect', _connect)
    ethProvider.on('disconnect', _disconnect)
  }

  const _removeEventListeners = (ethProvider = window.ethereum!) => {
    ethProvider.off('accountsChanged', _accountsChanged)
    ethProvider.off('chainChanged', _chainChanged)
    ethProvider.off('connect', _connect)
    ethProvider.off('disconnect', _disconnect)
  }

  const _init = async (account: string) => {
    _removeEventListeners()

    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum!)
      const sapphireEthProvider = sapphire.wrap(ethProvider) as ethers.providers.Web3Provider &
        sapphire.SapphireAnnex

      const network = await sapphireEthProvider.getNetwork()
      _setNetworkSpecificVars(network.chainId, sapphireEthProvider)

      _addEventListeners()

      setState(prevState => ({
        ...prevState,
        isConnected: true,
        ethProvider,
        sapphireEthProvider,
        account,
      }))
    } catch (ex) {
      setState(prevState => ({
        ...prevState,
        isConnected: false,
      }))

      if (ex instanceof UnknownNetworkError) {
        throw ex
      } else {
        throw new Error('[Web3Context] Unable to initialize providers!')
      }
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
    const provider = await detectEthereumProvider()

    return !!window.ethereum && provider === window.ethereum
  }

  const connectWallet = async () => {
    const accounts: string[] = await (window.ethereum?.request?.({ method: 'eth_requestAccounts' }) ||
      Promise.resolve([]))

    if (!accounts || accounts?.length <= 0) {
      throw new Error('[Web3Context] Request account failed!')
    }

    await _init(accounts[0])
  }

  const _addNetwork = async (chainId: number) => {
    if (chainId === 0x5afe) {
      // Default to Sapphire Mainnet
      return await window.ethereum?.request?.({
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
    const ethProvider = new ethers.providers.Web3Provider(window.ethereum!)
    const sapphireEthProvider = sapphire.wrap(ethProvider) as ethers.providers.Web3Provider &
      sapphire.SapphireAnnex

    const network = await sapphireEthProvider.getNetwork()

    if (network.chainId === toNetworkChainId) return
    try {
      await window.ethereum!.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: utils.hexlify(toNetworkChainId) }],
      })
    } catch (e) {
      const metaMaskError = e as MetaMaskError
      // Metamask desktop - Throws e.code 4902 when chain is not available
      // Metamask mobile - Throws generic -32603 (https://github.com/MetaMask/metamask-mobile/issues/3312)

      if (metaMaskError?.code !== 4902 && metaMaskError?.code !== -32603) {
        throw metaMaskError
      } else {
        _addNetwork(toNetworkChainId)
      }
    }
  }

  const wrap = async (amount: string) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      throw new Error('[wRoseContract] not initialized!')
    }

    return await wRoseContract.deposit({ value: amount, gasLimit: MAX_GAS_LIMIT, gasPrice: MAX_GAS_PRICE })
  }

  const unwrap = async (amount: string) => {
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
      await window.ethereum?.request?.({
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
