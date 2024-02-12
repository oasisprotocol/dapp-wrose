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

export const METAMASK_HOME_PAGE = 'https://metamask.io/'

// Specifies multiplier when converting ROSE -> wROSE, so wallet has enough fees for future transactions
export const WRAP_FEE_DEDUCTION_MULTIPLIER = 5
