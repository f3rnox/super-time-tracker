import _isEmpty from 'lodash/isEmpty'

import log from '../../log'
import { printSheets } from '../../print'
import { type ListCommandArgs } from './types'
import getListFilteredSheets from './get_list_filtered_sheets'
import getListSheetsToList from './get_list_sheets_to_list'
import getListSinceDate from './get_list_since_date'
import logListSheetsAfterPrint from './log_list_sheets_after_print'
import logListSheetsHeader from './log_list_sheets_header'

const handler = (args: ListCommandArgs): void => {
  const {
    db,
    all,
    help,
    since,
    today,
    yargs,
    filter,
    concise,
    humanize,
    absolute,
    yesterday
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  if (!_isEmpty(since) && (today || yesterday || all)) {
    throw new Error(
      'Cannot use --since, --today, --yesterday, or --all together'
    )
  }

  const dbSheets = db.getAllSheets()
  const sheetsToList = getListSheetsToList(args, dbSheets)

  if (_isEmpty(sheetsToList)) {
    throw new Error('No relevant sheets found')
  }

  const sinceDate = getListSinceDate(sheetsToList, args)

  const filteredSheets = getListFilteredSheets(sheetsToList, sinceDate, filter)

  logListSheetsHeader({
    today,
    sinceDate,
    filteredCount: filteredSheets.length
  })

  log('')

  printSheets(filteredSheets, absolute !== true, humanize, concise)

  logListSheetsAfterPrint({
    all,
    filteredSheets,
    totalDbSheets: dbSheets.length,
    humanize
  })
}

export default handler
