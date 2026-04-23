import { type Argv } from 'yargs'
import _cloneDeep from 'lodash/cloneDeep'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type NoteCommandArgs, handler } from '../../commands/note'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): NoteCommandArgs => ({
  db,
  note: [],
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:note:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if the note text is empty', async () => {
    const p = handler(getArgs({ note: [] }))

    await expect(p).rejects.toThrow('Note text is required')
  }, 10000)

  it('throws an error if no sheet is active', async () => {
    if (db.db !== null) {
      db.db.activeSheetName = null
    }

    const p = handler(getArgs({ note: ['hello'] }))

    await expect(p).rejects.toThrow('No active sheet')
  }, 10000)

  it('throws an error if the active sheet has no active entry', async () => {
    const sheet = DB.genSheet('test-sheet')
    const testDB = _cloneDeep(db)

    if (testDB.db === null) {
      throw new Error('Test DB is null')
    }

    testDB.db.sheets.push(sheet)
    testDB.db.activeSheetName = sheet.name

    const p = handler(getArgs({ db: testDB, note: ['hello'] }))

    await expect(p).rejects.toThrow(`Sheet ${sheet.name} has no active entry`)
  }, 10000)

  it('appends a timestamped note to the active entry on the active sheet', async () => {
    const entry = DB.genSheetEntry(0, 'test-description', new Date())
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)
    const testDB = _cloneDeep(db)

    if (testDB.db === null) {
      throw new Error('Test DB is null')
    }

    testDB.db.sheets.push(sheet)
    testDB.db.activeSheetName = sheet.name

    const beforeFirst = Date.now()

    await expect(
      handler(getArgs({ db: testDB, note: ['first', 'note'] }))
    ).resolves.toBeUndefined()

    const afterFirst = Date.now()
    const [updatedEntry] = sheet.entries

    expect(updatedEntry.notes).toHaveLength(1)
    expect(updatedEntry.notes[0].text).toBe('first note')
    expect(updatedEntry.notes[0].timestamp).toBeInstanceOf(Date)
    expect(+updatedEntry.notes[0].timestamp).toBeGreaterThanOrEqual(beforeFirst)
    expect(+updatedEntry.notes[0].timestamp).toBeLessThanOrEqual(afterFirst)

    await expect(
      handler(getArgs({ db: testDB, note: ['second', 'note'] }))
    ).resolves.toBeUndefined()

    expect(updatedEntry.notes).toHaveLength(2)
    expect(updatedEntry.notes[1].text).toBe('second note')
    expect(updatedEntry.notes[1].timestamp).toBeInstanceOf(Date)
  }, 10000)

  it('appends a note to a non-active entry specified by --entry', async () => {
    const entryA = DB.genSheetEntry(0, 'first', new Date(), new Date())
    const entryB = DB.genSheetEntry(1, 'second', new Date())
    const sheet = DB.genSheet('test-sheet', [entryA, entryB], entryB.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    await expect(
      handler(getArgs({ entry: 0, note: ['retro'] }))
    ).resolves.toBeUndefined()

    expect(entryA.notes).toHaveLength(1)
    expect(entryA.notes[0].text).toBe('retro')
    expect(entryB.notes).toHaveLength(0)
  }, 10000)

  it('appends a note to an entry on a non-active sheet via --sheet', async () => {
    const activeSheet = DB.genSheet('active-sheet')
    const targetEntry = DB.genSheetEntry(0, 'done', new Date(), new Date())
    const targetSheet = DB.genSheet('target-sheet', [targetEntry])

    if (db.db !== null) {
      db.db.sheets.push(activeSheet, targetSheet)
      db.db.activeSheetName = activeSheet.name
    }

    await expect(
      handler(getArgs({ entry: 0, note: ['later'], sheet: 'target-sheet' }))
    ).resolves.toBeUndefined()

    expect(targetEntry.notes).toHaveLength(1)
    expect(targetEntry.notes[0].text).toBe('later')
  }, 10000)

  it('uses --at to set the note timestamp', async () => {
    const entry = DB.genSheetEntry(0, 'desc', new Date())
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const noteAt = new Date(Date.now() - 60 * 60 * 1000)

    await expect(
      handler(getArgs({ at: noteAt.toISOString(), note: ['backdated'] }))
    ).resolves.toBeUndefined()

    expect(entry.notes).toHaveLength(1)
    expect(+entry.notes[0].timestamp).toBe(+noteAt)
  }, 10000)
})
