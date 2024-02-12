import { FC } from 'react'
import { Modal, ModalProps } from '../Modal'
import { LogoIconRound } from '../icons/LogoIconRound.tsx'
import classes from './index.module.css'
import { Input } from '../Input'
import { Button } from '../Button'
import { useWrapForm } from '../../hooks/useWrapForm.ts'
import { WRAP_FEE_DEDUCTION_MULTIPLIER } from '../../constants/config.ts'
import { BigNumber, utils } from 'ethers'
import { NumberUtils } from '../../utils/number.utils.ts'

interface WrapFeeWarningModalProps extends Pick<ModalProps, 'isOpen' | 'closeModal'> {
  next: (amount: BigNumber) => void
}

export const WrapFeeWarningModal: FC<WrapFeeWarningModalProps> = ({ isOpen, closeModal, next }) => {
  const {
    state: { amount, estimatedFee },
  } = useWrapForm()
  const estimatedFeeDeduction = estimatedFee.mul(WRAP_FEE_DEDUCTION_MULTIPLIER)

  const roseAmount = NumberUtils.ensureNonNullBigNumber(amount)
  const estimatedAmountWithDeductedFees = roseAmount!.sub(estimatedFeeDeduction)

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} disableBackdropClick>
      <div className={classes.wrapFeeWarningModalContent}>
        <div className={classes.wrapFeeWarningModalLogo}>
          <LogoIconRound />
        </div>

        <h4>You have chosen to wrap your entire balance</h4>

        <p>
          It is recommended to keep a small amount in your wallet at all times to cover future transactions.
        </p>
        <p>
          Choose if you want to wrap the reduced amount and keep &#123;sum of {WRAP_FEE_DEDUCTION_MULTIPLIER}{' '}
          x gas fee - e.g. ‘<b>{utils.formatEther(estimatedFeeDeduction)} ROSE</b>’&#125; in your account, or
          continue with the full amount.
        </p>

        <Input<string>
          className={classes.wrapFeeWarningModalInput}
          variant="dark"
          disabled
          type="text"
          label="wROSE"
          placeholder="0"
          inputMode="decimal"
          value={utils.formatEther(estimatedAmountWithDeductedFees)}
        />

        <div className={classes.wrapFeeWarningModalActions}>
          <Button
            className={classes.wrapFeeWarningModalButton}
            onClick={() => next(estimatedAmountWithDeductedFees)}
          >
            <span className={classes.wrapFeeWarningModalButtonText}>Wrap reduced amount</span>
          </Button>

          <a className={classes.wrapFeeWarningModalFullAmount} href={void 0} onClick={() => next(amount!)}>
            Continue with full amount
          </a>
        </div>
      </div>
    </Modal>
  )
}
