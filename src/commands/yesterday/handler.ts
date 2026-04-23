import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { TimeSheet } from '../../types'
import { getYesterday } from '../../dates'
import { type YesterdayCommandArgs } from './types'
import { printSheets, printSummary } from '../../print'
import { filterSheetEntriesForDate } from '../../sheets'

/**
 * Prints a daily summary of activity for yesterday for the active, a specific,
 * or all sheets, optionally filtering entries by description.
 */
const handler = (args: YesterdayCommandArgs): void => {
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

  if (!_isUndefined(inputSheets) && showAll) {
    throw new Error('Cannot specify both --all and sheets')
  }

  const sheets =
    _isUndefined(inputSheets) || showAll
      ? db.getAllSheets()
      : inputSheets.map((name: string): TimeSheet => db.getSheet(name))

  const yesterday = getYesterday()
  const sheetsWithEntriesForYesterday = filterSheetEntriesForDate(
    sheets,
    yesterday
  )

  const filteredSheets: TimeSheet[] =
    _isUndefined(filter) || _isEmpty(filter)
      ? sheetsWithEntriesForYesterday
      : sheetsWithEntriesForYesterday
          .map(({ entries, ...rest }) => ({
            ...rest,
            entries: entries.filter(({ description }) =>
              description.toLowerCase().includes(filter.toLowerCase())
            )
          }))
          .filter(({ entries }) => entries.length > 0)

  if (filteredSheets.length === 0) {
    throw new Error('No entries for yesterday')
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
