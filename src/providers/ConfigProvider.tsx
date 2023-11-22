import { createContext, FC, PropsWithChildren, useEffect, useState } from 'react'

export interface AppConfig {
  sapphireJsonRpc: string
  sapphireChainId: number
}

interface ConfigProviderState extends AppConfig {}

interface ConfigProviderContext {
  readonly state: ConfigProviderState
}

const configProviderInitialState: ConfigProviderState = {
  sapphireJsonRpc: '',
  sapphireChainId: -1,
}

export const ConfigContext = createContext<ConfigProviderContext>({} as ConfigProviderContext)

export const ConfigContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<ConfigProviderState>({
    ...configProviderInitialState,
  })

  useEffect(() => {
    const { VITE_SAPPHIRE_JSONRPC, VITE_SAPPHIRE_CHAIN_ID } = import.meta.env

    setState({
      sapphireJsonRpc: VITE_SAPPHIRE_JSONRPC,
      sapphireChainId: parseInt(VITE_SAPPHIRE_CHAIN_ID, 16),
    })
  }, [])

  const providerState: ConfigProviderContext = {
    state,
  }

  return <ConfigContext.Provider value={providerState}>{children}</ConfigContext.Provider>
}
