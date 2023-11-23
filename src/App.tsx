import { FC } from 'react'
import { Layout } from './components/Layout'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Wrapper } from './pages/Wrapper'
import { Web3ContextProvider } from './providers/Web3Provider'
import { ConnectWallet } from './pages/ConnectWallet'
import { WrapFormContextProvider } from './providers/WrapFormProvider'
import { Transaction } from './pages/Transaction'

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

export const App: FC = () => (
  <Web3ContextProvider>
    <RouterProvider router={router} />
  </Web3ContextProvider>
)
