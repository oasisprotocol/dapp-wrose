import { useContext } from 'react'
import { WalletConnectContext } from '../providers/WalletConnectContext'

export const useWalletConnect = () => {
  const value = useContext(WalletConnectContext)
  if (value === undefined) {
    throw new Error('[useWalletConnect] Component not wrapped within a Provider')
  }

  return value
}
