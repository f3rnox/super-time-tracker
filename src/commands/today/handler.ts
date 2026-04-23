import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { getStartOfDay } from '../../dates'
import { type TodayCommandArgs } from './types'
import { printSheets, printSummary } from '../../print'
import { getSheetsWithEntriesSinceDate } from '../../utils'

const handler = (args: TodayCommandArgs): void => {
  const { absolute, all, db, help, humanize, sheets: inputSheets, yargs } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  let sheets = db.getAllSheets()

  if (!all) {
    if (_isUndefined(inputSheets)) {
      sheets = [db.getActiveSheet()]
    } else {
      sheets = inputSheets.map((name: string) => db.getSheet(name))
    }
  }

  const sheetsWithEntriesForToday = getSheetsWithEntriesSinceDate(
    sheets,
    getStartOfDay()
  )

  if (sheetsWithEntriesForToday.length === 0) {
    throw new Error('No entries for today')
  }

  printSummary(sheetsWithEntriesForToday, humanize)
  log('')
  printSheets(sheetsWithEntriesForToday, absolute !== true, humanize)
}

export default handler
