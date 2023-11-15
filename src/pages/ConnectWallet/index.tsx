import { FC, useState } from 'react'
import classes from './index.module.css'
import { useWeb3 } from '../../providers/Web3Provider'
import { Button } from '../../components/Button'
import { UnknownNetworkError } from '../../utils/errors'
import { Alert } from '../../components/Alert'

export const ConnectWallet: FC = () => {
  const { connectWallet, switchNetwork } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnknownNetwork, setIsUnknownNetwork] = useState(false)

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

  return (
    <>
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
    </>
  )
}