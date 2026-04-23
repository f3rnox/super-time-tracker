import ago from 's-ago'
import _sum from 'lodash/sum'
import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { type TimeSheet } from '../../types'
import { type SheetsCommandArgs } from './types'
import { clDate, clHighlight, clText } from '../../color'
import { getStartOfDay, getYesterday } from '../../dates'
import { getSheetHeaderColumns, printJustifiedContent } from '../../print'
import {
  getDurationLangString,
  getLastFiveActiveSheets,
  getSheetsWithEntriesSinceDate
} from '../../utils'

/**
 * Prints all sheets in the database with basic totals. Supports date scopes
 * (`--today`, `--yesterday`, `--since`), description filtering, and concise
 * output.
 */
const handler = (args: SheetsCommandArgs): void => {
  const {
    concise,
    db,
    filter,
    help,
    humanize,
    since,
    today,
    yargs,
    yesterday
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const dateFlagCount = [today, yesterday, !_isEmpty(since)].filter(
    Boolean
  ).length

  if (dateFlagCount > 1) {
    throw new Error('Cannot combine --since, --today, and --yesterday')
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
  } else if (yesterday) {
    sinceDate = getYesterday()
  } else {
    sinceDate = new Date(0)
  }

  const sheetsInRange =
    sinceDate === null
      ? sheets
      : getSheetsWithEntriesSinceDate(sheets, sinceDate)

  const filteredSheets: TimeSheet[] =
    _isUndefined(filter) || _isEmpty(filter)
      ? sheetsInRange
      : sheetsInRange
          .map(({ entries, ...rest }) => ({
            ...rest,
            entries: entries.filter(({ description }) =>
              description.toLowerCase().includes(filter.toLowerCase())
            )
          }))
          .filter(({ entries }) => entries.length > 0)

  if (filteredSheets.length === 0) {
    const hasFilter = !_isUndefined(filter) && !_isEmpty(filter)
    const hasDateWindow = sinceDate !== null && +sinceDate !== 0
    const reason = hasFilter
      ? 'No sheets match filter'
      : hasDateWindow
        ? `No sheets since ${(sinceDate as Date).toLocaleString()}`
        : 'No sheets to show'
    throw new Error(reason)
  }

  if (today) {
    log(
      `${clText('* Showing')} ${clHighlight(
        `${filteredSheets.length}`
      )} ${clText('sheets for today')}`
    )
  } else if (yesterday) {
    log(
      `${clText('* Showing')} ${clHighlight(
        `${filteredSheets.length}`
      )} ${clText('sheets for yesterday')}`
    )
  } else if (sinceDate === null || +sinceDate === 0) {
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

  if (concise === true) {
    return
  }

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
