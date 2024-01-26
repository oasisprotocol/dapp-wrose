import classes from './index.module.css'
import { HTMLInputTypeAttribute, PropsWithChildren, useId } from 'react'

type InputGroupVariant = 'light' | 'dark'

const inputGroupVariantMap: Record<InputGroupVariant, string> = {
  light: classes.inputGroupLight,
  dark: classes.inputGroupDark,
}

interface Props<T> extends PropsWithChildren {
  type: HTMLInputTypeAttribute
  label: string
  variant?: InputGroupVariant
  pattern?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  className?: string
  value: T
  valueChange?: (value: T) => void
}

export const Input = <T extends string | number | readonly string[]>({
  type,
  label,
  variant = 'light',
  pattern,
  placeholder,
  id,
  disabled,
  inputMode,
  className,
  value,
  valueChange,
}: Props<T>) => {
  const uniqueId = useId()
  const inputId = id || uniqueId

  return (
    <div
      className={[
        classes.inputGroup,
        inputGroupVariantMap[variant],
        ...[disabled ? [classes.inputGroupDisabled] : []],
        ...[className ? [className] : []],
      ].join(' ')}
    >
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        autoComplete="off"
        autoCorrect="off"
        pattern={pattern}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={({ target: { value } }) => valueChange?.(value as T)}
      />
    </div>
  )
}
