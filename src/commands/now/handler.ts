import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { clText } from '../../color'
import { type TimeSheet } from '../../types'
import { type NowCommandArgs } from './types'
import { printActiveSheetEntry } from '../../print'

/**
 * Prints the active entry for the active sheet. With `--all`, prints the
 * active entry for every sheet that currently has one.
 */
const handler = (args: NowCommandArgs): void => {
  const { all, allSheets, db, help, humanize, yargs } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const shouldShowAll = all === true || allSheets === true

  if (shouldShowAll) {
    const sheets = db.getAllSheets()
    const sheetsWithActive = sheets.filter(
      (sheet: TimeSheet): boolean => sheet.activeEntryID !== null
    )

    if (sheetsWithActive.length === 0) {
      throw new Error('No sheet has an active entry')
    }

    sheetsWithActive.forEach((sheet: TimeSheet, i: number): void => {
      const { activeEntryID, entries, name } = sheet
      const entry = entries.find(({ id }) => id === activeEntryID)

      if (_isUndefined(entry)) {
        log(
          clText(
            `! Sheet ${name} references missing active entry ${activeEntryID}`
          )
        )
        return
      }

      printActiveSheetEntry(entry, name, humanize)

      if (i < sheetsWithActive.length - 1) {
        log('')
      }
    })

    return
  }

  const activeSheetName = db.getActiveSheetName()

  if (activeSheetName === null) {
    throw new Error('No sheet is active')
  }

  const sheet = db.getActiveSheet()
  const { activeEntryID, entries } = sheet

  if (activeEntryID === null) {
    throw new Error(`Sheet ${activeSheetName} has no active entry`)
  }

  const entry = entries.find(({ id }) => id === activeEntryID)

  if (_isUndefined(entry)) {
    throw new Error(
      `Active entry ${activeEntryID} for sheet ${activeSheetName} not found`
    )
  }

  printActiveSheetEntry(entry, activeSheetName, humanize)
}

export default handler
