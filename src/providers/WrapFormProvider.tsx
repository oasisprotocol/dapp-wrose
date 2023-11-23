import { createContext, FC, PropsWithChildren, useState } from 'react'
import { BigNumber, BigNumberish, utils } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { useWeb3 } from '../hooks/useWeb3'
import { WrapFormType } from '../utils/types'

interface WrapFormProviderState {
  isLoading: boolean
  amount: BigNumber | null
  formType: WrapFormType
  balance: BigNumber
  wRoseBalance: BigNumber
}

interface WrapFormProviderContext {
  readonly state: WrapFormProviderState
  init: () => void
  setAmount: (amount: BigNumberish) => void
  toggleFormType: (amount: BigNumber | null) => void
  submit: (amount: BigNumber) => Promise<TransactionResponse>
  getFeeAmount: () => BigNumber
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
  const {
    state: { isConnected },
    getBalance,
    getBalanceOfWROSE,
    wrap,
    unwrap,
  } = useWeb3()
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

    const [balance, wRoseBalance] = await Promise.all([getBalance(), getBalanceOfWROSE()])

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
      const positiveAmountBN = amountBN.lte(0) ? BigNumber.from(0) : amountBN

      setState(prevState => ({
        ...prevState,
        amount: positiveAmountBN,
      }))
    } catch (ex) {
      // Ignore if invalid number
      console.error(ex)
    }
  }

  const getFeeAmount = () => {
    return utils.parseUnits('0.01', 'ether')
  }

  const toggleFormType = (amount: BigNumber | null) => {
    const { balance, wRoseBalance, formType } = state

    const toggledFormType = formType === WrapFormType.WRAP ? WrapFormType.UNWRAP : WrapFormType.WRAP

    let maxAmount = amount

    if (toggledFormType === WrapFormType.WRAP && amount?.gt(balance)) {
      maxAmount = balance.sub(getFeeAmount())
    } else if (toggledFormType === WrapFormType.UNWRAP && amount?.gt(wRoseBalance)) {
      maxAmount = wRoseBalance
    }

    setState(({ ...prevState }) => ({
      ...prevState,
      formType: toggledFormType,
      amount: maxAmount,
    }))
  }

  const submit = async (amount: BigNumber) => {
    if (!amount || amount.lte(0)) {
      return Promise.reject(new Error('Amount is required'))
    }

    _setIsLoading(true)

    const { formType, balance, wRoseBalance } = state

    let receipt: TransactionResponse | null = null

    if (formType === WrapFormType.WRAP) {
      if (amount.gt(balance.sub(getFeeAmount()))) {
        _setIsLoading(false)
        return Promise.reject(new Error('Insufficient balance'))
      }

      try {
        receipt = await wrap(amount.toString())
      } catch (ex) {
        _setIsLoading(false)
        throw ex
      }
    } else if (formType === WrapFormType.UNWRAP) {
      if (amount.gt(wRoseBalance)) {
        _setIsLoading(false)
        return Promise.reject(new Error('Insufficient balance'))
      }

      try {
        receipt = await unwrap(amount.toString())
      } catch (ex) {
        _setIsLoading(false)
        throw ex
      }
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
    getFeeAmount,
    setAmount,
    toggleFormType,
    submit,
  }

  return <WrapFormContext.Provider value={providerState}>{children}</WrapFormContext.Provider>
}
