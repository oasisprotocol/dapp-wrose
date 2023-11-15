import { createContext, FC, PropsWithChildren, useContext, useState } from 'react'
import { BigNumber, BigNumberish } from 'ethers'
import { useWeb3 } from './Web3Provider'
import { TransactionResponse } from '@ethersproject/abstract-provider'

export enum WrapFormType {
  WRAP = 'wrap',
  UNWRAP = 'unwrap',
}

interface WrapFormProviderState {
  isLoading: boolean
  amount: BigNumber | null
  formType: WrapFormType
  balance: BigNumber,
  wRoseBalance: BigNumber
}

interface WrapFormProviderContext {
  readonly state: WrapFormProviderState
  init: () => void
  setAmount: (amount: BigNumberish) => void
  toggleFormType: () => void;
  submit: (amount: BigNumber) => Promise<TransactionResponse>;
}

const wrapFormProviderInitialState: WrapFormProviderState = {
  isLoading: false,
  amount: null,
  formType: WrapFormType.UNWRAP,
  balance: BigNumber.from(0),
  wRoseBalance: BigNumber.from(0),
}

export const WrapFormContext = createContext<WrapFormProviderContext>({} as WrapFormProviderContext)

export const WrapFormContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { state: { isConnected }, getBalance, getBalanceOfWROSE, wrap, unwrap } = useWeb3()
  const [state, setState] = useState<WrapFormProviderState>({
    ...wrapFormProviderInitialState,
  })

  const _setIsLoading = (isLoading: boolean) => {
    setState(prevState => ({
      ...prevState,
      isLoading,
    }))
  }

  const init = async () => {
    if (!isConnected) {
      return
    }

    _setIsLoading(true)

    const [
      balance,
      wRoseBalance,
    ] = await Promise.all([
      getBalance(),
      getBalanceOfWROSE(),
    ])

    setState(prevState => ({
      ...prevState,
      balance,
      wRoseBalance,
      isLoading: false,
    }))
  }

  const setAmount = async (amount: BigNumberish) => {
    try {
      // Throws if invalid number
      const amountBN = BigNumber.from(amount)

      setState(prevState => ({
        ...prevState,
        amount: amountBN,
      }))
    } catch (ex) {
      console.error(ex)
    }
  }

  const toggleFormType = () => {
    setState(({ formType, ...prevState }) => ({
      ...prevState,
      formType: formType === WrapFormType.WRAP ? WrapFormType.UNWRAP : WrapFormType.WRAP,
    }))
  }

  const submit = async (amount: BigNumber) => {
    _setIsLoading(true)

    const { formType, wRoseBalance, balance } = state

    let receipt: TransactionResponse | null = null

    if (formType === WrapFormType.WRAP) {

      receipt = await wrap(amount.toString())
    } else if (formType === WrapFormType.UNWRAP) {

      receipt = await unwrap(amount.toString())
    } else {
      _setIsLoading(false)
      return Promise.reject(new Error('[formType] Invalid form type'))
    }

    _setIsLoading(false)
    return receipt
  }

  const providerState: WrapFormProviderContext = {
    state,
    init,
    setAmount,
    toggleFormType,
    submit,
  }

  return <WrapFormContext.Provider value={providerState}>{children}</WrapFormContext.Provider>
}

export const useWrapForm = () => {
  const value = useContext(WrapFormContext)
  if (value === undefined) {
    throw new Error('[useWrapForm] Component not wrapped within a Provider')
  }

  return value
}
