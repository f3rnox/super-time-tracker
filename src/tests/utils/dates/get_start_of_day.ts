import { getStartOfDay } from '../../../dates'

describe('utils:dates:get_start_of_day', () => {
  it('returns a date set to the start of the provided date', () => {
    const date = new Date()
    const result = getStartOfDay(date)

    expect(result.getFullYear()).toBe(date.getFullYear())
    expect(result.getMonth()).toBe(date.getMonth())
    expect(result.getDay()).toBe(date.getDay())
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })
})
