export enum WrapFormType {
  WRAP = 'wrap',
  UNWRAP = 'unwrap',
}

export interface EIP1193Provider {
  request: <T = object | unknown[], R = unknown>(payload: { method: string; params?: T }) => Promise<R>
  on: <T = unknown>(eventName: string, callback: (...args: T[]) => void) => this
  removeListener: <T = unknown>(eventName: string | symbol, listener: (...args: T[]) => void) => this
}

export enum EIP6963Event {
  REQUEST_PROVIDER = 'eip6963:requestProvider',
  ANNOUNCE_PROVIDER = 'eip6963:announceProvider',
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns?: string
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

export interface EIP6963AnnounceProviderEvent {
  (evt: Event & { detail: EIP6963ProviderDetail }): void
}
