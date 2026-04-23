import isAnsi from 'is-ansi'

import { clID } from '../../color'

const { CI } = process.env

describe('color:id', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clID('id'))).toBe(true)
  })

  it.skipIf(CI)('accepts numeric values', () => {
    expect(isAnsi(clID(42))).toBe(true)
  })
})
