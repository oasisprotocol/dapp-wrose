import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { MAX_GAS_LIMIT, NETWORKS } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
// https://repo.sourcify.dev/contracts/full_match/23294/0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { UnknownNetworkError } from '../utils/errors'
import { ProviderType, Web3Context, Web3ProviderContext, Web3ProviderState } from './Web3Context'
import { useEIP1193 } from '../hooks/useEIP1193.ts'

const web3ProviderInitialState: Web3ProviderState = {
  isConnected: false,
  ethProvider: null,
  sapphireEthProvider: null,
  wRoseContractAddress: null,
  wRoseContract: null,
  account: null,
  explorerBaseUrl: null,
  networkName: null,
  providerType: ProviderType.EIP1193,
}

export const Web3ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    isEIP1193ProviderAvailable,
    connectWallet: connectWalletEIP1193,
    switchNetwork: switchNetworkEIP1193,
    addTokenToWallet: addTokenToWalletEIP1193,
  } = useEIP1193()

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

  const _addEventListenersOnce = (() => {
    let eventListenersInitialized = false
    return (ethProvider: typeof window.ethereum) => {
      if (eventListenersInitialized) {
        return
      }

      ethProvider?.on?.('accountsChanged', _accountsChanged)
      ethProvider?.on?.('chainChanged', _chainChanged)
      ethProvider?.on?.('connect', _connect)
      ethProvider?.on?.('disconnect', _disconnect)

      eventListenersInitialized = true
    }
  })()

  const _init = async (account: string, provider: typeof window.ethereum) => {
    try {
      const ethProvider = new ethers.providers.Web3Provider(provider!)
      const sapphireEthProvider = sapphire.wrap(ethProvider) as ethers.providers.Web3Provider &
        sapphire.SapphireAnnex

      const network = await sapphireEthProvider.getNetwork()
      _setNetworkSpecificVars(network.chainId, sapphireEthProvider)

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

  const isProviderAvailable = async () => {
    const { providerType } = state

    switch (providerType) {
      case ProviderType.EIP1193:
        return isEIP1193ProviderAvailable()
      default:
        return false
    }
  }

  const _getConnectedAccount = () => {
    const { providerType } = state

    switch (providerType) {
      case ProviderType.EIP1193:
        return connectWalletEIP1193()
      default:
        return
    }
  }

  const connectWallet = async () => {
    const { providerType } = state
    const account = await _getConnectedAccount()

    if (!account) {
      throw new Error('[Web3Context] Request account failed!')
    }

    switch (providerType) {
      case ProviderType.EIP1193: {
        await _init(account, window.ethereum)
        _addEventListenersOnce(window.ethereum)
      }
    }
  }

  const switchNetwork = async (chainId = 0x5afe) => {
    const { providerType } = state

    switch (providerType) {
      case ProviderType.EIP1193:
        return switchNetworkEIP1193(chainId)
      default:
        return
    }
  }

  const getGasPrice = async () => {
    const { sapphireEthProvider } = state

    if (!sapphireEthProvider) {
      // Silently fail
      return BigNumber.from(0)
    }

    return await sapphireEthProvider.getGasPrice()
  }

  const wrap = async (amount: string, gasPrice: BigNumber) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      throw new Error('[wRoseContract] not initialized!')
    }

    return await wRoseContract.deposit({ value: amount, gasLimit: MAX_GAS_LIMIT, gasPrice })
  }

  const unwrap = async (amount: string, gasPrice: BigNumber) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      throw new Error('[wRoseContract] not initialized!')
    }

    return await wRoseContract.withdraw(amount, { gasLimit: MAX_GAS_LIMIT, gasPrice })
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
    const { wRoseContractAddress, providerType } = state

    if (!wRoseContractAddress) {
      return
    }

    switch (providerType) {
      case ProviderType.EIP1193:
        return addTokenToWalletEIP1193(wRoseContractAddress)
    }
  }

  const providerState: Web3ProviderContext = {
    state,
    isProviderAvailable,
    connectWallet,
    switchNetwork,
    wrap,
    unwrap,
    getBalance,
    getBalanceOfWROSE,
    getTransaction,
    addTokenToWallet,
    getGasPrice,
  }

  return <Web3Context.Provider value={providerState}>{children}</Web3Context.Provider>
}
