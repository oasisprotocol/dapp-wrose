import { FC, FormEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { Input } from '../Input'
import classes from './index.module.css'
import { Button } from '../Button'
import { BigNumber, utils } from 'ethers'
import { Alert } from '../Alert'
import { useNavigate } from 'react-router-dom'
import { ToggleButton } from '../ToggleButton'
import { useWrapForm } from '../../hooks/useWrapForm'
import { WrapFormType } from '../../utils/types'
import { useInterval } from '../../hooks/useInterval'
import { NumberUtils } from '../../utils/number.utils'
import { WrapFeeWarningModal } from '../WrapFeeWarningModal'

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
    state: { formType, amount, isLoading, balance, estimatedFee },
    toggleFormType,
    submit,
    debounceLeadingSetFeeAmount,
  } = useWrapForm()
  const { firstInputLabel, secondInputLabel, submitBtnLabel } = labelMapByFormType[formType]
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isWrapFeeModalOpen, setIsWrapFeeModalOpen] = useState(false)
  const debouncedSetFeeAmount = useRef(debounceLeadingSetFeeAmount())

  useEffect(() => {
    // Trigger fee calculation on value change
    debouncedSetFeeAmount.current()
  }, [value])

  useInterval(() => {
    // Trigger fee calculation every minute, in case fee data becomes stale
    debouncedSetFeeAmount.current()
  }, 60000)

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

  const submitTransaction = async (amount: BigNumber) => {
    try {
      const txReceipt = await submit(amount)

      navigate(`/tx/${txReceipt.hash}?amount=${value}&action=${formType}`)
    } catch (ex) {
      setError((ex as Error)?.message || JSON.stringify(ex))
    }
  }

  const handleFormSubmit = async (e: FormEvent) => {
    setError('')
    e.preventDefault()

    const amount = utils.parseUnits(value || '0', 'ether')

    if (
      formType === WrapFormType.WRAP &&
      NumberUtils.shouldShowWrapFeeWarningModal({
        fee: estimatedFee,
        amount,
        accountBalanceAmount: balance,
      })
    ) {
      setIsWrapFeeModalOpen(true)
    } else {
      submitTransaction(amount)
    }
  }

  const submitWrapFeeModal = (amount: BigNumber) => {
    submitTransaction(amount)
    setIsWrapFeeModalOpen(false)
  }

  const estimatedFeeTruncated =
    estimatedFee && estimatedFee.gt(0) ? `~${NumberUtils.getTruncatedAmount(estimatedFee)} ROSE` : '/'

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

        <h4 className={classes.gasEstimateLabel}>Estimated fee: {estimatedFeeTruncated}</h4>

        <Button disabled={isLoading} type="submit" fullWidth>
          {submitBtnLabel}
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
      </form>
      <WrapFeeWarningModal
        isOpen={isWrapFeeModalOpen}
        closeModal={() => setIsWrapFeeModalOpen(false)}
        next={submitWrapFeeModal}
      />
    </div>
  )
}
