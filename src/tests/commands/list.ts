import { type Argv } from 'yargs'

import DB from '../../db'
import getTestDB from '../get_test_db'
import { type ListCommandArgs, handler } from '../../commands/list'

const db = getTestDB()

const getArgs = (overrides?: Record<string, unknown>): ListCommandArgs => ({
  db,
  yargs: {} as Argv,
  ...(overrides ?? {})
})

describe('commands:list:handler', () => {
  beforeEach(async () => {
    await db.load()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('does not mutate entry start date when listing with default since date', () => {
    if (db.db === null) {
      throw new Error('Test DB is null')
    }

    const startDate = new Date(2026, 3, 23, 9, 2, 20, 334)
    const endDate = new Date(2026, 3, 23, 10, 2, 23, 701)
    const entry = DB.genSheetEntry(0, 'test entry', startDate, endDate)
    const sheet = DB.genSheet('main', [entry], null)

    db.db.sheets = [sheet]
    db.db.activeSheetName = sheet.name

    const initialStartDate = +entry.start

    expect(() => handler(getArgs())).not.toThrow()
    expect(+entry.start).toBe(initialStartDate)
  }, 10000)
})
