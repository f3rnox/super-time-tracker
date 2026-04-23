import _last from 'lodash/last'
import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type TimeSheetEntry } from '../../types'
import { type ResumeCommandArgs, handler } from '../../commands/resume'

const db = getTestDB()
const getArgs = (overrides?: Record<string, unknown>): ResumeCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:resume:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if there is no active sheet', async () => {
    if (db.db !== null) {
      db.db.activeSheetName = null
    }

    const p = handler(getArgs())

    await expect(p).rejects.toThrow('No active sheet')
  }, 10000)

  it('throws an error if there is no recent entry for the active sheet', async () => {
    const sheet = DB.genSheet('test-sheet')
    const { name: sheetName } = sheet

    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    db.db.sheets.push(sheet)
    db.db.activeSheetName = sheetName

    const p = handler(getArgs())

    await expect(p).rejects.toThrow(`No entries found in sheet ${sheetName}`)
  }, 10000)

  it('throws an error if the active sheet already has a running entry', async () => {
    const entryA = DB.genSheetEntry(
      0,
      'test-a',
      new Date(Date.now() - 20000),
      new Date(Date.now() - 10000)
    )

    const entryB = DB.genSheetEntry(0, 'test-b', new Date())
    const sheet = DB.genSheet('test-sheet', [entryA, entryB], entryB.id)
    const { name: sheetName } = sheet

    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    db.db.sheets.push(sheet)
    db.db.activeSheetName = sheetName

    const p = handler(getArgs())

    await expect(p).rejects.toThrow(
      `Sheet ${sheetName} already has an active entry (${entryB.id}: ${entryB.description})`
    )
  }, 10000)

  it('creates a new entry with the same description as the most recently ended entry and adds it to the sheet', async () => {
    const entryA = DB.genSheetEntry(0, 'test-a', new Date(), new Date())
    const entryB = DB.genSheetEntry(
      0,
      'test-b',
      new Date(Date.now() + 1000),
      new Date(Date.now() + 100000)
    )
    const sheet = DB.genSheet('test-sheet', [entryA, entryB])
    const { name: sheetName } = sheet

    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    db.db.sheets.push(sheet)
    db.db.activeSheetName = sheetName

    await handler(getArgs())

    const { activeEntryID } = sheet
    const newEntry = _last(sheet.entries) as unknown as TimeSheetEntry

    expect(activeEntryID).toBe(newEntry.id)
    expect(newEntry.description).toBe(entryB.description)
    expect(Math.abs(+newEntry.start - Date.now())).toBeLessThanOrEqual(1000)
    expect(newEntry.end).toBeNull()
  }, 10000)

  it('resumes a specific entry selected by --entry', async () => {
    const entryA = DB.genSheetEntry(
      0,
      'older',
      new Date(Date.now() - 10000),
      new Date(Date.now() - 9000)
    )
    const entryB = DB.genSheetEntry(
      1,
      'newer',
      new Date(Date.now() - 5000),
      new Date(Date.now() - 4000)
    )
    const sheet = DB.genSheet('test-sheet', [entryA, entryB])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await handler(getArgs({ entry: 0 }))

    const newEntry = _last(sheet.entries) as unknown as TimeSheetEntry

    expect(newEntry.description).toBe('older')
  }, 10000)

  it('resumes on a specific sheet selected by --sheet', async () => {
    const activeSheet = DB.genSheet('active-sheet')
    const targetEntry = DB.genSheetEntry(
      0,
      'target',
      new Date(Date.now() - 60000),
      new Date(Date.now() - 30000)
    )
    const targetSheet = DB.genSheet('target-sheet', [targetEntry])

    if (db.db !== null) {
      db.db.sheets.push(activeSheet, targetSheet)
      db.db.activeSheetName = activeSheet.name
    }

    await handler(getArgs({ sheet: 'target-sheet' }))

    const newEntry = _last(targetSheet.entries) as unknown as TimeSheetEntry

    expect(targetSheet.activeEntryID).toBe(newEntry.id)
    expect(newEntry.description).toBe('target')
    expect(activeSheet.activeEntryID).toBeNull()
  }, 10000)

  it('overrides description, tags, and start time when provided', async () => {
    const original = DB.genSheetEntry(
      0,
      'original',
      new Date(Date.now() - 60000),
      new Date(Date.now() - 30000)
    )
    const sheet = DB.genSheet('test-sheet', [original])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const atDate = new Date(Date.now() - 120000)

    await handler(
      getArgs({
        at: atDate.toISOString(),
        description: ['fresh', 'context'],
        tags: ['@overridden']
      })
    )

    const newEntry = _last(sheet.entries) as unknown as TimeSheetEntry

    expect(newEntry.description).toBe('fresh context')
    expect(newEntry.tags).toEqual(['@overridden'])
    expect(+newEntry.start).toBe(+atDate)
  }, 10000)
})
