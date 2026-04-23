import { isPlural } from '../../utils'

describe('utils:is_plural', () => {
  it('returns true if the string is plural', () => {
    expect(isPlural('entries')).toBe(true)
    expect(isPlural('days')).toBe(true)
  })

  it('returns false if the string is not plural', () => {
    expect(isPlural('entry')).toBe(false)
    expect(isPlural('day')).toBe(false)
  })
})
