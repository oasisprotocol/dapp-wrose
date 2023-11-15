import { FC, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useWeb3 } from '../../providers/Web3Provider'
import { Constants } from '../../utils/constants'
import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon'
import classes from './index.module.css'

enum TransactionStatus {
  Loading,
  Success,
  Fail
}

enum TransactionType {
  Rose,
  WRose
}

export const Transaction: FC = () => {
  const navigate = useNavigate()
  const { txHash } = useParams()
  const [searchParams] = useSearchParams()
  const amount = searchParams.get('amount') ?? null
  const { getTransaction } = useWeb3()
  const [status, setStatus] = useState(TransactionStatus.Loading)
  const [type, setType] = useState<TransactionType | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!txHash) {
        navigate('/')
      }

      try {
        const tx = await getTransaction(txHash!)

        if (tx.value.gt(0)) {
          setType(TransactionType.Rose)
        } else {
          setType(TransactionType.WRose)
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
            You now own
            {type === TransactionType.WRose && (<b>&nbsp;{amount} WROSE</b>)}
            {type === TransactionType.Rose && (<b>&nbsp;{amount} ROSE</b>)}
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
