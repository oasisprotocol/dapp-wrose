import { FC, PropsWithChildren, useEffect, useState } from 'react'
import {
  EIP6963_MANAGER_INJECTED_PROVIDERS_MAP,
  EIP6963ManagerContext,
  EIP6963ManagerProviderContext,
  EIP6963ManagerProviderState,
} from './EIP6963ManagerContext.ts'
import { EIP6963AnnounceProviderEvent, EIP6963Event } from '../utils/types.ts'
import { EIPUtils } from '../utils/eip.utils.ts'

interface CustomEventMap {
  [EIP6963Event.ANNOUNCE_PROVIDER]: CustomEvent<EIP6963AnnounceProviderEvent>
}

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void

    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void
  }
}

const eip6963ManagerProviderInitialState: EIP6963ManagerProviderState = {
  providerList: [],
}

export const EIP6963ManagerContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<EIP6963ManagerProviderState>({
    ...eip6963ManagerProviderInitialState,
  })

  const _onAnnounceProvider: EIP6963AnnounceProviderEvent = event => {
    if (!EIPUtils.isEIP6963Provider(event.detail)) {
      return
    }

    const { detail } = event

    // Ignore duplicated providers with same rdns
    const providerDetails = EIP6963_MANAGER_INJECTED_PROVIDERS_MAP.get(detail.info.rdns!)
    if (providerDetails) {
      if (providerDetails.provider !== detail.provider) {
        console.warn(`Duplicate provider detected for wallet with rdns: ${detail.info.rdns}!`)
      }
      return
    }

    EIP6963_MANAGER_INJECTED_PROVIDERS_MAP.set(detail.info.rdns!, detail)

    setState(prevState => ({
      ...prevState,
      providerList: [...prevState.providerList, detail],
    }))
  }

  useEffect(() => {
    window.addEventListener(EIP6963Event.ANNOUNCE_PROVIDER, _onAnnounceProvider as EventListener)
    window.dispatchEvent(new Event(EIP6963Event.REQUEST_PROVIDER))
  }, [])

  const providerState: EIP6963ManagerProviderContext = {
    state,
  }

  return <EIP6963ManagerContext.Provider value={providerState}>{children}</EIP6963ManagerContext.Provider>
}
