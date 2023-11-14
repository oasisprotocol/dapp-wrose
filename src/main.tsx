import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import { Web3ContextProvider } from './providers/Web3Provider'

createRoot(document.getElementById('root')!).render(
  <Web3ContextProvider>
    <App />
  </Web3ContextProvider>,
)
