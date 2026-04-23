import { getDaysMS, getFutureDay } from '../../../dates'

describe('utils:dates:get_future_day', () => {
  it('returns a date set to the start of the provided date', () => {
    const targetDate = new Date(Date.now() + getDaysMS(2))
    const result = getFutureDay(2)

    expect(Math.abs(+result - +targetDate)).toBeLessThanOrEqual(100)
  })
})
