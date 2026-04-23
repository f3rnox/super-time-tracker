import { getDaysMS } from '../../../dates'

describe('utils:dates:get_days_ms', () => {
  it('returns correct values', () => {
    expect(getDaysMS(1)).toBe(86400000)
    expect(getDaysMS(2)).toBe(172800000)
  })
})
