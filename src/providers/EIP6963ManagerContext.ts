import { createContext } from 'react'
import { EIP6963ProviderDetail } from '../utils/types.ts'

export interface EIP6963ManagerProviderState {
  providerList: EIP6963ProviderDetail[]
}

export interface EIP6963ManagerProviderContext {
  readonly state: EIP6963ManagerProviderState
}

type MutableInjectedProviderMap = Map<string, EIP6963ProviderDetail>

export const EIP6963_MANAGER_INJECTED_PROVIDERS_MAP: MutableInjectedProviderMap = new Map()

export const EIP6963ManagerContext = createContext<EIP6963ManagerProviderContext>(
  {} as EIP6963ManagerProviderContext,
)
