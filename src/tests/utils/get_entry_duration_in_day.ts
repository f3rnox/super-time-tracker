import { type TimeSheetEntry } from '../../types'
import { getEntryDurationInDay } from '../../utils'
import {
  getDaysMS,
  getHoursMS,
  getPastDay,
  getFutureDay,
  getStartOfDay
} from '../../dates'

const YESTERDAY = getStartOfDay(getPastDay(1))
const YESTERDAY_MS = +YESTERDAY

describe('utils:get_entry_duration_in_day', () => {
  it('returns 0 if entry starts and ends prior to the provided day', () => {
    const entry = {
      end: getPastDay(6),
      start: getPastDay(7)
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(duration).toBe(0)
  })

  it('returns 0 if entry starts and ends after the provided day', () => {
    const entry = {
      end: getFutureDay(6),
      start: getFutureDay(7)
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(duration).toBe(0)
  })

  it('returns correct duration if start is within the day and end is null', () => {
    const entry = {
      end: null,
      start: new Date(YESTERDAY_MS + getHoursMS(12))
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(Math.abs(duration - getHoursMS(12))).toBeLessThanOrEqual(1)
  })

  it('returns correct duration if start is prior to day and end is null', () => {
    const entry = {
      end: null,
      start: new Date(YESTERDAY_MS - getDaysMS(1))
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(Math.abs(duration - getDaysMS(1))).toBeLessThanOrEqual(1)
  })

  it('returns correct duration if start is prior to day and end is within day', () => {
    const entry = {
      end: new Date(YESTERDAY_MS + getHoursMS(12)),
      start: new Date(YESTERDAY_MS - getDaysMS(2))
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(Math.abs(duration - getHoursMS(12))).toBeLessThanOrEqual(1)
  })

  it('returns correct duration if start is within day and end is null', () => {
    const entry = {
      end: null,
      start: new Date(YESTERDAY_MS + getHoursMS(12))
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(Math.abs(duration - getHoursMS(12))).toBeLessThanOrEqual(1)
  })

  it('returns correct duration if both start and end are within day', () => {
    const entry = {
      end: new Date(YESTERDAY_MS + getHoursMS(12)),
      start: new Date(YESTERDAY_MS + getHoursMS(4))
    } as TimeSheetEntry

    const duration = getEntryDurationInDay(entry, YESTERDAY)

    expect(Math.abs(duration - getHoursMS(8))).toBeLessThanOrEqual(1)
  })
})
