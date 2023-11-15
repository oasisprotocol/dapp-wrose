import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'
import { BigNumber, ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { WROSE_CONTRACT_BY_NETWORK } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'
import { TransactionResponse } from '@ethersproject/abstract-provider'

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
}

interface Web3ProviderContext {
  readonly state: Web3ProviderState
  wrap: (amount: string) => Promise<TransactionResponse>
  unwrap: (amount: string) => Promise<TransactionResponse>
  connectWallet: () => Promise<void>
  getBalance: () => Promise<BigNumber>
  getBalanceOfWROSE: () => Promise<BigNumber>
}

const web3ProviderInitialState: Web3ProviderState = {
  isConnected: false,
  ethProvider: null,
  sapphireEthProvider: null,
  wRoseContract: null,
  account: null,
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
        // TODO: Propagate unsupported network error
        throw new Error('[Web3Context] Unsupported network!')
      }

      const contractAddress = WROSE_CONTRACT_BY_NETWORK[network.chainId]

      const wRoseContract = new ethers.Contract(
        contractAddress,
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

  const providerState: Web3ProviderContext = {
    state,
    connectWallet,
    wrap,
    unwrap,
    getBalance,
    getBalanceOfWROSE,
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
