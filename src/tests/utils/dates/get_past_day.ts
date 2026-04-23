import { getDaysMS, getPastDay } from '../../../dates'

describe('utils:dates:get_past_day', () => {
  it('returns a date set to the start of the provided date', () => {
    const targetDate = new Date(Date.now() - getDaysMS(2))
    const result = getPastDay(2)

    expect(Math.abs(+result - +targetDate)).toBeLessThanOrEqual(100)
  })

  it('returns yesterday if called with no arguments', () => {
    const targetDate = new Date(Date.now() - getDaysMS(1))
    const result = getPastDay()

    expect(Math.abs(+result - +targetDate)).toBeLessThanOrEqual(100)
  })
})
