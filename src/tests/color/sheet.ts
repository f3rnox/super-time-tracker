import isAnsi from 'is-ansi'

import { clSheet } from '../../color'

const { CI } = process.env

describe('color:sheet', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clSheet('name'))).toBe(true)
  })
})
