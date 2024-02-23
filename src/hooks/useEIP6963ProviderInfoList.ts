import { useEIP6963Manager } from './useEIP6963Manager.ts'
import { EIP6963ProviderInfo } from '../utils/types.ts'

export const useEIP6963ProviderInfoList = (): EIP6963ProviderInfo[] => {
  const {
    state: { providerList },
  } = useEIP6963Manager()

  return providerList.map(({ info }) => info)
}
