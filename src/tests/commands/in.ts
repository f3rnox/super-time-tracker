import { type Argv } from 'yargs'
import _cloneDeep from 'lodash/cloneDeep'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type InCommandArgs, handler } from '../../commands/in'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): InCommandArgs => ({
  db,
  description: [],
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:in:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('throws an error if not provided a sheet name and no sheet is active', async () => {
    if (db.db !== null) {
      db.db.activeSheetName = null
    }

    const p = handler(getArgs())

    await expect(p).rejects.toThrow('No active sheet')
  }, 10000)

  it('throws an error if the sheet has an active entry registered but it is not in the entries list', async () => {
    const testDB = _cloneDeep(db)
    const sheet = DB.genSheet('test-sheet')

    sheet.activeEntryID = 42

    if (testDB !== null && testDB.db !== null) {
      testDB.db.sheets.push(sheet)
      testDB.db.activeSheetName = sheet.name
    }

    const p = handler(getArgs({ db: testDB }))

    await expect(p).rejects.toThrow('Entry 42 not found in sheet test-sheet')
  }, 10000)

  it('throws an error if an entry is already active for the time sheet', async () => {
    const entry = DB.genSheetEntry(0, 'test-description', new Date())
    const sheet = DB.genSheet('test-sheet', [entry], entry.id)

    if (db.db !== null) {
      db.db.sheets.push(sheet)
      db.db.activeSheetName = sheet.name
    }

    const p = handler(getArgs({ db }))

    await expect(p).rejects.toThrow(
      `An entry is already active (${entry.id}): ${entry.description}`
    )
  }, 10000)

  it('creates a new time sheet entry and adds it to the sheet entry list', async () => {
    const sheet = DB.genSheet('test-sheet')
    const { name } = sheet
    const testDB = _cloneDeep(db)

    if (testDB.db === null) {
      throw new Error('Test DB is null')
    }

    testDB.db.sheets.push(sheet)
    testDB.db.activeSheetName = name

    const atDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

    await expect(
      handler(
        getArgs({
          at: atDate.toISOString(),
          db: testDB,
          description: ['test', 'description'],
          sheet: name
        })
      )
    ).resolves.toBeUndefined()

    const { entries } = sheet
    const [entry] = entries

    expect(entry.id).toBe(0)
    expect(+entry.start).toBe(+atDate)
    expect(entry.end).toBeNull()
    expect(entry.description).toBe('test description')
  }, 10000)
})
