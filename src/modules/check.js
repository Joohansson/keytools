/*!
 * nanocurrency-js: A toolkit for the Nano cryptocurrency.
 * Copyright (c) 2019 Marvin ROGER <dev at marvinroger dot fr>
 * Licensed under GPL-3.0 (https://git.io/vAZsK)
 */
import BigNumber from 'bignumber.js'

const MIN_INDEX = 0
const MAX_INDEX = Math.pow(2, 32) - 1
const MAX_AMOUNT = new BigNumber('0xffffffffffffffffffffffffffffffff')

/** @hidden */
export function checkString(candidate: {}): boolean {
  return typeof candidate === 'string'
}

/** @hidden */
export function checkNumber(candidate: {}): boolean {
  if (!checkString(candidate)) return false
  if (
    String(candidate).startsWith('.') ||
    String(candidate).endsWith('.')
  )
    return false

  const numberWithoutDot = String(candidate).replace('.', '')
  // more than one '.'
  if (String(candidate).length - numberWithoutDot.length > 1) return false
  for (const char of numberWithoutDot) {
    if (char < '0' || char > '9') return false
  }

  return true
}
