import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'
import { ethers, utils } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { WROSE_CONTRACT_BY_NETWORK } from '../constants/config'
// https://repo.sourcify.dev/contracts/full_match/23295/0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94/
import WrappedRoseMetadata from '../contracts/WrappedROSE.json'

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
  wrap: (amount: string) => Promise<void>
  unwrap: (amount: string) => Promise<void>
  connectWallet: () => Promise<void>
  balance: () => Promise<string>
  balanceOfWROSE: () => Promise<string>
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
      const contractAddress = WROSE_CONTRACT_BY_NETWORK[network.chainId]

      if (!contractAddress) {
        // TODO: Propagate unsupported network error
        throw new Error('[Web3Context] Unsupported network!')
      }

      const wRoseContract = new ethers.Contract(
        // Sapphire testnet
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

  const balance = async () => {
    const { account, sapphireEthProvider } = state

    if (!account || !sapphireEthProvider) {
      return
    }

    const balanceString = (await sapphireEthProvider.getBalance(account)).toString()
    return utils.formatEther(balanceString)
  }

  const balanceOfWROSE = async () => {
    const { account, wRoseContract } = state

    if (!account || !wRoseContract) {
      return
    }

    const balanceString = (await wRoseContract.balanceOf(account)).toString()
    return utils.formatEther(balanceString)
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
      return
    }

    const value = utils.parseUnits(amount, 'ether').toString()
    await wRoseContract.deposit({ value, gasLimit: MAX_GAS_LIMIT, gasPrice: MAX_GAS_PRICE })
  }

  const unwrap = async (amount) => {
    if (!amount) {
      throw new Error('[amount] is required!')
    }

    const { wRoseContract } = state

    if (!wRoseContract) {
      return
    }

    const value = utils.parseUnits(amount, 'ether').toString()
    await wRoseContract.withdraw(value, { gasLimit: MAX_GAS_LIMIT, gasPrice: MAX_GAS_PRICE })
  }

  const providerState: Web3ProviderContext = {
    state,
    connectWallet,
    wrap,
    unwrap,
    balance,
    balanceOfWROSE,
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
