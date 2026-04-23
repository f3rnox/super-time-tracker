import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { clDate, clHighlight, clSheet, clTag, clText } from '../../color'
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
  tags?: string[]
}

/**
 * Deletes or updates a sheet entry (description, start, end, or tags) when a
 * target entry id is known.
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
    start,
    tags
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

  let didUpdate = false

  if (hasStringValue(description)) {
    entry.description = description
    didUpdate = true
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('in sheet')} ${clSheet(finalSheetName)}: ${clText(
        description
      )}`
    )
  }

  if (hasStringValue(start)) {
    const startDate = new Date(+parseDate(start))
    entry.start = startDate
    didUpdate = true
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('start date to')} ${clDate(startDate.toLocaleString())}`
    )
  }

  if (hasStringValue(end)) {
    const endDate = new Date(+parseDate(end))
    entry.end = endDate
    didUpdate = true
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('end date to')} ${clDate(endDate.toLocaleString())}`
    )
  }

  if (!_isUndefined(tags) && !_isEmpty(tags)) {
    entry.tags = tags
    didUpdate = true
    log(
      `${clText('Updated entry')} ${clHighlight(
        `${finalEntryID}`
      )} ${clText('tags to')} ${tags.map(clTag).join(' ')}`
    )
  }

  if (didUpdate) {
    await db.save()
  }
}

export default applyTargetEntryEdits
