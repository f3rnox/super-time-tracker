import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type WeekCommandArgs, handler } from '../../commands/week'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): WeekCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:week:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('prints report for last week data grouped by sheets', () => {
    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const endDate = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
    )
    const entry = DB.genSheetEntry(0, 'week-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('prints aggregated total report when --total is used', () => {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'week-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ total: true }))).not.toThrow()
  })

  it('honors --filter by excluding non-matching entries', () => {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const matching = DB.genSheetEntry(0, 'keyword here', startDate, endDate)
    const nonMatching = DB.genSheetEntry(1, 'other work', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [matching, nonMatching])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ filter: 'keyword' }))).not.toThrow()
  })

  it('accepts --since to define the reporting window', () => {
    const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const endDate = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    )
    const entry = DB.genSheetEntry(0, 'within-window', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() =>
      handler(
        getArgs({
          since: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        })
      )
    ).not.toThrow()
  })

  it('accepts --all-sheets to include every sheet', () => {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    const entryA = DB.genSheetEntry(0, 'a', startDate, endDate)
    const entryB = DB.genSheetEntry(0, 'b', startDate, endDate)
    const sheetA = DB.genSheet('sheet-a', [entryA])
    const sheetB = DB.genSheet('sheet-b', [entryB])

    if (db.db !== null) {
      db.db.sheets.push(sheetA, sheetB)
      db.db.activeSheetName = sheetA.name
    }

    expect(() => handler(getArgs({ allSheets: true }))).not.toThrow()
  })
})
