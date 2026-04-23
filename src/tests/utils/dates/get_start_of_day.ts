import { getStartOfDay } from '../../../dates'

describe('utils:dates:get_start_of_day', () => {
  it('returns a date set to the start of the provided date', () => {
    const date = new Date(2026, 3, 23, 9, 15, 30, 789)
    const result = getStartOfDay(date)

    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(3)
    expect(result.getDay()).toBe(4)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)

    expect(date.getHours()).toBe(9)
    expect(date.getMinutes()).toBe(15)
    expect(date.getSeconds()).toBe(30)
    expect(date.getMilliseconds()).toBe(789)
  })
})
