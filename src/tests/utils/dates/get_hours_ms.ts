import { getHoursMS } from '../../../dates'

describe('utils:dates:get_hours_ms', () => {
  it('returns correct values', () => {
    expect(getHoursMS(1)).toBe(3600000)
    expect(getHoursMS(2)).toBe(7200000)
  })
})
