import { BigNumber } from 'ethers'

export abstract class NumberUtils {
  static getPercentageAmount(amount: BigNumber, percentage: BigNumber) {
    return amount.mul(percentage).div(100);
  }

  // Compatible with https://github.com/MetaMask/metamask-extension/blob/v10.7.0/ui/helpers/utils/icon-factory.js#L84-L88
  static jsNumberForAddress(address: string) {
    const addr = address.slice(2, 10);
    return parseInt(addr, 16);
  }
}
