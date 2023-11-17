import { FC, useEffect, useState } from 'react'
import classes from './index.module.css'
import { useWeb3 } from '../../providers/Web3Provider'
import { Button } from '../../components/Button'
import { UnknownNetworkError } from '../../utils/errors'
import { Alert } from '../../components/Alert'
import { METAMASK_HOME_PAGE } from '../../constants/config'

export const ConnectWallet: FC = () => {
  const { connectWallet, switchNetwork, isMetaMaskInstalled } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasMetaMaskWallet, setHasMetaMaskWallet] = useState(true)
  const [isUnknownNetwork, setIsUnknownNetwork] = useState(false)

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      setHasMetaMaskWallet(await isMetaMaskInstalled())
      setIsLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.ethereum])

  const handleConnectWallet = async () => {
    setIsLoading(true)
    try {
      await connectWallet()
    } catch (ex) {
      if (ex instanceof UnknownNetworkError) {
        setIsUnknownNetwork(true)
      } else {
        setError(ex?.message || JSON.stringify(ex))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchNetwork = async () => {
    setIsLoading(true)
    try {
      await switchNetwork()
      setIsUnknownNetwork(false)
    } catch (ex) {
      setError(ex?.message || JSON.stringify(ex))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstallMetaMask = async () => {
    window.open(METAMASK_HOME_PAGE, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {!hasMetaMaskWallet && (<div>
        <p className={classes.subHeader}>
          Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
          <br />
          MetaMask not detect, please install it.
        </p>

        <Button className={classes.installMetaMaskBtn} onClick={handleInstallMetaMask} fullWidth disabled={isLoading}>
          Install MetaMask
        </Button>
        <Button variant='secondary' onClick={() => setHasMetaMaskWallet(true)} disabled={isLoading}
                fullWidth>
          Skip
        </Button>
      </div>)}
      {hasMetaMaskWallet && (<>
        {!isUnknownNetwork && (<div>
          <p className={classes.subHeader}>
            Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
            <br />
            Please connect your wallet to get started.
          </p>

          <Button onClick={handleConnectWallet} disabled={isLoading} fullWidth>Connect wallet</Button>
          {error && <Alert variant='danger'>{error}</Alert>}
        </div>)}
        {isUnknownNetwork && (<div>
          <p className={classes.subHeader}>
            Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
            <br />
            Please switch to another network to get started.
          </p>

          <Button onClick={handleSwitchNetwork} disabled={isLoading} fullWidth>Switch Network</Button>
          {error && <Alert variant='danger'>{error}</Alert>}
        </div>)}
      </>)}
    </>
  )
}
