import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type TodayCommandArgs, handler } from '../../commands/today'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): TodayCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:today:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when no entries exist for today', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'old-entry', twoDaysAgo, yesterday)
    const sheet = DB.genSheet('test-sheet', [entry])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).toThrow('No entries for today')
  })

  it('prints summary and sheets when entries exist for today', () => {
    const startedToday = new Date(Date.now() - 20 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'today-entry', startedToday)
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('honors --filter to exclude non-matching entries', () => {
    const startedToday = new Date(Date.now() - 20 * 60 * 1000)
    const entryA = DB.genSheetEntry(0, 'review pr', startedToday)
    const entryB = DB.genSheetEntry(1, 'write docs', new Date())
    const sheet = DB.genSheet('test-sheet', [entryA, entryB], entryA.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ filter: 'docs' }))).not.toThrow()
    expect(() => handler(getArgs({ filter: 'nonexistent' }))).toThrow(
      'No entries for today'
    )
  })

  it('accepts --concise without throwing', () => {
    const startedToday = new Date(Date.now() - 10 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'focus work', startedToday)
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ concise: true }))).not.toThrow()
  })
})
