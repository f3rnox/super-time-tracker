import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import log from '../../log'
import { type SheetCommandArgs } from './types'
import { clHighlight, clHighlightRed, clSheet, clText } from '../../color'

/**
 * Switches to, creates, renames, or deletes a sheet. Without any flag prints
 * the currently active sheet name.
 */
const handler = async (args: SheetCommandArgs): Promise<void> => {
  const { db, delete: del, help, name, rename, yargs } = args

  if (help) {
    yargs.showHelp()
    process.exit(0)
  }

  const activeSheetName = db.getActiveSheetName()
  const sheetName = _isUndefined(name) ? activeSheetName : name

  if (sheetName === null) {
    throw new Error('No active sheet')
  }

  if (del) {
    await db.removeSheet(sheetName)

    log(`${clText('Deleted sheet')} ${clSheet(sheetName)}`)
    return
  }

  if (!_isUndefined(rename) && !_isEmpty(rename)) {
    await db.renameSheet(sheetName, rename)

    if (activeSheetName === sheetName) {
      await db.setActiveSheetName(rename)
    }

    log(
      `${clText('Renamed sheet')} ${clSheet(sheetName)} ${clText('to')} ${clHighlight(rename)}`
    )
    return
  }

  if (_isUndefined(name)) {
    log(
      `${clText('Sheet')} ${clHighlightRed(sheetName)} ${clText('is active')}`
    )
    return
  }

  if (activeSheetName === name) {
    throw new Error(`Sheet ${name} already active`)
  }

  const sheet = db.doesSheetExist(name)
    ? db.getSheet(name)
    : await db.addSheet(name)

  await db.setActiveSheet(sheet)

  log(`${clText('Switched to sheet:')} ${clSheet(name)}`)
}

export default handler
