import { isConsonant } from 'consonant'

import isPlural from './is_plural'

const getPluralizedArrayLength = (value: unknown[], input: string): string => {
  if (input.length < 2) {
    throw new Error('Label must be at least 2 characters long')
  }

  const label = input.endsWith('s') ? input.slice(0, -1) : input

  if (value.length <= 1 || isPlural(label)) {
    return `${value.length} ${label}`
  }

  const lastChar = label.at(-1)
  const secondToLastChar = label.at(-2)

  let labelSuffix = ''
  let trimLastChar = false

  if (lastChar === 'y' && isConsonant(secondToLastChar)) {
    labelSuffix = 'ies'
    trimLastChar = true
  } else if (
    (lastChar === 'y' &&
      'aeiou'.includes(secondToLastChar?.toLowerCase() ?? '')) ||
    lastChar !== 'y'
  ) {
    labelSuffix = 's'
  }

  const finalLabel = trimLastChar
    ? label.substring(0, label.length - 1) + labelSuffix
    : label + labelSuffix

  return `${value.length} ${finalLabel}`
}

export default getPluralizedArrayLength
