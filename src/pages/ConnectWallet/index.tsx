import { FC, useState } from 'react'
import classes from './index.module.css'
import { useWeb3 } from '../../providers/Web3Provider'
import { Button } from '../../components/Button'

export const ConnectWallet: FC = () => {
  const { connectWallet } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectWallet = async () => {
    setIsLoading(true)
    try {
      await connectWallet()
    } catch (ex) {
      console.error(ex)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <p className={classes.subHeader}>
        Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
        <br />
        Please connect your wallet to get started.
      </p>

      <Button onClick={handleConnectWallet} disabled={isLoading} fullWidth>Connect wallet</Button>
    </div>
  )
}
