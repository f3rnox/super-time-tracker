import ago from 's-ago'
import _sum from 'lodash/sum'
import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { getStartOfDay } from '../../dates'
import { type TimeSheet } from '../../types'
import { type SheetsCommandArgs } from './types'
import { clDate, clHighlight, clText } from '../../color'
import { getSheetHeaderColumns, printJustifiedContent } from '../../print'
import {
  getDurationLangString,
  getLastFiveActiveSheets,
  getSheetsWithEntriesSinceDate
} from '../../utils'

const handler = (args: SheetsCommandArgs): void => {
  const { db, help, humanize, since, today, yargs } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  if (!_isEmpty(since) && today) {
    throw new Error('Cannot use both --since and --today')
  }

  const sheets = db.getAllSheets()

  if (sheets.length === 0) {
    throw new Error('No time sheets exist')
  }

  let sinceDate: Date | null

  if (!_isUndefined(since) && !_isEmpty(since)) {
    sinceDate = new Date(+parseDate(since))
  } else if (today) {
    sinceDate = getStartOfDay()
  } else {
    sinceDate = new Date(0)
  }

  const filteredSheets =
    sinceDate === null
      ? sheets
      : getSheetsWithEntriesSinceDate(sheets, sinceDate)

  if (filteredSheets.length === 0) {
    throw new Error(`No sheets since ${sinceDate.toLocaleString()}`)
  }

  if (today) {
    log(
      `${clText('* Showing')} ${clHighlight(
        `${filteredSheets.length}`
      )} ${clText('sheets for today')}`
    )
  } else if (sinceDate === null) {
    log(
      `${clText('* Showing')} ${clHighlight(
        `${filteredSheets.length}`
      )} ${clText('sheets')}`
    )
  } else {
    const sinceDateAgoText = clDate(`[${ago(sinceDate)}]`)

    log(
      `${clText('* Showing sheets since')} ${clHighlight(
        sinceDate.toLocaleString()
      )} ${sinceDateAgoText}`
    )
  }

  log('')

  filteredSheets.sort(({ name: nameA }, { name: nameB }) =>
    nameA.localeCompare(nameB)
  )

  const activeSheetName = db.getActiveSheetName()
  const sheetHeaderRows = filteredSheets.map((sheet: TimeSheet): string[] =>
    getSheetHeaderColumns(sheet, sheet.name === activeSheetName, humanize)
  )

  printJustifiedContent(sheetHeaderRows)

  const totalDuration = _sum(
    filteredSheets.map(({ entries }) =>
      _sum(
        entries.map(({ end, start }) =>
          end === null ? Date.now() - +start : +end - +start
        )
      )
    )
  )

  const lastFiveActiveSheets = getLastFiveActiveSheets(filteredSheets)
  const lastFiveActiveSheetHeaderRows = lastFiveActiveSheets.map(
    (sheet: TimeSheet): string[] =>
      getSheetHeaderColumns(sheet, sheet.name === activeSheetName, humanize)
  )

  log('')
  log(
    `${clText('Total duration')}: [${clHighlight(
      getDurationLangString(totalDuration, humanize)
    )}]`
  )
  log('')
  log(clText('* Last 5 active sheets'))
  log('')
  printJustifiedContent(lastFiveActiveSheetHeaderRows)
}

export default handler
