import { EIP1193Provider, EIP6963ProviderDetail } from './types.ts'

export abstract class EIPUtils {
  static isEIP1193Provider(value: Partial<EIP1193Provider>): value is EIP1193Provider {
    return !!(value.request && value.on && value.removeListener)
  }

  static isEIP6963Provider = (value: Partial<EIP6963ProviderDetail>): value is EIP6963ProviderDetail => {
    const { provider, info } = value
    const { name, uuid, rdns, icon } = info || {}

    const providerExist = !!(provider && EIPUtils.isEIP1193Provider(provider))
    const infoExist = !!(info && name && uuid && rdns && icon)

    return providerExist && infoExist
  }
}
