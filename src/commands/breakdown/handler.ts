import sAgo from 's-ago'
import _map from 'lodash/map'
import weekday from 'weekday'
import parseDate from 'time-speak'
import _isUndefined from 'lodash/isUndefined'
import { eachDayOfInterval, eachHourOfInterval } from 'date-fns'

import log from '../../log'
import { populateResults } from './utils'
import { printJustifiedContent } from '../../print'
import { type TimeSheet, type TimeSheetEntry } from '../../types'
import { type BreakdownCommandArgs, type BreakdownResults } from './types'
import {
  clText,
  clDate,
  clSheet,
  clDuration,
  clHighlight,
  clHighlightRed
} from '../../color'

import {
  getHourString,
  getDurationLangString,
  getEntryDurationInDay,
  getEntryDurationInHour,
  getPluralizedArrayLength,
  getSheetsWithEntriesSinceDate
} from '../../utils'

/**
 * Merges one time sheet entry into per-day, per-hour, and per-weekday breakdown maps.
 */
const accumulateEntryResults = (
  sheet: TimeSheet,
  entry: TimeSheetEntry,
  resultsPerDay: BreakdownResults,
  resultsPerHour: BreakdownResults,
  resultsPerWeekday: BreakdownResults
): void => {
  const { end, start } = entry
  const interval = {
    end: _isUndefined(end) ? new Date() : (end as Date),
    start
  }

  const days = eachDayOfInterval(interval)
  const hours = eachHourOfInterval(interval).map((date: Date): number =>
    date.getHours()
  )

  for (const date of days) {
    for (const hour of hours) {
      const hourStr = getHourString(hour)
      const duration = getEntryDurationInHour(entry, date, hour)

      populateResults({
        date,
        duration,
        entry,
        key: hourStr,
        results: resultsPerHour,
        sheet
      })
    }

    const dateKey = date.toLocaleDateString()
    const dateWeekday = weekday(date.getDay() + 1)
    const duration = getEntryDurationInDay(entry, date)

    populateResults({
      date,
      duration,
      entry,
      key: dateWeekday,
      results: resultsPerWeekday,
      sheet
    })

    populateResults({
      date,
      duration,
      entry,
      key: dateKey,
      results: resultsPerDay,
      sheet
    })
  }
}

const handler = (args: BreakdownCommandArgs): void => {
  const {
    db,
    ago,
    all,
    help,
    yargs,
    humanize,
    since: inputSince,
    sheets: inputSheets
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  let targetSheets: TimeSheet[]
  if (all) {
    targetSheets = db.getAllSheets()
  } else if (_isUndefined(inputSheets)) {
    targetSheets = [db.getActiveSheet()]
  } else {
    targetSheets = inputSheets.map((sheet: string) => db.getSheet(sheet))
  }

  const sheetNames = _map(targetSheets, 'name')
  const since = _isUndefined(inputSince)
    ? new Date(0)
    : new Date(+parseDate(inputSince))

  const resultsPerDay: BreakdownResults = {}
  const resultsPerHour: BreakdownResults = {}
  const resultsPerWeekday: BreakdownResults = {}
  const filteredSheets = getSheetsWithEntriesSinceDate(targetSheets, since)

  for (const sheet of filteredSheets) {
    for (const entry of sheet.entries) {
      accumulateEntryResults(
        sheet,
        entry,
        resultsPerDay,
        resultsPerHour,
        resultsPerWeekday
      )
    }
  }

  const dayResults = Object.values(resultsPerDay)
  const hourResults = Object.keys(resultsPerHour)
  const weekdayResults = Object.keys(resultsPerWeekday)

  if (dayResults.length === 0) {
    throw new Error('No results found')
  }

  log(
    `${clText('  = Sheets')} ${clHighlightRed(
      `(${sheetNames.length})`
    )} ${clSheet(sheetNames.join(', '))} ${clText('=')}`
  )

  log('')
  log(`${clText('  = Breakdown by Day =')}`)
  log('')

  const resultsPerDayOutputRows: string[][] = []
  const resultsPerHourOutputRows: string[][] = []
  const resultsPerWeekdayOutputRows: string[][] = []

  dayResults.sort(({ date: a }, { date: b }): number => (a > b ? 1 : -1))
  dayResults.forEach(({ date, duration, entries, sheets }): void => {
    const weekdayUI = `(${weekday(date.getDay() + 1)})`
    const dateUI = ago ? sAgo(date) : date.toLocaleDateString()
    const durationUI = getDurationLangString(duration, humanize)
    const sheetCountUI = getPluralizedArrayLength(sheets, 'sheet')
    const entryCountUI = getPluralizedArrayLength(entries, 'entry')

    resultsPerDayOutputRows.push([
      clHighlightRed('  *'),
      clDate(dateUI as string),
      clHighlight(weekdayUI),
      clText(entryCountUI),
      clText(sheetCountUI),
      clDuration(durationUI)
    ])
  })

  weekdayResults.sort((a: string, b: string) => a.localeCompare(b))
  weekdayResults.forEach((weekdayStr: string): void => {
    const result = resultsPerWeekday[weekdayStr]
    const { duration, entries, sheets } = result
    const durationUI = getDurationLangString(duration, humanize)
    const sheetCountUI = getPluralizedArrayLength(sheets, 'sheet')
    const entryCountUI = getPluralizedArrayLength(entries, 'entry')

    resultsPerWeekdayOutputRows.push([
      clHighlightRed('  *'),
      clHighlight(`${weekdayStr}s`),
      clText(entryCountUI),
      clText(sheetCountUI),
      clDuration(durationUI)
    ])
  })

  hourResults.sort((a: string, b: string) => {
    const aHour = a.includes('am')
      ? +a.substring(0, a.length - 2)
      : +a.substring(0, a.length - 2) + 12

    const bHour = b.includes('am')
      ? +b.substring(0, b.length - 2)
      : +b.substring(0, b.length - 2) + 12

    return aHour - bHour
  })

  hourResults.forEach((hourStr: string): void => {
    const result = resultsPerHour[hourStr]
    const { duration, entries, sheets } = result
    const durationUI = getDurationLangString(duration, humanize)
    const sheetCountUI = getPluralizedArrayLength(sheets, 'sheet')
    const entryCountUI = getPluralizedArrayLength(entries, 'entry')

    resultsPerHourOutputRows.push([
      clHighlightRed('  *'),
      clHighlight(hourStr),
      clText(entryCountUI),
      clText(sheetCountUI),
      clDuration(durationUI)
    ])
  })

  printJustifiedContent(resultsPerDayOutputRows)
  log('')
  log(clText('  = Breakdown by Week Day ='))
  log('')
  printJustifiedContent(resultsPerWeekdayOutputRows)
  log('')
  log(clText('  = Breakdown by Hour ='))
  log('')
  printJustifiedContent(resultsPerHourOutputRows)
}

export default handler
