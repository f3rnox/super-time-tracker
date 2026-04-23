import { type TimeSheetEntry } from '../../types'
import { getEntryDurationInHour } from '../../utils'
import { getFutureHour, getPastHour } from '../../dates'

describe('utils:get_entry_duration_in_hour', () => {
  it('returns 0 if entry starts and ends prior to the provided hour', () => {
    const date = new Date()
    const entry = {
      end: getPastHour(8),
      start: getPastHour(6)
    } as TimeSheetEntry

    const duration = getEntryDurationInHour(entry, date, 2)

    expect(duration).toBe(0)
  })

  it('returns 0 if entry starts and ends after the provided hour', () => {
    const date = new Date()
    const entry = {
      end: getFutureHour(6),
      start: getFutureHour(4)
    } as TimeSheetEntry

    const duration = getEntryDurationInHour(entry, date, 2)

    expect(duration).toBe(0)
  })
})
