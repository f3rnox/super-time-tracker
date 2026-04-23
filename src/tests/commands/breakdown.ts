import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import DB from '../../db'
import { printJustifiedContent } from '../../print'
import getTestDB from '../get_test_db'
import { getStartOfDay, getYesterday } from '../../dates'
import { type BreakdownCommandArgs, handler } from '../../commands/breakdown'

vi.mock('../../log', () => ({
  default: vi.fn()
}))

vi.mock('../../print', () => ({
  printJustifiedContent: vi.fn()
}))

const db = getTestDB()
const yargsStub = { showHelp: vi.fn() } as unknown as Argv

const getArgs = (overrides?: Record<string, unknown>): BreakdownCommandArgs => {
  if (overrides === undefined) {
    return {
      db,
      yargs: yargsStub
    }
  }

  return {
    db,
    yargs: yargsStub,
    ...overrides
  }
}

describe('commands:breakdown:handler', () => {
  beforeEach(async () => {
    await db.load()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when no entries match the selected period', () => {
    const oldStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const oldEndDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'old-entry', oldStartDate, oldEndDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

    expect(() => handler(getArgs({ since: tomorrow.toISOString() }))).toThrow(
      'No results found'
    )
  })

  it('prints breakdowns by day, weekday and hour for matching entries', () => {
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'active-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('handles very long entries without timing out', () => {
    const now = Date.now()
    const startDate = new Date(now - 5 * 365 * 24 * 60 * 60 * 1000)
    const endDate = new Date(now - 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'very-long-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const startMs = Date.now()

    expect(() => handler(getArgs())).not.toThrow()
    expect(Date.now() - startMs).toBeLessThan(2000)
  })

  it('does not print zero-duration rows for malformed open-ended entries', () => {
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const entry = DB.genSheetEntry(
      0,
      'open-entry-with-undefined-end',
      startDate,
      null
    )
    const sheet = DB.genSheet('test-sheet', [entry])
    ;(sheet.entries[0] as unknown as { end: Date | null | undefined }).end =
      undefined

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const printMock = vi.mocked(printJustifiedContent)

    expect(() => handler(getArgs())).not.toThrow()
    expect(printMock).toHaveBeenCalled()
    expect(printMock.mock.calls[0][0].some((row) => row.includes('0:00'))).toBe(
      false
    )
  })

  it('throws when combining --today and --yesterday', () => {
    expect(() => handler(getArgs({ today: true, yesterday: true }))).toThrow(
      'Cannot combine --since, --today, and --yesterday'
    )
  })

  it('uses --today to limit the window to the start of today', () => {
    const beforeToday = new Date(+getStartOfDay() - 60 * 60 * 1000)
    const oldEntry = DB.genSheetEntry(
      0,
      'before',
      beforeToday,
      new Date(+beforeToday + 30 * 60 * 1000)
    )
    const todayStart = new Date(+getStartOfDay() + 60 * 60 * 1000)
    const todayEnd = new Date(+todayStart + 60 * 60 * 1000)
    const todayEntry = DB.genSheetEntry(1, 'today', todayStart, todayEnd)
    const sheet = DB.genSheet('test-sheet', [oldEntry, todayEntry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ today: true }))).not.toThrow()
  })

  it('uses --yesterday to limit the window to yesterday', () => {
    const yesterday = getYesterday()
    const startDate = new Date(+yesterday - 60 * 60 * 1000)
    const endDate = new Date(+yesterday + 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'yesterday', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ yesterday: true }))).not.toThrow()
  })

  it('applies --filter to drop non-matching entries', () => {
    const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 60 * 60 * 1000)
    const matching = DB.genSheetEntry(0, 'match here', startDate, endDate)
    const nonMatching = DB.genSheetEntry(1, 'other', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [matching, nonMatching])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ filter: 'nonexistent-term' }))).toThrow(
      'No results found'
    )
    expect(() => handler(getArgs({ filter: 'match' }))).not.toThrow()
  })
})
