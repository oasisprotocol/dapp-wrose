export class UnknownNetworkError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export interface MetaMaskError extends Error {
  code: number
}
