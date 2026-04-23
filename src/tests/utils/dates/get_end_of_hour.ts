import { getEndOfHour } from '../../../dates'

describe('utils:dates:get_end_of_hour', () => {
  it('returns a date set to the end of the provided date hour', () => {
    const date = new Date()
    const hour = 2
    const result = getEndOfHour(hour, date)

    expect(result.getFullYear()).toBe(date.getFullYear())
    expect(result.getMonth()).toBe(date.getMonth())
    expect(result.getDay()).toBe(date.getDay())
    expect(result.getHours()).toBe(hour)
    expect(result.getMinutes()).toBe(59)
    expect(result.getSeconds()).toBe(59)
    expect(result.getMilliseconds()).toBe(999)
  })
})
