import classes from './index.module.css'
import { FC, MouseEventHandler, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

interface Props extends PropsWithChildren {
  disabled?: boolean
  variant?: ButtonVariant
  fullWidth?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  type?: 'submit' | 'reset' | 'button'
}

const variantMap: Record<ButtonVariant, string> = {
  primary: classes.buttonPrimary,
  secondary: classes.buttonSecondary,
  tertiary: classes.buttonTertiary,
}

export const Button: FC<Props> = ({
  className,
  children,
  disabled,
  variant = 'primary',
  fullWidth,
  onClick,
  type,
}) => (
  <button
    className={[
      className,
      classes.button,
      ...(disabled ? [classes.buttonDisabled] : []),
      ...(fullWidth ? [classes.fullWidth] : []),
      variantMap[variant],
    ].join(' ')}
    onClick={onClick}
    disabled={disabled}
    type={type}
  >
    {children}
  </button>
)
