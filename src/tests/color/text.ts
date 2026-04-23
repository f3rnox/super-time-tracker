import isAnsi from 'is-ansi'

import { clText } from '../../color'

const { CI } = process.env

describe('color:text', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clText('some value'))).toBe(true)
  })
})
