import { type Argv } from 'yargs'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type NowCommandArgs, handler } from '../../commands/now'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): NowCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:now:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error when no sheet is active', () => {
    if (db.db !== null) {
      db.db.activeSheetName = null
    }

    expect(() => handler(getArgs())).toThrow('No sheet is active')
  })

  it('throws an error when active sheet has no active entry', () => {
    const sheet = DB.genSheet('test-sheet')

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).toThrow(
      `Sheet ${sheet.name} has no active entry`
    )
  })

  it('throws an error when active entry id is missing from sheet entries', () => {
    const sheet = DB.genSheet('test-sheet')
    sheet.activeEntryID = 42

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).toThrow(
      `Active entry 42 for sheet ${sheet.name} not found`
    )
  })

  it('prints the active entry when one exists', () => {
    const entry = DB.genSheetEntry(0, 'test-entry')
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
  })

  it('prints the active entry along with its notes without mutating note order', () => {
    const entry = DB.genSheetEntry(0, 'test-entry')

    entry.notes = [
      { timestamp: new Date(2026, 3, 23, 12, 30, 0, 0), text: 'later note' },
      { timestamp: new Date(2026, 3, 23, 12, 0, 0, 0), text: 'earlier note' }
    ]

    const originalOrder = entry.notes.map(({ text }) => text)
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs())).not.toThrow()
    expect(entry.notes.map(({ text }) => text)).toEqual(originalOrder)
  })

  it('throws when --all is given but no sheet has an active entry', () => {
    const sheet = DB.genSheet('test-sheet')

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    expect(() => handler(getArgs({ all: true }))).toThrow(
      'No sheet has an active entry'
    )
  })

  it('prints active entries across all sheets when --all is given', () => {
    const entryA = DB.genSheetEntry(0, 'work')
    const sheetA = DB.genSheet('sheet-a', [entryA], entryA.id)
    const entryB = DB.genSheetEntry(0, 'research')
    const sheetB = DB.genSheet('sheet-b', [entryB], entryB.id)

    if (db.db !== null) {
      db.db.sheets.push(sheetA, sheetB)
      db.db.activeSheetName = sheetA.name
    }

    expect(() => handler(getArgs({ all: true }))).not.toThrow()
  })
})
