import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type OutCommandArgs, handler } from '../../commands/out'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): OutCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:out:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when there is no active entry for the active sheet', async () => {
    const sheet = DB.genSheet('test-sheet')

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await expect(handler(getArgs())).rejects.toThrow(
      `No active entry for sheet ${sheet.name}`
    )
  })

  it('throws an error when active entry id is not present in the sheet', async () => {
    const sheet = DB.genSheet('test-sheet')
    sheet.activeEntryID = 7

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await expect(handler(getArgs())).rejects.toThrow(
      'Entry 7 not found in sheet test-sheet'
    )
  })

  it('checks out of the active entry with a parsed --at value', async () => {
    const startDate = new Date(Date.now() - 60 * 60 * 1000)
    const expectedEndDate = new Date(Date.now() - 30 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'test-entry', startDate)
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await expect(
      handler(
        getArgs({
          at: [expectedEndDate.toISOString()]
        })
      )
    ).resolves.toBeUndefined()

    expect(sheet.activeEntryID).toBeNull()
    expect(entry.end).not.toBeNull()
    expect(+(entry.end as Date)).toBe(+expectedEndDate)
  })

  it('checks out of a specific sheet when --sheet is provided', async () => {
    const activeEntry = DB.genSheetEntry(0, 'other-active')
    const activeSheet = DB.genSheet(
      'active-sheet',
      [activeEntry],
      activeEntry.id
    )
    const startDate = new Date(Date.now() - 30 * 60 * 1000)
    const targetEntry = DB.genSheetEntry(0, 'target-entry', startDate)
    const targetSheet = DB.genSheet(
      'target-sheet',
      [targetEntry],
      targetEntry.id
    )

    if (db.db !== null) {
      db.db.sheets.push(activeSheet, targetSheet)
      db.db.activeSheetName = activeSheet.name
    }

    await expect(
      handler(getArgs({ sheet: 'target-sheet' }))
    ).resolves.toBeUndefined()

    expect(targetSheet.activeEntryID).toBeNull()
    expect(targetEntry.end).not.toBeNull()
    expect(activeSheet.activeEntryID).toBe(activeEntry.id)
  })

  it('appends a --note to the checked-out entry', async () => {
    const startDate = new Date(Date.now() - 60 * 60 * 1000)
    const entry = DB.genSheetEntry(0, 'test-entry', startDate)
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await expect(
      handler(getArgs({ note: 'wrapping up' }))
    ).resolves.toBeUndefined()

    expect(entry.notes).toHaveLength(1)
    expect(entry.notes[0].text).toBe('wrapping up')
  })
})
