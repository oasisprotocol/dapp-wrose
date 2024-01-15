import { FC } from 'react'
import { Modal, ModalProps } from '../Modal'
import { LogoIconRound } from '../icons/LogoIconRound.tsx'
import classes from './index.module.css'
import { Input } from '../Input'
import { WrapFeeWarningModalNext } from '../../utils/types.ts'
import { Button } from '../Button'

interface WrapFeeWarningModalProps extends Pick<ModalProps, 'isOpen' | 'closeModal'> {
  amount: string
  next: (param: WrapFeeWarningModalNext) => void
}

export const WrapFeeWarningModal: FC<WrapFeeWarningModalProps> = ({ isOpen, closeModal, amount, next }) => {
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
          Choose if you want to wrap the reduced amount and keep &#123;sum of 5 x gas fee - e.g. ‘
          <b>0.05 ROSE</b>’&#125; in your account, or continue with the full amount.
        </p>

        <Input<string>
          variant="dark"
          disabled
          type="text"
          label="wROSE"
          placeholder="0"
          inputMode="decimal"
          value={amount}
        />

        <div className={classes.wrapFeeWarningModalButtons}>
          <Button onClick={() => next(WrapFeeWarningModalNext.REDUCED_AMOUNT)}>Wrap reduced amount</Button>

          <a
            className={classes.wrapFeeWarningModalFullAmount}
            href={void 0}
            onClick={() => next(WrapFeeWarningModalNext.FULL_AMOUNT)}
          >
            Continue with full amount
          </a>
        </div>
      </div>
    </Modal>
  )
}
