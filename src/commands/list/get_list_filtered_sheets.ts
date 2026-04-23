import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import { type TimeSheet } from '../../types'
import { getSheetsWithEntriesSinceDate } from '../../utils'

/**
 * Applies date and description filters, dropping sheets with no matching entries.
 * @param sheets - Candidate sheets
 * @param sinceDate - Inclusive start of the visible period, or all entries if `null`
 * @param filter - Substring to match in entry descriptions, or no filter
 */
const getListFilteredSheets = (
  sheets: TimeSheet[],
  sinceDate: Date | null,
  filter: string | undefined
): TimeSheet[] => {
  const sheetsInRange =
    sinceDate === null
      ? sheets
      : getSheetsWithEntriesSinceDate(sheets, sinceDate)

  return sheetsInRange
    .map(({ entries, ...otherSheetData }) => ({
      ...otherSheetData,
      entries: entries.filter(({ description }) => {
        if (_isUndefined(filter) || _isEmpty(filter)) {
          return true
        }
        return description.toLowerCase().includes(filter.toLowerCase())
      })
    }))
    .filter(({ entries }) => entries.length > 0)
}

export default getListFilteredSheets
