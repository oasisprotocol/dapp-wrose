interface NetworkConfiguration {
  wRoseContractAddress: string
  explorerBaseUrl: string
  networkName: string
}

export const NETWORKS: Record<number, NetworkConfiguration> = {
  23294: {
    wRoseContractAddress: '0x8Bc2B030b299964eEfb5e1e0b36991352E56D2D3',
    explorerBaseUrl: 'https://explorer.oasis.io/mainnet/sapphire',
    networkName: 'Sapphire',
  },
  23295: {
    wRoseContractAddress: '0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94',
    explorerBaseUrl: 'https://explorer.oasis.io/testnet/sapphire',
    networkName: 'Sapphire Testnet',
  },
}

export const MAX_GAS_LIMIT = 100000

export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

export const WALLET_CONNECT_METADATA = {
  name: 'ROSE (un)wrapper',
  description:
    'Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.',
  url: 'http://wrose.oasis.io/',
  icons: ['https://wrose.oasis.io/icon.svg'],
}
export const WALLET_CONNECT_SAPPHIRE_CHAIN = {
  chainId: 23294,
  name: 'Sapphire',
  currency: 'ROSE',
  explorerUrl: 'https://explorer.oasis.io/mainnet/sapphire',
  rpcUrl: 'https://sapphire.oasis.io',
}

export const WALLET_CONNECT_SAPPHIRE_TESTNET_CHAIN = {
  chainId: 23295,
  name: 'Sapphire Testnet',
  currency: 'ROSE',
  explorerUrl: 'https://explorer.oasis.io/testnet/sapphire',
  rpcUrl: 'https://testnet.sapphire.oasis.dev',
}
