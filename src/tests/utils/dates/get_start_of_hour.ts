import { getStartOfHour } from '../../../dates'

describe('utils:dates:get_start_of_hour', () => {
  it('returns a date set to the end of the provided date', () => {
    const date = new Date()
    const hour = 2
    const result = getStartOfHour(hour, date)

    expect(result.getFullYear()).toBe(date.getFullYear())
    expect(result.getMonth()).toBe(date.getMonth())
    expect(result.getDay()).toBe(date.getDay())
    expect(result.getHours()).toBe(hour)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })
})
