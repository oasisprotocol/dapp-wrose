import { FC, FormEvent, MouseEvent, useEffect, useState } from 'react'
import { Input } from '../Input'
import classes from './index.module.css'
import { Button } from '../Button'
import { utils } from 'ethers'
import { Alert } from '../Alert'
import { useNavigate } from 'react-router-dom'
import { ToggleButton } from '../ToggleButton'
import { useWrapForm } from '../../hooks/useWrapForm'
import { WrapFormType } from '../../utils/types'

const AMOUNT_PATTERN = '^[0-9]*[.,]?[0-9]*$'

interface WrapFormLabels {
  firstInputLabel: string
  secondInputLabel: string
  submitBtnLabel: string
}

const labelMapByFormType: Record<WrapFormType, WrapFormLabels> = {
  [WrapFormType.WRAP]: {
    firstInputLabel: 'ROSE',
    secondInputLabel: 'wROSE',
    submitBtnLabel: 'Wrap tokens',
  },
  [WrapFormType.UNWRAP]: {
    firstInputLabel: 'wROSE',
    secondInputLabel: 'ROSE',
    submitBtnLabel: 'Unwrap tokens',
  },
}

export const WrapForm: FC = () => {
  const navigate = useNavigate()
  const {
    state: { formType, amount, isLoading },
    toggleFormType,
    submit,
  } = useWrapForm()
  const { firstInputLabel, secondInputLabel, submitBtnLabel } = labelMapByFormType[formType]
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    const formattedAmount = amount ? utils.formatEther(amount) : ''

    setValue(formattedAmount)
  }, [setValue, amount])

  const handleValueChange = (amount: string) => {
    setValue(amount)
  }

  const handleToggleFormType = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleFormType(value ? utils.parseUnits(value, 'ether') : null)
  }

  const handleFormSubmit = async (e: FormEvent) => {
    setError('')
    e.preventDefault()

    try {
      const amountBN = utils.parseUnits(value || '0', 'ether')
      const txReceipt = await submit(amountBN)

      navigate(`/tx/${txReceipt.hash}?amount=${value}&action=${formType}`)
    } catch (ex) {
      setError((ex as Error)?.message || JSON.stringify(ex))
    }
  }

  return (
    <div>
      <form className={classes.wrapForm} onSubmit={handleFormSubmit}>
        <div className={classes.wrapFormInputs}>
          <Input<string>
            disabled={isLoading}
            type="text"
            label={firstInputLabel}
            pattern={AMOUNT_PATTERN}
            placeholder="0"
            inputMode="decimal"
            value={value}
            valueChange={handleValueChange}
          />
          <Input<string>
            disabled={isLoading}
            type="text"
            label={secondInputLabel}
            pattern={AMOUNT_PATTERN}
            placeholder="0"
            inputMode="decimal"
            value={value}
            valueChange={handleValueChange}
          />
          <ToggleButton className={classes.toggleBtn} onClick={handleToggleFormType} disabled={isLoading} />
        </div>

        <Button disabled={isLoading} type="submit" fullWidth>
          {submitBtnLabel}
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
      </form>
    </div>
  )
}
