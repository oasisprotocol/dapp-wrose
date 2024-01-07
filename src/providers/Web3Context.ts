import { createContext } from 'react'
import { BigNumber, ethers } from 'ethers'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { TransactionResponse } from '@ethersproject/abstract-provider'

export interface Web3ProviderState {
  isInitialized: boolean
  ethProvider: ethers.providers.Web3Provider | null
  sapphireEthProvider: (ethers.providers.Web3Provider & sapphire.SapphireAnnex) | null
  wRoseContractAddress: string | null
  wRoseContract: ethers.Contract | null
  explorerBaseUrl: string | null
  networkName: string | null
}

export interface Web3ProviderContext {
  readonly state: Web3ProviderState
  wrap: (amount: string, gasPrice: BigNumber) => Promise<TransactionResponse>
  unwrap: (amount: string, gasPrice: BigNumber) => Promise<TransactionResponse>
  getBalance: () => Promise<BigNumber>
  getBalanceOfWROSE: () => Promise<BigNumber>
  getTransaction: (txHash: string) => Promise<TransactionResponse>
  addTokenToWallet: () => Promise<void>
  getGasPrice: () => Promise<BigNumber>
}

export const Web3Context = createContext<Web3ProviderContext>({} as Web3ProviderContext)
