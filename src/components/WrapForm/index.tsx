import { FC, FormEvent, useEffect, useState } from 'react'
import { Input } from '../Input'
import classes from './index.module.css'
import { Button } from '../Button'
import { useWrapForm, WrapFormType } from '../../providers/WrapFormProvider'
import { utils } from 'ethers'
import { Alert } from '../Alert'
import { useNavigate } from 'react-router-dom'
import { CachedIcon } from '../icons/CachedIcon'
import { ToggleButton } from '../ToggleButton'

const AMOUNT_PATTERN = '^[0-9]*[.,]?[0-9]*$'

interface WrapFormLabels {
  firstInputLabel: string;
  secondInputLabel: string;
  submitBtnLabel: string;
}

const labelMapByFormType: Record<WrapFormType, WrapFormLabels> = {
  [WrapFormType.WRAP]: {
    firstInputLabel: 'ROSE',
    secondInputLabel: 'WROSE',
    submitBtnLabel: 'Wrap tokens',
  },
  [WrapFormType.UNWRAP]: {
    firstInputLabel: 'WROSE',
    secondInputLabel: 'ROSE',
    submitBtnLabel: 'Unwrap tokens',
  },
}

export const WrapForm: FC = () => {
  const navigate = useNavigate()
  const { state: { formType, amount, isLoading }, toggleFormType, submit } = useWrapForm()
  const {
    firstInputLabel,
    secondInputLabel,
    submitBtnLabel,
  } = labelMapByFormType[formType]
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const formattedAmount = amount ? utils.formatEther(amount) : ''

    setValue(formattedAmount)
  }, [setValue, amount])

  const handleValueChange = (amount: string) => {
    setValue(amount)
  }

  const handleToggleFormType = (e) => {
    e.preventDefault()
    e.stopPropagation()

    toggleFormType()
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const amountBN = utils.parseUnits(value, 'ether')
      const txReceipt = await submit(amountBN)

      navigate(`/tx/${txReceipt.hash}`)
    } catch (ex) {
      setError(ex?.message || JSON.stringify(ex))
    }
  }

  return (
    <div>
      <form className={classes.wrapForm} onSubmit={handleFormSubmit}>
        <div className={classes.wrapFormInputs}>
          <Input<string> disabled={isLoading} type='text' label={firstInputLabel} pattern={AMOUNT_PATTERN}
                         placeholder='0'
                         value={value} valueChange={handleValueChange} />
          <Input<string> disabled={isLoading} type='text' label={secondInputLabel} pattern={AMOUNT_PATTERN}
                         placeholder='0'
                         value={value} valueChange={handleValueChange} />
          <ToggleButton className={classes.toggleBtn} onClick={handleToggleFormType} disabled={isLoading} />
        </div>

        {/*This is hardcoded for now, as are gas prices*/}
        <h4 className={classes.gasEstimateLabel}>Estimated fee: &lt;0.01 ROSE (~10 sec)</h4>

        <Button disabled={isLoading} type='submit' fullWidth>{submitBtnLabel}</Button>
        {error && <Alert variant='danger'>{error}</Alert>}
      </form>
    </div>
  )
}
