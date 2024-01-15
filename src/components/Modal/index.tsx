import { MouseEvent, FC, PropsWithChildren } from 'react'
import classes from './index.module.css'
import { TimesIcon } from '../icons/TimesIcon.tsx'

export interface ModalProps {
  isOpen: boolean
  disableBackdropClick?: boolean
  closeModal: (event?: MouseEvent<HTMLElement>) => void
}

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  isOpen,
  disableBackdropClick,
  closeModal,
}) => {
  if (!isOpen) {
    return null
  }

  const handleOverlayClick = () => {
    if (!disableBackdropClick) {
      closeModal()
    }
  }

  return (
    <div className={classes.modalOverlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <button className={classes.modalCloseButton} onClick={closeModal}>
          <TimesIcon />
        </button>
        <div className={classes.modalContent}>{children}</div>
      </div>
    </div>
  )
}
