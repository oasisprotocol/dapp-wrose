import { expect, test } from 'vitest'
import { utils } from 'ethers'
import { NumberUtils } from '../number.utils.ts'
import { MAX_GAS_LIMIT } from '../../constants/config.ts'

const { shouldShowWrapFeeWarningModal } = NumberUtils

const gasPrice = utils.parseUnits('100', 'gwei')
const fee = gasPrice.mul(MAX_GAS_LIMIT)

test('should show modal if user can not afford future transactions', () => {
  const amount = utils.parseEther('9.99')
  const accountBalanceAmount = utils.parseEther('10')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(true)
})

test('should skip modal if user can not afford to retain fees for future transactions', () => {
  const amount = utils.parseEther('0.02')
  const accountBalanceAmount = utils.parseEther('0.02')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})

test('should skip modal if user can already afford future transactions', () => {
  const amount = utils.parseEther('20')
  const accountBalanceAmount = utils.parseEther('40')

  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})

test('should skip modal if wrapping tiny amounts', () => {
  const amount = utils.parseEther('0.02')
  const accountBalanceAmount = utils.parseEther('10')
  const show = shouldShowWrapFeeWarningModal({ fee, amount, accountBalanceAmount })

  expect(show).toEqual(false)
})
