import { expect, test } from 'vitest'
import { utils } from 'ethers'
import { NumberUtils } from '../number.utils.ts'
import { MAX_GAS_LIMIT } from '../../constants/config.ts'

const { shouldShowWrapFeeWarningModal } = NumberUtils

const gasPrice = utils.parseUnits('100', 'gwei')
const fee = gasPrice.mul(MAX_GAS_LIMIT)

test('should skip modal when account balance is less than retained fee', () => {
  const amount = utils.parseEther('0.02')
  const accountBalanceAmount = utils.parseEther('0.02')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})

test('should skip modal when amount is less than retained fee', () => {
  const amount = utils.parseEther('0.02')
  const accountBalanceAmount = utils.parseEther('10')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})

test('should show modal when amount plus retained fee is greater than account balance', () => {
  const amount = utils.parseEther('9.99')
  const accountBalanceAmount = utils.parseEther('10')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(true)
})

test('should skip modal when amount plus retained fee is less than account balance', () => {
  const amount = utils.parseEther('20')
  const accountBalanceAmount = utils.parseEther('40')

  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})
