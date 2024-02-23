import { EIP1193Provider, EIP6963ProviderDetail } from './types.ts'
import { EIP6963_MANAGER_INJECTED_PROVIDERS_MAP } from '../providers/EIP6963ManagerContext.ts'

interface Listener<T = unknown> {
  (...args: T[]): void
}

export class EIP6963ClassProvider implements EIP1193Provider {
  currentProviderDetail?: EIP6963ProviderDetail

  // Stores stable references to prevent memory leaks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly proxyListeners: { [eventName: string | symbol]: Listener<any>[] } = {}

  request = async <T = object | unknown[], R = unknown>(args: { method: string; params?: T }): Promise<R> =>
    this.currentProviderDetail && this.currentProviderDetail.provider
      ? this.currentProviderDetail.provider.request<T, R>(args)
      : Promise.reject('Provider is undefined')

  on = <T = unknown>(eventName: string, listener: Listener<T>): this => {
    if (!this.proxyListeners[eventName]) {
      this.proxyListeners[eventName] = []
    }
    this.proxyListeners[eventName].push(listener)
    this.currentProviderDetail?.provider.on(eventName, listener)

    return this
  }

  removeListener = <T = unknown>(eventName: string | symbol, listener: Listener<T>): this => {
    this.currentProviderDetail?.provider.removeListener(eventName, listener)

    if (this.proxyListeners[eventName]) {
      const index = this.proxyListeners[eventName]?.indexOf(listener)
      if (index !== -1) {
        // proxyListeners must be referentially stable
        this.proxyListeners[eventName]?.splice(index, 1)
      }
    }

    return this
  }

  private transferListeners(
    eventName: string,
    newProvider?: EIP6963ProviderDetail,
    oldProvider?: EIP6963ProviderDetail,
  ): void {
    if (!eventName) return
    for (const proxyListener of this.proxyListeners[eventName]) {
      oldProvider?.provider.removeListener(eventName, proxyListener)
      newProvider?.provider.on(eventName, proxyListener)
    }
  }

  setCurrentProvider(rdns: string) {
    const oldProvider = this.currentProviderDetail
    const newProvider = (this.currentProviderDetail = EIP6963_MANAGER_INJECTED_PROVIDERS_MAP.get(rdns))

    for (const eventName in this.proxyListeners) {
      this.transferListeners(eventName, newProvider, oldProvider)
    }
  }
}
