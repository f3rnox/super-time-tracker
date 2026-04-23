import { getEndOfDay } from '../../../dates'

describe('utils:dates:get_end_of_day', () => {
  it('returns a date set to the end of the provided date', () => {
    const date = new Date()
    const result = getEndOfDay(date)

    expect(result.getFullYear()).toBe(date.getFullYear())
    expect(result.getMonth()).toBe(date.getMonth())
    expect(result.getDay()).toBe(date.getDay())
    expect(result.getHours()).toBe(23)
    expect(result.getMinutes()).toBe(59)
    expect(result.getSeconds()).toBe(59)
    expect(result.getMilliseconds()).toBe(999)
  })
})
