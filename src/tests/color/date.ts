import isAnsi from 'is-ansi'

import { clDate } from '../../color'

const { CI } = process.env

describe('color:date', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clDate('2018-01-01'))).toBe(true)
  })

  it.skipIf(CI)('accepts numeric timestamps', () => {
    expect(isAnsi(clDate(Date.now()))).toBe(true)
  })

  it.skipIf(CI)('accepts date objects', () => {
    expect(isAnsi(clDate(new Date()))).toBe(true)
  })
})
