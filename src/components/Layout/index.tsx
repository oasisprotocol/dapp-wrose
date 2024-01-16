import { FC, PropsWithChildren, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import classes from './index.module.css'
import { Account } from '../Account'
import { LogoIcon } from '../icons/LogoIcon'
import { useWeb3 } from '../../hooks/useWeb3'

const githubLink = 'https://github.com/oasisprotocol/dapp-wrose/'

export const Layout: FC<PropsWithChildren> = () => {
  const {
    state: { isConnected, account, networkName },
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
    <div className={classes.layout}>
      <main className={classes.main}>
        <div>
          {isConnected && account && <Account address={account} networkName={networkName ?? ''} />}
          <h2 className={classes.header}>
            ROSE <LogoIcon /> wrapper
          </h2>
          <Outlet />
        </div>
      </main>
      <footer className={classes.footer}>
        <>
          {import.meta.env.VITE_REACT_APP_BUILD_VERSION && import.meta.env.VITE_REACT_APP_BUILD_DATETIME && (
            <div className={classes.buildInfo}>
              Version:{' '}
              <a
                href={`${githubLink}commit/${import.meta.env.VITE_REACT_APP_BUILD_VERSION}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {import.meta.env.VITE_REACT_APP_BUILD_VERSION.substring(0, 7)}
              </a>{' '}
              built at{' '}
              {new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }).format(Number(import.meta.env.VITE_REACT_APP_BUILD_DATETIME))}
            </div>
          )}
          <a href={githubLink} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
        </>
      </footer>
    </div>
  )
}
