import { FC, useEffect, useState } from 'react'
import classes from './index.module.css'
import { Button } from '../../components/Button'
import { UnknownNetworkError } from '../../utils/errors'
import { Alert } from '../../components/Alert'
import { METAMASK_HOME_PAGE } from '../../constants/config'
import { useWeb3 } from '../../hooks/useWeb3'
import { WalletModal } from '../../components/WalletModal'
import { ProviderType } from '../../providers/Web3Context.ts'
import { useEIP6963 } from '../../hooks/useEIP6963.ts'
import { useEIP1193 } from '../../hooks/useEIP1193.ts'

export const ConnectWallet: FC = () => {
  const {
    state: { isEIP6963ProviderAvailable },
  } = useEIP6963()
  const { isEIP1193ProviderAvailable } = useEIP1193()
  const {
    state: { providerType },
    connectWallet,
    switchNetwork,
    isProviderAvailable,
  } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [providerAvailable, setProviderAvailable] = useState(true)
  const [isUnknownNetwork, setIsUnknownNetwork] = useState(false)

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      setProviderAvailable(await isProviderAvailable())
      setIsLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const setAvailable = async () => {
      setProviderAvailable((await isEIP1193ProviderAvailable()) || isEIP6963ProviderAvailable)
    }

    setAvailable()
  }, [isEIP1193ProviderAvailable, isEIP6963ProviderAvailable])

  const handleProviderConnectionType = () => {
    // This is async version of EIP-6963
    if (isEIP6963ProviderAvailable) {
      setIsWalletModalOpen(true)

      return
    }

    handleConnectWallet(ProviderType.EIP1193)
  }

  const handleConnectWallet = async (walletProviderType: ProviderType = providerType) => {
    setIsWalletModalOpen(false)

    setIsLoading(true)
    try {
      await connectWallet(walletProviderType)
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

  const handleSwitchNetwork = async () => {
    setIsLoading(true)
    try {
      await switchNetwork()
      setIsUnknownNetwork(false)
    } catch (ex) {
      setError((ex as Error)?.message || JSON.stringify(ex))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!providerAvailable && (
        <div>
          <p className={classes.subHeader}>
            Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
            <br />
            MetaMask not detected, please install it.
          </p>

          <a href={METAMASK_HOME_PAGE} target={'_blank'} rel={'noopener noreferrer'}>
            <Button className={classes.installMetaMaskBtn} fullWidth disabled={isLoading}>
              Install MetaMask
            </Button>
          </a>
          <Button
            variant="secondary"
            onClick={() => setProviderAvailable(true)}
            disabled={isLoading}
            fullWidth
          >
            Skip
          </Button>
        </div>
      )}
      {providerAvailable && (
        <>
          {!isUnknownNetwork && (
            <div>
              <p className={classes.subHeader}>
                Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
                <br />
                Please connect your wallet to get started.
              </p>

              <Button onClick={handleProviderConnectionType} disabled={isLoading} fullWidth>
                Connect wallet
              </Button>
              {error && <Alert variant="danger">{error}</Alert>}
            </div>
          )}
          {isUnknownNetwork && (
            <div>
              <p className={classes.subHeader}>
                Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
                <br />
                Please switch to another network to get started.
              </p>

              <Button onClick={handleSwitchNetwork} disabled={isLoading} fullWidth>
                Switch Network
              </Button>
              {error && <Alert variant="danger">{error}</Alert>}
            </div>
          )}
        </>
      )}
      <WalletModal
        isOpen={isWalletModalOpen}
        closeModal={() => setIsWalletModalOpen(false)}
        next={() => handleConnectWallet(ProviderType.EIP6963)}
      />
    </>
  )
}
