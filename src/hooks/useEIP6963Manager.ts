import { useContext } from 'react'
import { EIP6963ManagerContext } from '../providers/EIP6963ManagerContext.ts'

export const useEIP6963Manager = () => {
  const value = useContext(EIP6963ManagerContext)
  if (Object.keys(value).length === 0) {
    throw new Error('[useEIP6963Manager] Component not wrapped within a Provider')
  }

  return value
}
