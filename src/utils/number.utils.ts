import { BigNumber, utils } from 'ethers'

export abstract class NumberUtils {
  static getPercentageAmount(amount: BigNumber, percentage: BigNumber) {
    return amount.mul(percentage).div(100)
  }

  /**
   * Helper to round eth amount to 4 decimals
   * @param amount
   */
  static getTruncatedAmount(amount: BigNumber) {
    const remainder = amount.mod(1e14)
    return utils.formatEther(amount.sub(remainder))
  }

  // Compatible with https://github.com/MetaMask/metamask-extension/blob/v10.7.0/ui/helpers/utils/icon-factory.js#L84-L88
  static jsNumberForAddress(address: string) {
    const addr = address.slice(2, 10)
    return parseInt(addr, 16)
  }
}
