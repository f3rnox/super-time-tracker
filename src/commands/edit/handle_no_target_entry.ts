import log from '../../log'
import { clHighlight, clSheet, clText } from '../../color'
import type { TimeSheet } from '../../types'
import type DB from '../../db'
import hasStringValue from './has_string_value'

interface HandleNoTargetEntryArgs {
  db: DB
  del?: boolean
  finalSheetName: string
  inputName?: string
  sheet: TimeSheet
}

/**
 * Handles delete/rename for the case where no specific entry id was resolved.
 */
const handleNoTargetEntry = async (
  args: HandleNoTargetEntryArgs
): Promise<void> => {
  const { db, del, finalSheetName, inputName, sheet } = args
  if (del) {
    await db.removeSheet(finalSheetName)
    log(`${clText('Deleted sheet')} ${clSheet(finalSheetName)}`)
    return
  }
  if (hasStringValue(inputName)) {
    await db.renameSheet(sheet.name, inputName)
    log(
      `${clText('Renamed sheet')} ${clSheet(finalSheetName)} ${clText(
        'to'
      )} ${clHighlight(inputName)}`
    )
    return
  }
  throw new Error(`No new name specified for sheet ${finalSheetName}`)
}

export default handleNoTargetEntry
