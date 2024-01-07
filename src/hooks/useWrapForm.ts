import { useContext } from 'react'
import { WrapFormContext } from '../providers/WrapFormContext'

export const useWrapForm = () => {
  const value = useContext(WrapFormContext)
  if (value === undefined) {
    throw new Error('[useWrapForm] Component not wrapped within a Provider')
  }

  return value
}
