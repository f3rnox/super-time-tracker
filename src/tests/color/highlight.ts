import isAnsi from 'is-ansi'

import { clHighlight } from '../../color'

const { CI } = process.env

describe('color:highlight', () => {
  it.skipIf(CI)('colors the provided string', () => {
    expect(isAnsi(clHighlight('Some text'))).toBe(true)
  })
})
