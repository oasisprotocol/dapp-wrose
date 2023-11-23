import classes from './index.module.css'
import { FC, PropsWithChildren } from 'react'

type AlertVariant = 'danger' | 'warn' | 'info'

interface Props extends PropsWithChildren {
  variant?: AlertVariant
}

const variantMap: Record<AlertVariant, string> = {
  danger: classes.alertDanger,
  warn: classes.alertWarn,
  info: classes.alertInfo,
}

export const Alert: FC<Props> = ({ children, variant = 'info' }) => (
  <p className={[classes.alert, variantMap[variant]].join(' ')}>{children}</p>
)
