import { type Argv } from 'yargs'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type SheetCommandArgs, handler } from '../../commands/sheet'

const db = getTestDB()
const getArgs = (overrides?: Record<string, unknown>): SheetCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:sheet:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if trying to delete a sheet that does not exist', async () => {
    const sheetName = 'non-existent-sheet'
    const p = handler(getArgs({ delete: true, name: sheetName }))

    await expect(p).rejects.toThrow(`Sheet ${sheetName} not found`)
  }, 10000)

  it('removes specified sheet from the DB if it exists', async () => {
    const sheetNameA = 'test-sheet-a'
    const sheetNameB = 'test-sheet-b'
    const sheetA = DB.genSheet(sheetNameA)
    const sheetB = DB.genSheet(sheetNameB)

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    await handler(getArgs({ delete: true, name: sheetNameA }))

    expect(db.db?.sheets.length).toBe(2)
    expect(
      db.db?.sheets.find(({ name }) => name === sheetNameA)
    ).toBeUndefined()
  }, 10000)

  it('throws an error if no name is given', async () => {
    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    db.db.activeSheetName = null

    const p = handler(getArgs({ delete: false, name: '' }))

    await expect(p).rejects.toThrow('New sheet name must not be empty')
  }, 10000)

  it('throws an error if the specified sheet is already active', async () => {
    const p = handler(getArgs({ delete: false, name: 'main' }))

    await expect(p).rejects.toThrow('Sheet main already active')
  }, 10000)

  it('switches to the specified sheet', async () => {
    const sheetNameA = 'test-sheet-a'
    const sheetNameB = 'test-sheet-b'
    const sheetA = DB.genSheet(sheetNameA)
    const sheetB = DB.genSheet(sheetNameB)

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    await handler(getArgs({ delete: false, name: sheetNameA }))

    expect(db.getActiveSheetName()).toBe(sheetNameA)
  }, 10000)

  it('creates a new sheet with the name if it does not exist', async () => {
    const sheetNameA = 'test-sheet-a'
    const sheetNameB = 'test-sheet-b'
    const sheetNameC = 'test-sheet-c'
    const sheetA = DB.genSheet(sheetNameA)
    const sheetB = DB.genSheet(sheetNameB)

    db.db?.sheets.push(sheetA)
    db.db?.sheets.push(sheetB)

    await handler(getArgs({ delete: false, name: sheetNameC }))

    const sheets = db.getAllSheets()
    const newSheet = sheets.find(({ name }) => name === sheetNameC)

    expect(db.getActiveSheetName()).toBe(sheetNameC)
    expect(newSheet?.name).toBe(sheetNameC)
    expect(newSheet?.activeEntryID).toBeNull()
    expect(newSheet?.entries).toHaveLength(0)
  }, 10000)
})
