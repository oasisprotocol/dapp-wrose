import { createContext } from 'react'
import { BigNumber, ethers } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

export enum ProviderType {
  EIP1193,
  EIP6963,
}

export interface Web3ProviderState {
  isConnected: boolean
  web3Provider: ethers.providers.Web3Provider | null
  wRoseContractAddress: string | null
  wRoseContract: ethers.Contract | null
  account: string | null
  explorerBaseUrl: string | null
  networkName: string | null
  providerType: ProviderType
}

export interface Web3ProviderContext {
  readonly state: Web3ProviderState
  wrap: (amount: string, gasPrice: BigNumber) => Promise<TransactionResponse>
  unwrap: (amount: string, gasPrice: BigNumber) => Promise<TransactionResponse>
  connectWallet: (providerType?: ProviderType) => Promise<void>
  switchNetwork: (chainId?: number) => Promise<void>
  getBalance: () => Promise<BigNumber>
  getBalanceOfWROSE: () => Promise<BigNumber>
  getTransaction: (txHash: string) => Promise<TransactionResponse>
  addTokenToWallet: () => Promise<void>
  getGasPrice: () => Promise<BigNumber>
  isProviderAvailable: () => Promise<boolean>
}

export const Web3Context = createContext<Web3ProviderContext>({} as Web3ProviderContext)
