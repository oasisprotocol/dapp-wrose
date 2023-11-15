import { FC, useEffect, useState } from 'react'
import classes from './index.module.css'
import { BigNumber, utils } from 'ethers'
import { Button } from '../../components/Button'
import { BigNumberUtils } from '../../utils/big-number.utils'
import { WrapForm } from '../../components/WrapForm'
import { useWrapForm, WrapFormType } from '../../providers/WrapFormProvider'
import { Alert } from '../../components/Alert'

interface PercentageEntry {
  value: BigNumber;
  label: string;
}

const percentageList: PercentageEntry[] = [{
  label: '10%',
  value: BigNumber.from(10),
}, {
  label: '25%',
  value: BigNumber.from(25),
}, {
  label: '50%',
  value: BigNumber.from(50),
}, {
  label: 'Max',
  value: BigNumber.from(100),
}]

export const Wrapper: FC = () => {
  const { state: { isLoading, balance, wRoseBalance, formType }, init, setAmount } = useWrapForm()
  const [warn, setWarn] = useState('')

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePercentageCalc = (percentage: BigNumber) => {
    setWarn('')

    if (formType === WrapFormType.WRAP) {
      if (percentage.eq(100)) {
        /* In case of 100% WRAP, deduct hardcoded gas fee */
        setAmount(BigNumberUtils.getPercentageAmount(balance, percentage) - utils.parseUnits('0.01', 'ether'))
        setWarn('You are about to convert all your gas fee paying tokens into WROSE, are you sure?')
      } else {
        setAmount(BigNumberUtils.getPercentageAmount(balance, percentage))
      }
    } else if (formType === WrapFormType.UNWRAP) {
      setAmount(BigNumberUtils.getPercentageAmount(wRoseBalance, percentage))
    } else {
      throw new Error('[formType] Invalid form type')
    }
  }

  return (
    <div>
      <p className={classes.subHeader}>
        Quickly wrap your ROSE into wROSE and vice versa with the (un)wrap ROSE tool.
      </p>

      <div className={classes.amountPercList}>
        {percentageList.map(({ label, value }) => (
          <Button disabled={isLoading} onClick={() => handlePercentageCalc(value)} key={label}
                  variant='tertiary'>{label}</Button>
        ))}
      </div>

      <WrapForm />

      {warn && <Alert variant='danger'>
        {warn}
      </Alert>}
    </div>
  )
}
