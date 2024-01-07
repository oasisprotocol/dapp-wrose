import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { MAX_GAS_LIMIT, NETWORKS } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
// https://repo.sourcify.dev/contracts/full_match/23294/0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { UnknownNetworkError } from '../utils/errors'
import { Web3ProviderContext, Web3ProviderState, Web3Context } from './Web3Context'
import { useWalletConnect } from '../hooks/useWalletConnect'

const web3ProviderInitialState: Web3ProviderState = {
  isInitialized: false,
  ethProvider: null,
  sapphireEthProvider: null,
  wRoseContractAddress: null,
  wRoseContract: null,
  explorerBaseUrl: null,
  networkName: null,
}

export const Web3ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { walletProvider, address },
  } = useWalletConnect()

  const [state, setState] = useState<Web3ProviderState>({
    ...web3ProviderInitialState,
  })

  const _setNetworkSpecificVars = useCallback(
    (chainId: number, sapphireEthProvider: ethers.providers.Web3Provider & sapphire.SapphireAnnex): void => {
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
    },
    [],
  )

  useEffect(() => {
    if (!walletProvider) {
      return
    }

    const init = async () => {
      try {
        const ethProvider = new ethers.providers.Web3Provider(walletProvider)
        const sapphireEthProvider = sapphire.wrap(ethProvider) as ethers.providers.Web3Provider &
          sapphire.SapphireAnnex

        const network = await sapphireEthProvider.getNetwork()
        _setNetworkSpecificVars(network.chainId, sapphireEthProvider)

        setState(prevState => ({
          ...prevState,
          ethProvider,
          sapphireEthProvider,
          isInitialized: true,
        }))
      } catch (ex) {
        setState(prevState => ({
          ...prevState,
          isInitialized: false,
        }))

        if (ex instanceof UnknownNetworkError) {
          throw ex
        } else {
          throw new Error('[Web3Context] Unable to initialize providers!')
        }
      }
    }

    init()
  }, [_setNetworkSpecificVars, walletProvider])

  const getBalance = async (): Promise<BigNumber> => {
    const { sapphireEthProvider } = state

    if (!address || !sapphireEthProvider) {
      throw new Error('[Web3Context] Unable to fetch balance!')
    }

    return await sapphireEthProvider.getBalance(address)
  }

  const getBalanceOfWROSE = async (): Promise<BigNumber> => {
    const { wRoseContract } = state

    if (!address || !wRoseContract) {
      throw new Error('[Web3Context] Unable to fetch WROSE balance!')
    }

    return await wRoseContract.balanceOf(address)
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
    const { wRoseContractAddress: address } = state
    const symbol = 'WROSE'

    try {
      await (
        window.ethereum as unknown as ethers.providers.ExternalProvider & ethers.providers.Web3Provider
      )?.request?.({
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
