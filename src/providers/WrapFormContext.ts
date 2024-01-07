import { createContext } from 'react'
import { BigNumber, BigNumberish } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { WrapFormType } from '../utils/types'

export interface WrapFormProviderState {
  isLoading: boolean
  amount: BigNumber | null
  formType: WrapFormType
  balance: BigNumber
  wRoseBalance: BigNumber
  estimatedFee: BigNumber
  estimatedGasPrice: BigNumber
}

export interface WrapFormProviderContext {
  readonly state: WrapFormProviderState
  init: () => void
  setAmount: (amount: BigNumberish) => void
  toggleFormType: (amount: BigNumber | null) => void
  submit: (amount: BigNumber) => Promise<TransactionResponse>
  setFeeAmount: () => Promise<void>
  debounceLeadingSetFeeAmount: (fn?: () => Promise<void>, timeout?: number) => () => void
}

export const WrapFormContext = createContext<WrapFormProviderContext>({} as WrapFormProviderContext)
