import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import { type InCommandArgs } from './types'
import { printCheckedInEntry } from '../../print'

/**
 * Creates a new active entry in the requested (or active) sheet, optionally
 * back-dated and with explicit tags or an initial note.
 */
const handler = async (args: InCommandArgs): Promise<void> => {
  const {
    at,
    db,
    help,
    note,
    tags,
    yargs,
    sheet: inputSheet,
    description: inputArray
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

  const sheet = db.doesSheetExist(sheetName)
    ? db.getSheet(sheetName)
    : await db.addSheet(sheetName)
  const { activeEntryID, name } = sheet

  if (activeEntryID !== null) {
    const entry = db.getSheetEntry(name, activeEntryID)
    const { description: entryDescription, id } = entry

    throw new Error(`An entry is already active (${id}): ${entryDescription}`)
  }

  const input = inputArray.join(' ')
  const startDate =
    _isUndefined(at) || _isEmpty(at) ? new Date() : new Date(+parseDate(at))
  const explicitTags = _isUndefined(tags) || _isEmpty(tags) ? undefined : tags
  const entry = await db.addActiveSheetEntry({
    sheet: name,
    input,
    startDate,
    ...(explicitTags === undefined ? {} : { tags: explicitTags })
  })

  if (!_isUndefined(note) && !_isEmpty(note)) {
    entry.notes.push({ timestamp: new Date(), text: note })
    await db.save()
  }

  printCheckedInEntry(entry)
}

export default handler
