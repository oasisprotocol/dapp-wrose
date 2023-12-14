import { FC, useEffect } from 'react'
import classes from './index.module.css'
import { BigNumber } from 'ethers'
import { Button } from '../../components/Button'
import { NumberUtils } from '../../utils/number.utils'
import { WrapForm } from '../../components/WrapForm'
import { useWeb3 } from '../../hooks/useWeb3'
import { useWrapForm } from '../../hooks/useWrapForm'
import { WrapFormType } from '../../utils/types'

interface PercentageEntry {
  value: BigNumber
  label: string
}

const percentageList: PercentageEntry[] = [
  {
    label: '10%',
    value: BigNumber.from(10),
  },
  {
    label: '25%',
    value: BigNumber.from(25),
  },
  {
    label: '50%',
    value: BigNumber.from(50),
  },
  {
    label: 'Max',
    value: BigNumber.from(100),
  },
]

export const Wrapper: FC = () => {
  const {
    state: { account },
    addTokenToWallet,
  } = useWeb3()
  const {
    state: { isLoading, balance, wRoseBalance, formType },
    init,
    setAmount,
    paddedFeeReservation,
  } = useWrapForm()

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const handlePercentageCalc = (percentage: BigNumber) => {
    if (formType === WrapFormType.WRAP) {
      if (percentage.eq(100)) {
        /* In case of 100% WRAP, deduct hardcoded gas fee */
        const percAmount = NumberUtils.getPercentageAmount(balance, percentage)
        setAmount(percAmount.sub(paddedFeeReservation()))
      } else {
        setAmount(NumberUtils.getPercentageAmount(balance, percentage))
      }
    } else if (formType === WrapFormType.UNWRAP) {
      setAmount(NumberUtils.getPercentageAmount(wRoseBalance, percentage))
    } else {
      throw new Error('[formType] Invalid form type')
    }
  }

  return (
    <div>
      <div className={classes.subHeader}>
        <p>Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.</p>

        <Button className={classes.importWRoseBtn} onClick={addTokenToWallet}>
          Import WROSE to Wallet
        </Button>
      </div>

      <div className={classes.amountPercList}>
        {percentageList.map(({ label, value }) => (
          <Button
            disabled={isLoading}
            onClick={() => handlePercentageCalc(value)}
            key={label}
            variant="tertiary"
          >
            {label}
          </Button>
        ))}
      </div>

      <WrapForm />
    </div>
  )
}
