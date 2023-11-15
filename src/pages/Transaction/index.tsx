import { FC, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { useWeb3 } from '../../providers/Web3Provider'
import { Constants } from '../../utils/constants'
import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon'
import { utils } from 'ethers'
import classes from './index.module.css'

enum TransactionStatus {
  Loading,
  Success,
  Fail
}

export const Transaction: FC = () => {
  const navigate = useNavigate()
  const { txHash } = useParams()
  const { getTransaction } = useWeb3()
  const [status, setStatus] = useState(TransactionStatus.Loading)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    const init = async () => {
      if (!txHash) {
        navigate('/')
      }

      try {
        const tx = await getTransaction(txHash!)

        if (tx.value.gt(0)) {
          setAmount(utils.formatEther(tx.value))
        }

        setStatus(TransactionStatus.Success)
      } catch (ex) {
        setStatus(TransactionStatus.Fail)
      }
    }

    init()
  }, [getTransaction, txHash])

  const handleNavigateToExplorer = () => {
    window.open(`${Constants.EXPLORER_SAPPHIRE_TESTNET_TX_URL}${txHash}`, '_blank', 'noopener,noreferrer')
  }

  const handleNavigateBack = () => {
    navigate('/wrapper')
  }


  return (<>
      {status === TransactionStatus.Loading && (<div>
          <p className={classes.subHeader}>
            Wrapping your tokens...
          </p>

          <Button className={classes.openInExplorerBtn} variant='secondary' onClick={handleNavigateToExplorer}
                  fullWidth>
            View on explorer
            <OpenInNewIcon />
          </Button>
        </div>
      )}
      {status === TransactionStatus.Success && (<div>
          <p className={classes.subHeader}>
            Congrats!
            <br />
            You now own &nbsp;
            {amount && (<span>{amount} WROSE</span>)}
            {!amount && (<span>ROSE</span>)}
          </p>

          <Button onClick={handleNavigateBack}
                  fullWidth>
            Close
          </Button>
        </div>
      )}
      {status === TransactionStatus.Fail && (<div>
          <p className={classes.subHeader}>
            There was an unexpected error.
            Please try again.
          </p>

          <Button onClick={handleNavigateBack}
                  fullWidth>
            Retry
          </Button>
        </div>
      )}
    </>
  )
}
