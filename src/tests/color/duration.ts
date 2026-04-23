import isAnsi from 'is-ansi'

import { clDuration } from '../../color'

const { CI } = process.env

describe('color:duration', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clDuration('10000'))).toBe(true)
  })

  it.skipIf(CI)('accepts numeric values', () => {
    expect(isAnsi(clDuration(42))).toBe(true)
  })
})
