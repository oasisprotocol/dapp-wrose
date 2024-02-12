import { BigNumber, utils } from 'ethers'
import { WRAP_FEE_DEDUCTION_MULTIPLIER } from '../constants/config.ts'

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

  static shouldShowWrapFeeWarningModal({
    fee,
    amount,
    accountBalanceAmount,
  }: {
    fee: BigNumber
    amount: BigNumber
    accountBalanceAmount: BigNumber
  }) {
    const multiplierDeductionFee = fee.mul(WRAP_FEE_DEDUCTION_MULTIPLIER)

    // Account balance should have enough amount left for fee retention to show modal
    // Edge case 0.051 - would only convert 0.001 if user confirms - same goes for the case bellow
    if (accountBalanceAmount.sub(multiplierDeductionFee).lte(0)) {
      return false
    }

    // Amount should be greater than fee retention to show modal
    if (amount.sub(multiplierDeductionFee).lte(0)) {
      return false
    }

    // Account balance has NOT enough amount left for future transactions
    return amount.add(multiplierDeductionFee).gt(accountBalanceAmount)
  }

  static ensureNonNullBigNumber(amount: BigNumber | null): BigNumber {
    if (!amount) {
      return BigNumber.from(0)
    }

    return amount
  }
}
