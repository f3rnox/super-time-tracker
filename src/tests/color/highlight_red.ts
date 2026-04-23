import isAnsi from 'is-ansi'

import { clHighlightRed } from '../../color'

const { CI } = process.env

describe('color:highlight_red', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clHighlightRed('Some text'))).toBe(true)
  })
})
