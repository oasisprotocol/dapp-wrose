import { FC, useState } from 'react'
import classes from './index.module.css'
import { Button } from '../../components/Button'
import { UnknownNetworkError } from '../../utils/errors'
import { Alert } from '../../components/Alert'
import { AuthData, login, register } from '../../utils/authzn'
import { useWeb3 } from '../../hooks/useWeb3'

enum AuthType {
  Login,
  Register,
}

export const ConnectWallet: FC = () => {
  const { connectWallet } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnknownNetwork, setIsUnknownNetwork] = useState(false)

  const handleConnectWallet = async (type: AuthType) => {
    setIsLoading(true)
    try {
      let authData: AuthData

      if (type === AuthType.Register) {
        authData = await register()
      } else {
        authData = await login()
      }

      await connectWallet(authData)
    } catch (ex) {
      if (ex instanceof UnknownNetworkError) {
        setIsUnknownNetwork(true)
      } else {
        setError((ex as Error)?.message || JSON.stringify(ex))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isUnknownNetwork && (
        <div>
          <p className={classes.subHeader}>
            Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
            <br />
            Please connect with your AUTHZN account to get started.
          </p>

          <Button onClick={() => handleConnectWallet(AuthType.Login)} disabled={isLoading} fullWidth>
            Login
          </Button>
          <p className={classes.haveAccount}>Not signed up yet?</p>
          <Button
            variant="secondary"
            onClick={() => handleConnectWallet(AuthType.Register)}
            disabled={isLoading}
            fullWidth
          >
            Register
          </Button>
          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      )}
    </>
  )
}
