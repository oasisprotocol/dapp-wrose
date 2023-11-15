import { BigNumber } from 'ethers'

export abstract class BigNumberUtils {
  static getPercentageAmount(amount: BigNumber, percentage: BigNumber) {
    return amount.mul(percentage).div(100);
  }
}
