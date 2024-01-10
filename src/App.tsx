import { FC } from 'react'
import { Layout } from './components/Layout'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Wrapper } from './pages/Wrapper'
import { Web3ContextProvider } from './providers/Web3Provider'
import { ConnectWallet } from './pages/ConnectWallet'
import { WrapFormContextProvider } from './providers/WrapFormProvider'
import { Transaction } from './pages/Transaction'
import { WalletConnectContextProvider } from './providers/WalletConnectProvider'
import { createWeb3Modal, defaultConfig, useWeb3ModalTheme } from '@web3modal/ethers5/react'
import {
  NETWORKS,
  WALLET_CONNECT_METADATA,
  WALLET_CONNECT_PROJECT_ID,
  WALLET_CONNECT_SAPPHIRE_CHAIN,
  WALLET_CONNECT_SAPPHIRE_TESTNET_CHAIN,
} from './constants/config'

const { chainId: sapphireChainId } = WALLET_CONNECT_SAPPHIRE_CHAIN
const { chainId: sapphireTestnetChainId } = WALLET_CONNECT_SAPPHIRE_TESTNET_CHAIN

// createWeb3Modal should be called outside any React component to avoid unwanted re-renders
createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: WALLET_CONNECT_METADATA,
    defaultChainId: sapphireChainId,
    enableEIP6963: true,
    enableCoinbase: false,
    enableInjected: false,
  }),
  chains: [WALLET_CONNECT_SAPPHIRE_CHAIN, WALLET_CONNECT_SAPPHIRE_TESTNET_CHAIN],
  projectId: WALLET_CONNECT_PROJECT_ID,
  tokens: {
    [sapphireChainId]: {
      address: NETWORKS[sapphireChainId].wRoseContractAddress,
    },
    [sapphireTestnetChainId]: {
      address: NETWORKS[sapphireTestnetChainId].wRoseContractAddress,
    },
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // Metamask
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Brave
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393' // Phantom
  ],
  /*includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // Metamask
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Brave
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393' // Phantom
  ]*/
})

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <ConnectWallet />,
      },
      {
        path: 'wrapper',
        element: (
          <WrapFormContextProvider>
            <Wrapper />
          </WrapFormContextProvider>
        ),
      },
      {
        path: 'tx/:txHash',
        element: <Transaction />,
      },
    ],
  },
])

export const App: FC = () => {
  const { setThemeMode, setThemeVariables } = useWeb3ModalTheme()

  setThemeMode('light')

  setThemeVariables({
    '--w3m-color-mix': '#3333c4',
    '--w3m-color-mix-strength': 15,
    '--w3m-accent': '#0092f6',
  })

  return (
    <WalletConnectContextProvider>
      <Web3ContextProvider>
        <RouterProvider router={router} />
      </Web3ContextProvider>
    </WalletConnectContextProvider>
  )
}
