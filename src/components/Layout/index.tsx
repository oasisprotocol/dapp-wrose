import { FC, PropsWithChildren, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import classes from './index.module.css'
import { useWeb3 } from '../../providers/Web3Provider'

export const Layout: FC<PropsWithChildren> = () => {
  const { state: { isConnected } } = useWeb3()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // TODO: Unable to use hooks inside loader in react-router-dom
  useEffect(() => {
    // Route guard
    if (!isConnected && pathname !== '/') {
      navigate('/')
    } else if (isConnected && pathname === '/') {
      navigate('/wrapper')
    }
  }, [isConnected, pathname, navigate])

  return (
    <div className={classes.layout}>
      <h2 className={classes.header}>ROSE (un) wrapper</h2>
      <Outlet />
    </div>
  )
}
