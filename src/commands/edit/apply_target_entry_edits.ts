import parseDate from 'time-speak'

import log from '../../log'
import { clDate, clHighlight, clSheet, clText } from '../../color'
import type { TimeSheet } from '../../types'
import type DB from '../../db'
import hasStringValue from './has_string_value'

interface ApplyTargetEntryEditsArgs {
  activeEntryID: number | null
  db: DB
  del?: boolean
  description: string
  end?: string
  finalEntryID: number
  finalSheetName: string
  sheet: TimeSheet
  start?: string
}

/**
 * Deletes or updates a sheet entry (description, start, or end) when a target entry id is known.
 */
const applyTargetEntryEdits = async (
  args: ApplyTargetEntryEditsArgs
): Promise<void> => {
  const {
    activeEntryID,
    db,
    del,
    description,
    end,
    finalEntryID,
    finalSheetName,
    sheet,
    start
  } = args
  const entry = db.getSheetEntry(finalSheetName, finalEntryID)

  if (del) {
    await db.removeSheetEntry(sheet, entry)
    if (activeEntryID === entry.id) {
      sheet.activeEntryID = null
      await db.save()
    }
    log(
      `${clText('Deleted entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('from sheet')} ${clSheet(finalSheetName)}`
    )
    return
  }
  if (hasStringValue(description)) {
    entry.description = description
    await db.save()
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('in sheet')} ${clSheet(finalSheetName)}: ${clText(
        description
      )}`
    )
    return
  }
  if (hasStringValue(start)) {
    const startDate = new Date(+parseDate(start))
    entry.start = startDate
    await db.save()
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('start date to')} ${clDate(startDate.toLocaleString())}`
    )
    return
  }
  if (hasStringValue(end)) {
    const endDate = new Date(+parseDate(end))
    entry.end = endDate
    await db.save()
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('end date to')} ${clDate(endDate.toLocaleString())}`
    )
  }
}

export default applyTargetEntryEdits
