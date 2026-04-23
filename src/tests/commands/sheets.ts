import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { getYesterday } from '../../dates'
import { type SheetsCommandArgs, handler } from '../../commands/sheets'

const db = getTestDB()
const getArgs = (overrides?: Record<string, unknown>): SheetsCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:sheets:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if no sheets exist', () => {
    if (db.db == null) {
      throw new Error('Test DB is null')
    }

    db.db.sheets = []

    expect(() => handler(getArgs())).toThrow('No time sheets exist')
  }, 10000)

  it('throws an error if combining --today and --yesterday', () => {
    expect(() => handler(getArgs({ today: true, yesterday: true }))).toThrow(
      'Cannot combine --since, --today, and --yesterday'
    )
  })

  it('lists sheets with yesterday activity via --yesterday', () => {
    const yesterday = getYesterday()
    const startDate = new Date(+yesterday - 60 * 60 * 1000)
    const endDate = new Date(+yesterday + 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'task', startDate, endDate)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ yesterday: true }))).not.toThrow()
  })

  it('throws an error if filter matches no sheets', () => {
    const entry = DB.genSheetEntry(0, 'task', new Date(), new Date())
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ filter: 'nonexistent' }))).toThrow(
      'No sheets match filter'
    )
  })

  it('accepts --concise without throwing', () => {
    const entry = DB.genSheetEntry(0, 'task', new Date(), new Date())
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ concise: true }))).not.toThrow()
  })
})
