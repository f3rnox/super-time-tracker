import _isNil from 'lodash/isNil'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'

import { parseVariadicArg } from '../../utils'
import { type EditCommandArgs } from './types'
import applyTargetEntryEdits from './apply_target_entry_edits'
import handleNoTargetEntry from './handle_no_target_entry'

/**
 * Handles the edit command: update or delete time sheet entries or whole sheets.
 */
const handler = async (args: EditCommandArgs): Promise<void> => {
  const {
    db,
    end,
    help,
    yargs,
    start,
    delete: del,
    name: inputName,
    entry: inputEntry,
    sheet: inputSheet,
    description: inputDescription
  } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const activeSheetName = db.getActiveSheetName()
  const description = parseVariadicArg(inputDescription) ?? ''
  const finalSheetName = _isEmpty(inputSheet) ? activeSheetName : inputSheet

  if (_isNil(finalSheetName) || _isEmpty(finalSheetName)) {
    throw new Error('No sheet specified and none active')
  }

  const sheet = db.getSheet(finalSheetName)
  const { activeEntryID } = sheet
  const finalEntryID =
    _isNil(inputEntry) || !_isFinite(+inputEntry) ? activeEntryID : +inputEntry

  const hasTargetEntry = finalEntryID !== null && _isFinite(finalEntryID)

  if (!hasTargetEntry) {
    await handleNoTargetEntry({
      db,
      finalSheetName,
      sheet,
      ...(del === undefined ? {} : { del }),
      ...(inputName === undefined ? {} : { inputName })
    })
    return
  }
  await applyTargetEntryEdits({
    activeEntryID,
    db,
    description,
    finalEntryID,
    finalSheetName,
    sheet,
    ...(del === undefined ? {} : { del }),
    ...(end === undefined ? {} : { end }),
    ...(start === undefined ? {} : { start })
  })
}

export default handler
