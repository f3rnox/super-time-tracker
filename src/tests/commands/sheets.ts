import { type Argv } from 'yargs'

import getTestDB from '../get_test_db'
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
})
