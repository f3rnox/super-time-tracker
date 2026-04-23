import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { type ResumeCommandArgs } from './types'
import { clTag, clHighlight, clSheet, clText } from '../../color'

/**
 * Creates a new active entry copied from a previous entry on the active or a
 * specified sheet. A target entry can be chosen with `--entry`; defaults to the
 * most recent entry. Description, tags, and start time can be overridden.
 */
const handler = async (args: ResumeCommandArgs): Promise<void> => {
  const {
    at,
    db,
    help,
    tags: inputTags,
    yargs,
    entry: inputEntry,
    sheet: inputSheet,
    description: inputDescription
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const activeSheetName = db.getActiveSheetName()
  const sheetName =
    _isUndefined(inputSheet) || _isEmpty(inputSheet)
      ? activeSheetName
      : inputSheet

  if (sheetName === null) {
    throw new Error('No active sheet')
  }

  const sheet = db.getSheet(sheetName)
  const sourceEntry =
    _isUndefined(inputEntry) || !_isFinite(+inputEntry)
      ? db.getMostRecentlyActiveSheetEntry(sheet)
      : db.getSheetEntry(sheet, +inputEntry)

  const {
    description: sourceDescription,
    end: sourceEnd,
    tags: sourceTags,
    id: sourceID
  } = sourceEntry
  const { name } = sheet

  if (sourceEnd === null) {
    throw new Error(
      `Sheet ${name} already has an active entry (${sourceID}: ${sourceDescription})`
    )
  }

  const descriptionOverride =
    _isUndefined(inputDescription) || _isEmpty(inputDescription)
      ? undefined
      : inputDescription.join(' ').trim()
  const finalDescription =
    descriptionOverride === undefined || _isEmpty(descriptionOverride)
      ? sourceDescription
      : descriptionOverride
  const finalTags =
    _isUndefined(inputTags) || _isEmpty(inputTags) ? sourceTags : inputTags
  const startDate =
    _isUndefined(at) || _isEmpty(at) ? new Date() : new Date(+parseDate(at))

  await db.addActiveSheetEntry({
    sheet,
    description: finalDescription,
    startDate,
    tags: finalTags
  })

  const tagsUI = (finalTags ?? []).map(clTag).join(' ')
  const sheetLabel = clSheet(name + ':')

  log(
    `${sheetLabel} ${clText('resumed')} ${clHighlight(finalDescription)} ${tagsUI}`.trim()
  )
}

export default handler
