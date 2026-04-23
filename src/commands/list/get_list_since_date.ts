import parseDate from 'time-speak'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'

import { getPastDay, getStartOfDay } from '../../dates'
import { type TimeSheet } from '../../types'
import { getFirstPastDateWithEntries } from '../../utils'
import { type ListCommandArgs } from './types'

/**
 * Computes the lower bound for which entries to include, or `null` for all entries.
 * @param sheets - Sheets the command applies to
 * @param args - List command arguments (date-related fields are read)
 */
const getListSinceDate = (
  sheets: TimeSheet[],
  args: ListCommandArgs
): Date | null => {
  const { since, today, yesterday, all } = args

  if (!_isUndefined(since) && !_isEmpty(since)) {
    return new Date(+parseDate(since))
  }
  if (today) {
    return getStartOfDay()
  }
  if (yesterday) {
    return getStartOfDay(getPastDay(1))
  }
  if (all) {
    return new Date(0)
  }
  return getFirstPastDateWithEntries(sheets)
}

export default getListSinceDate
