import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { getStartOfDay } from '../../dates'
import { type TimeSheet } from '../../types'
import { type TodayCommandArgs } from './types'
import { printSheets, printSummary } from '../../print'
import { getSheetsWithEntriesSinceDate } from '../../utils'

/**
 * Prints a daily summary of activity for the active, a specific, or all sheets
 * starting at the beginning of today, optionally filtering entries by description.
 */
const handler = (args: TodayCommandArgs): void => {
  const {
    ago,
    all,
    absolute,
    allSheets,
    concise,
    db,
    filter,
    help,
    humanize,
    sheets: inputSheets,
    yargs
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const showAll = all === true || allSheets === true
  let sheets = db.getAllSheets()

  if (!showAll) {
    if (_isUndefined(inputSheets)) {
      sheets = [db.getActiveSheet()]
    } else {
      sheets = inputSheets.map((name: string): TimeSheet => db.getSheet(name))
    }
  }

  const sheetsWithEntriesForToday = getSheetsWithEntriesSinceDate(
    sheets,
    getStartOfDay()
  )

  const filteredSheets: TimeSheet[] =
    _isUndefined(filter) || _isEmpty(filter)
      ? sheetsWithEntriesForToday
      : sheetsWithEntriesForToday
          .map(({ entries, ...rest }) => ({
            ...rest,
            entries: entries.filter(({ description }) =>
              description.toLowerCase().includes(filter.toLowerCase())
            )
          }))
          .filter(({ entries }) => entries.length > 0)

  if (filteredSheets.length === 0) {
    throw new Error('No entries for today')
  }

  printSummary(filteredSheets, humanize)
  log('')
  printSheets(
    filteredSheets,
    absolute !== true || ago === true,
    humanize,
    concise
  )
}

export default handler
