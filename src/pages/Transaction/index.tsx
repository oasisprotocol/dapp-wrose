import { FC, useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { OpenInNewIcon } from '../../components/icons/OpenInNewIcon'
import classes from './index.module.css'
import { Spinner } from '../../components/Spinner'
import { StringUtils } from '../../utils/string.utils'
import { useWeb3 } from '../../hooks/useWeb3'
import { WrapFormType } from '../../utils/types'

enum TransactionStatus {
  Loading,
  Success,
  Fail,
}

enum TransactionType {
  Rose,
  WRose,
}

export const Transaction: FC = () => {
  const navigate = useNavigate()
  const { txHash } = useParams()
  const [searchParams] = useSearchParams()
  const amount = searchParams.get('amount') ?? null
  const action: WrapFormType = (searchParams.get('action') as WrapFormType) ?? WrapFormType.WRAP
  const {
    state: { explorerBaseUrl },
    getTransaction,
  } = useWeb3()
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
          setType(TransactionType.WRose)
        } else {
          setType(TransactionType.Rose)
        }

        setStatus(TransactionStatus.Success)
      } catch (ex) {
        setStatus(TransactionStatus.Fail)
      }
    }

    init()
  }, [getTransaction, navigate, txHash])

  const handleNavigateToExplorer = () => {
    if (explorerBaseUrl && txHash) {
      const txUrl = StringUtils.getTransactionUrl(explorerBaseUrl, txHash)
      window.open(txUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleNavigateBack = () => {
    navigate('/wrapper')
  }

  return (
    <>
      {status === TransactionStatus.Loading && (
        <div>
          <div className={classes.spinnerContainer}>
            <Spinner />
          </div>
          <h3 className={classes.subHeader}>
            {action === WrapFormType.WRAP && <>Wrapping</>}
            {action === WrapFormType.UNWRAP && <>Unwrapping</>}
            &nbsp;your tokens
          </h3>
        </div>
      )}
      {status === TransactionStatus.Success && (
        <div>
          <p className={classes.h100}>&#x1F389;</p>
          <h3 className={classes.subHeader}>
            Congrats!
            <br />
            You received
            {type === TransactionType.WRose && <b>&nbsp;{amount} WROSE</b>}
            {type === TransactionType.Rose && <b>&nbsp;{amount} ROSE</b>}
          </h3>

          {explorerBaseUrl && txHash && (
            <Button className={classes.openInExplorerBtn} onClick={handleNavigateToExplorer} fullWidth>
              View on explorer
              <OpenInNewIcon />
            </Button>
          )}
          <Button variant="secondary" onClick={handleNavigateBack} fullWidth>
            Close
          </Button>
        </div>
      )}
      {status === TransactionStatus.Fail && (
        <div>
          <p className={classes.h100}>&#x2755;</p>
          <h3 className={classes.subHeader}>
            There was an unexpected error.
            <br />
            Please try again.
          </h3>

          <Button onClick={handleNavigateBack} fullWidth>
            Retry
          </Button>
        </div>
      )}
    </>
  )
}
