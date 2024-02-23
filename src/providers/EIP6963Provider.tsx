import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { EIP6963Context, EIP6963ProviderContext, EIP6963ProviderState } from './EIP6963Context.ts'
import { EIP6963ClassProvider } from '../utils/EIP6963Provider.class.ts'
import { useEIP6963Manager } from '../hooks/useEIP6963Manager.ts'
import { useEIP1193 } from '../hooks/useEIP1193.ts'

const eip6963ProviderInitialState: EIP6963ProviderState = {
  provider: new EIP6963ClassProvider(),
  isEIP6963ProviderAvailable: false,
}

export const EIP6963ContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { providerList },
  } = useEIP6963Manager()
  const {
    connectWallet: connectWalletEIP1193,
    switchNetwork: switchNetworkEIP1193,
    addTokenToWallet: addTokenToWalletEIP1193,
  } = useEIP1193()

  const [state, setState] = useState<EIP6963ProviderState>({
    ...eip6963ProviderInitialState,
  })

  useEffect(() => {
    const { isEIP6963ProviderAvailable } = state

    const isEIP6963ProviderAvailableNext = !!providerList.length

    if (isEIP6963ProviderAvailable !== isEIP6963ProviderAvailableNext) {
      setState(prevState => ({
        ...prevState,
        isEIP6963ProviderAvailable: isEIP6963ProviderAvailableNext,
      }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerList])

  const isEIP6963ProviderAvailableSync = () => {
    return providerList.length > 0
  }

  const connectWallet = async (): Promise<string> => {
    const { provider } = state

    return await connectWalletEIP1193(provider)
  }

  const switchNetwork = async (chainId = 0x5afe) => {
    const { provider } = state

    return switchNetworkEIP1193(chainId, provider)
  }

  const addTokenToWallet = async (wRoseContractAddress: string) => {
    const { provider } = state

    return addTokenToWalletEIP1193(wRoseContractAddress, provider)
  }

  const setCurrentProviderByRdns = (rdns: string) => {
    const { provider } = state

    provider.setCurrentProvider(rdns)
  }

  const getCurrentProvider = () => {
    const { provider } = state

    return provider.currentProviderDetail?.provider
  }

  const providerState: EIP6963ProviderContext = {
    state,
    isEIP6963ProviderAvailableSync,
    connectWallet,
    switchNetwork,
    addTokenToWallet,
    setCurrentProviderByRdns,
    getCurrentProvider,
  }

  return <EIP6963Context.Provider value={providerState}>{children}</EIP6963Context.Provider>
}
