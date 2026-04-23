import { type Argv } from 'yargs'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type EditCommandArgs, handler } from '../../commands/edit'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): EditCommandArgs => ({
  db,
  delete: false,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:edit:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if the specified sheet does not exist', async () => {
    const sheetA = DB.genSheet('test-sheet-a')
    const sheetB = DB.genSheet('test-sheet-b')

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    const p = handler(getArgs({ sheet: 'test-sheet-c' }))

    await expect(p).rejects.toThrow('Sheet test-sheet-c not found')
  }, 10000)

  it('throws an error if the specified sheet entry does not exist', async () => {
    const entryA = DB.genSheetEntry(0, 'test-entry-a')
    const entryB = DB.genSheetEntry(1, 'test-entry-b')
    const sheet = DB.genSheet('test-sheet', [entryA, entryB])

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = 'test-sheet'
    }

    const p = handler(getArgs({ entry: 42 }))

    await expect(p).rejects.toThrow('Entry 42 not found in sheet test-sheet')
  }, 10000)

  it('throws an error if editing a sheet but no name was provided', async () => {
    const sheetA = DB.genSheet('test-sheet-a')
    const sheetB = DB.genSheet('test-sheet-b')

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    const p = handler(getArgs({ name: undefined, sheet: 'test-sheet-a' }))

    await expect(p).rejects.toThrow('No new name specified')
  }, 10000)

  it('edits the name of the specified sheet', async () => {
    const sheet = DB.genSheet('test-sheet-a')

    db.db?.sheets.push(sheet)

    await handler(getArgs({ name: 'new-name', sheet: 'test-sheet-a' }))

    expect(sheet.name).toBe('new-name')
  }, 10000)

  it('edits the description of the specified sheet entry', async () => {
    const entry = DB.genSheetEntry(0, 'test-description')
    const sheet = DB.genSheet('test-sheet-a', [entry])

    db.db?.sheets.push(sheet)

    await handler(
      getArgs({
        description: 'new-description',
        entry: 0,
        sheet: 'test-sheet-a'
      })
    )

    expect(sheet.entries[0]).toBeDefined()
    expect(sheet.entries[0].description).toBe('new-description')
  }, 10000)

  it('edits the start date of the specified sheet entry', async () => {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const newStartDate = new Date()
    const entry = DB.genSheetEntry(0, 'test-description', startDate)
    const sheet = DB.genSheet('test-sheet-a', [entry])

    db.db?.sheets.push(sheet)

    await handler(
      getArgs({
        entry: 0,
        sheet: 'test-sheet-a',
        start: newStartDate.toISOString()
      })
    )

    expect(+entry.start).toBe(+newStartDate)
  }, 10000)

  it('edits the end date of the specified sheet entry', async () => {
    const startDate = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const newEndDate = new Date()
    const entry = DB.genSheetEntry(0, 'test-description', startDate, endDate)
    const sheet = DB.genSheet('test-sheet-a', [entry])

    db.db?.sheets.push(sheet)

    await handler(
      getArgs({
        end: newEndDate.toISOString(),
        entry: 0,
        sheet: 'test-sheet-a'
      })
    )

    expect(+(entry.end === null ? 0 : entry.end)).toBe(+newEndDate)
  }, 10000)

  it('deletes the specified sheet if requested', async () => {
    const sheetA = DB.genSheet('test-sheet-a')
    const sheetB = DB.genSheet('test-sheet-b')

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    await handler(getArgs({ delete: true, sheet: 'test-sheet-a' }))

    expect(
      db.db?.sheets.find(({ name }) => name === 'test-sheet-a')
    ).toBeUndefined()
  }, 10000)

  it('deletes the specified sheet entry if requested', async () => {
    const entryA = DB.genSheetEntry(0, 'test-entry-a')
    const entryB = DB.genSheetEntry(1, 'test-entry-b')
    const sheet = DB.genSheet('test-sheet-a', [entryA, entryB])

    db.db?.sheets.push(sheet)

    await handler(
      getArgs({
        delete: true,
        entry: 1,
        sheet: 'test-sheet-a'
      })
    )

    expect(sheet.entries.find(({ id }) => id === 1)).toBeUndefined()
  }, 10000)

  it('updates the affected sheets active entry ID if the associated entry is deleted', async () => {
    const entryA = DB.genSheetEntry(0, 'test-entry-a')
    const sheet = DB.genSheet('test-sheet-a', [entryA], entryA.id)

    expect(sheet.activeEntryID).toBe(entryA.id)

    db.db?.sheets.push(sheet)

    await handler(
      getArgs({
        delete: true,
        entry: 0,
        sheet: 'test-sheet-a'
      })
    )

    expect(sheet.activeEntryID).toBeNull()
  }, 10000)
})
