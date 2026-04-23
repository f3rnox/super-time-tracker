import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { clDate, clHighlight, clID, clText } from '../../color'
import { type NoteCommandArgs } from './types'

/**
 * Attaches a timestamped note to an entry on a sheet. By default targets the
 * currently running entry on the active sheet; accepts explicit `--sheet`,
 * `--entry`, and `--at` overrides.
 */
const handler = async (args: NoteCommandArgs): Promise<void> => {
  const {
    at,
    db,
    help,
    yargs,
    entry: inputEntry,
    sheet: inputSheet,
    note: noteArray
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const text = noteArray.join(' ').trim()

  if (_isEmpty(text)) {
    throw new Error('Note text is required')
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
  const { activeEntryID, name } = sheet
  const targetEntryID =
    _isUndefined(inputEntry) || !_isFinite(+inputEntry)
      ? activeEntryID
      : +inputEntry

  if (targetEntryID === null) {
    throw new Error(`Sheet ${name} has no active entry`)
  }

  const entry = db.getSheetEntry(name, targetEntryID)
  const timestamp =
    _isUndefined(at) || _isEmpty(at) ? new Date() : new Date(+parseDate(at))

  entry.notes.push({ timestamp, text })

  await db.save()

  const entryIDText: string = clID(String(entry.id))
  const timestampText: string = clDate(timestamp.toLocaleString())
  const noteText: string = clHighlight(text)

  log(
    `${clText('Added note to entry')} ${entryIDText} ${timestampText}: ${noteText}`
  )
}

export default handler
