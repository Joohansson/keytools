/*!
 * nanocurrency-js: A toolkit for the Nano cryptocurrency.
 * Copyright (c) 2019 Marvin ROGER <dev at marvinroger dot fr>
 * Licensed under GPL-3.0 (https://git.io/vAZsK)
 */
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
