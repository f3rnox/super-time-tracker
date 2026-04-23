import { getPluralizedArrayLength } from '../../utils'

describe('utils:get_pluralized_array_length', () => {
  it('returns a singular label if the array has only 1 item', () => {
    const resultA = getPluralizedArrayLength(['a'], 'entry')
    const resultB = getPluralizedArrayLength(['a'], 'day')
    const resultC = getPluralizedArrayLength(['a'], 'time')

    expect(resultA).toBe('1 entry')
    expect(resultB).toBe('1 day')
    expect(resultC).toBe('1 time')
  })

  it('returns a plural label if the array has more than one item', () => {
    const resultA = getPluralizedArrayLength(['a', 'b'], 'entry')
    const resultB = getPluralizedArrayLength(['a', 'b'], 'day')
    const resultC = getPluralizedArrayLength(['a', 'b'], 'time')

    expect(resultA).toBe('2 entries')
    expect(resultB).toBe('2 days')
    expect(resultC).toBe('2 times')
  })

  it('handles plural labels', () => {
    const resultA = getPluralizedArrayLength(['a', 'b'], 'entries')
    const resultB = getPluralizedArrayLength(['a', 'b'], 'days')
    const resultC = getPluralizedArrayLength(['a', 'b'], 'times')

    expect(resultA).toBe('2 entries')
    expect(resultB).toBe('2 days')
    expect(resultC).toBe('2 times')
  })
})
