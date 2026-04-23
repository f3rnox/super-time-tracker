import isAnsi from 'is-ansi'

import { clError } from '../../color'

const { CI } = process.env

describe('color:error', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clError('Some error'))).toBe(true)
  })

  it.skipIf(CI)('accepts error objects', () => {
    expect(isAnsi(clError(new Error('Some error')))).toBe(true)
  })
})
