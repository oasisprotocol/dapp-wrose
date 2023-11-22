import { FC } from 'react'
import classes from './index.module.css'

interface Props {
  className?: string
}

export const Spinner: FC<Props> = ({ className }) => (
  <div className={[classes.spinner, className].join(' ')} />
)
