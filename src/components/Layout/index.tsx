import { FC, PropsWithChildren, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import classes from './index.module.css'
import { Account } from '../Account'
import { LogoIcon } from '../icons/LogoIcon'
import { useWeb3 } from '../../hooks/useWeb3'
import { useWalletConnect } from '../../hooks/useWalletConnect'

export const Layout: FC<PropsWithChildren> = () => {
  const {
    state: { isConnected, address },
  } = useWalletConnect()
  const {
    state: { networkName },
  } = useWeb3()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // TODO: Unable to use hooks inside loader in react-router-dom, needs refactoring
  useEffect(() => {
    // Route guard
    // Ignore for tx
    if (pathname.startsWith('/tx')) {
      return
    }

    if (!isConnected && pathname !== '/') {
      navigate('/')
    } else if (isConnected && pathname === '/') {
      navigate('/wrapper')
    }
  }, [isConnected, pathname, navigate])

  return (
    <main className={classes.layout}>
      {isConnected && address && <Account address={address} networkName={networkName ?? ''} />}
      <h2 className={classes.header}>
        ROSE <LogoIcon /> wrapper
      </h2>
      <Outlet />
    </main>
  )
}
