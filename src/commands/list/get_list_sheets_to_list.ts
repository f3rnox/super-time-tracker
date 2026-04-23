import _isUndefined from 'lodash/isUndefined'

import { type TimeSheet } from '../../types'
import { type ListCommandArgs } from './types'

/**
 * Resolves which time sheets the list command should operate on.
 * @param args - List command arguments
 * @param dbSheets - All sheets from the database
 */
const getListSheetsToList = (
  args: ListCommandArgs,
  dbSheets: TimeSheet[]
): TimeSheet[] => {
  const { db, allSheets, sheets: sheetNames } = args
  const activeSheetName = db.getActiveSheetName()

  if (!_isUndefined(sheetNames)) {
    return sheetNames.map(
      (sheetName: string): TimeSheet => db.getSheet(sheetName)
    )
  }
  if (allSheets) {
    return dbSheets
  }
  if (activeSheetName === null) {
    return []
  }
  return [db.getActiveSheet()]
}

export default getListSheetsToList
