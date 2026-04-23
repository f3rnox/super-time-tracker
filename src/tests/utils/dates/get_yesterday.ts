import { getDaysMS, getYesterday } from '../../../dates'

describe('utils:dates:get_yesterday', () => {
  it('returns a date set to yesterday', () => {
    const expectedDate = new Date(Date.now() - getDaysMS(1))
    const result = getYesterday()

    expect(Math.abs(+result - +expectedDate)).toBeLessThanOrEqual(100)
  })
})
