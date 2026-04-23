import sAgo from 's-ago'
import _map from 'lodash/map'
import weekday from 'weekday'
import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import { eachDayOfInterval } from 'date-fns'

import log from '../../log'
import { populateResults } from './utils'
import { printJustifiedContent } from '../../print'
import { getStartOfDay, getYesterday } from '../../dates'
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
  const hasOpenEnd = _isUndefined(end) || end === null
  const interval = {
    end: hasOpenEnd ? new Date() : end,
    start
  }
  const normalizedEntry: TimeSheetEntry = hasOpenEnd
    ? { ...entry, end: null }
    : entry

  const days = eachDayOfInterval(interval)
  const hours: number[] = Array.from(
    { length: 24 },
    (_, hour: number): number => hour
  )

  for (const date of days) {
    for (const hour of hours) {
      const hourStr = getHourString(hour)
      const duration = getEntryDurationInHour(normalizedEntry, date, hour)
      if (duration <= 0) {
        continue
      }

      populateResults({
        date,
        duration,
        entry: normalizedEntry,
        key: hourStr,
        results: resultsPerHour,
        sheet
      })
    }

    const dateKey = date.toLocaleDateString()
    const dateWeekday = weekday(date.getDay() + 1)
    const duration = getEntryDurationInDay(normalizedEntry, date)
    if (duration <= 0) {
      continue
    }

    populateResults({
      date,
      duration,
      entry: normalizedEntry,
      key: dateWeekday,
      results: resultsPerWeekday,
      sheet
    })

    populateResults({
      date,
      duration,
      entry: normalizedEntry,
      key: dateKey,
      results: resultsPerDay,
      sheet
    })
  }
}

/**
 * Prints a per-day, per-weekday, and per-hour breakdown of tracked time.
 * Supports date scopes (`--today`, `--yesterday`, `--since`), sheet scoping
 * (`--all-sheets` or positional sheets), and description filtering.
 */
const handler = (args: BreakdownCommandArgs): void => {
  const {
    db,
    ago,
    all,
    allSheets,
    filter,
    help,
    today,
    yargs,
    humanize,
    yesterday,
    since: inputSince,
    sheets: inputSheets
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const dateFlagCount = [
    today,
    yesterday,
    !_isUndefined(inputSince) && !_isEmpty(inputSince)
  ].filter(Boolean).length

  if (dateFlagCount > 1) {
    throw new Error('Cannot combine --since, --today, and --yesterday')
  }

  let targetSheets: TimeSheet[]
  if (all === true || allSheets === true) {
    targetSheets = db.getAllSheets()
  } else if (_isUndefined(inputSheets)) {
    targetSheets = [db.getActiveSheet()]
  } else {
    targetSheets = inputSheets.map((sheet: string) => db.getSheet(sheet))
  }

  const sheetNames = _map(targetSheets, 'name')
  let since: Date
  if (today) {
    since = getStartOfDay()
  } else if (yesterday) {
    since = getYesterday()
  } else if (!_isUndefined(inputSince) && !_isEmpty(inputSince)) {
    since = new Date(+parseDate(inputSince))
  } else {
    since = new Date(0)
  }

  const resultsPerDay: BreakdownResults = {}
  const resultsPerHour: BreakdownResults = {}
  const resultsPerWeekday: BreakdownResults = {}
  const sheetsInRange = getSheetsWithEntriesSinceDate(targetSheets, since)
  const filterText =
    _isUndefined(filter) || _isEmpty(filter) ? null : filter.toLowerCase()
  const filteredSheets: TimeSheet[] =
    filterText === null
      ? sheetsInRange
      : sheetsInRange
          .map(({ entries, ...rest }) => ({
            ...rest,
            entries: entries.filter(({ description }) =>
              description.toLowerCase().includes(filterText)
            )
          }))
          .filter(({ entries }) => entries.length > 0)

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
