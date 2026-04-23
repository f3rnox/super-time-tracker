import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { getPastDay, getYesterday } from '../../dates'
import { type YesterdayCommandArgs, handler } from '../../commands/yesterday'

const db = getTestDB()

const getArgs = (
  overrides?: Record<string, unknown>
): YesterdayCommandArgs => ({
  db,
  yargs: Object.create(null) as Argv,
  ...(overrides ?? {})
})

describe('commands:yesterday:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when both --all and sheets are provided', () => {
    expect(() => handler(getArgs({ all: true, sheets: ['main'] }))).toThrow(
      'Cannot specify both --all and sheets'
    )
  })

  it('throws an error when no entries exist for yesterday', () => {
    if (db.db !== null) {
      db.db.sheets = [DB.genSheet('main')]
      db.db.activeSheetName = 'main'
    }

    expect(() => handler(getArgs())).toThrow('No entries for yesterday')
  })

  it('prints summary and sheets when entries exist for yesterday', () => {
    const yesterday = getYesterday()
    const startDate = new Date(+yesterday - 60 * 60 * 1000)
    const endDate = new Date(+yesterday + 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'yesterday-entry', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('throws when only today active entries exist', () => {
    const todayStart = new Date()
    const todayEntry = DB.genSheetEntry(0, 'today-entry', todayStart, null)
    const oldEntry = DB.genSheetEntry(
      1,
      'old-entry',
      getPastDay(5),
      getPastDay(4)
    )
    const sheet = DB.genSheet(
      'test-sheet',
      [oldEntry, todayEntry],
      todayEntry.id
    )

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).toThrow('No entries for yesterday')
  })

  it('filters entries by --filter', () => {
    const yesterday = getYesterday()
    const startDate = new Date(+yesterday - 60 * 60 * 1000)
    const endDate = new Date(+yesterday + 60 * 60 * 1000)
    const matching = DB.genSheetEntry(0, 'pair programming', startDate, endDate)
    const nonMatching = DB.genSheetEntry(1, 'admin', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [matching, nonMatching])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ filter: 'pair' }))).not.toThrow()
    expect(() => handler(getArgs({ filter: 'missing' }))).toThrow(
      'No entries for yesterday'
    )
  })
})
