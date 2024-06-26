import { useContext } from 'react'
import { EIP6963Context } from '../providers/EIP6963Context.ts'

export const useEIP6963 = () => {
  const value = useContext(EIP6963Context)
  if (Object.keys(value).length === 0) {
    throw new Error('[useEIP6963] Component not wrapped within a Provider')
  }

  return value
}
