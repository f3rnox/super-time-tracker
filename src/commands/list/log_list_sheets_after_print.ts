import _map from 'lodash/map'
import _sum from 'lodash/sum'

import log from '../../log'
import { clDuration, clHighlight, clHighlightRed, clText } from '../../color'
import { type TimeSheet } from '../../types'
import { getDurationLangString } from '../../utils'

/**
 * After listing sheets, logs totals when `--all` is set, or a hint to use `--all` otherwise.
 * @param options - All flag, result sheets, and database sheet count
 */
const logListSheetsAfterPrint = (options: {
  all: boolean | undefined
  filteredSheets: TimeSheet[]
  totalDbSheets: number
  humanize: boolean | undefined
}): void => {
  const { all, filteredSheets, totalDbSheets, humanize } = options

  if (all) {
    const totalDuration = _sum(
      filteredSheets.map(({ entries }) =>
        _sum(
          entries.map(({ end, start }) =>
            end === null ? Date.now() - +start : +end - +start
          )
        )
      )
    )
    const totalDurationUI = getDurationLangString(totalDuration, humanize)
    const totalEntryCount = _sum(_map(filteredSheets, 'entries.length'))

    log('')
    log(
      `${clText('* Total tracked duration:')} ${clDuration(
        '[' + totalDurationUI + ']'
      )}`
    )
    log(
      `${clText('* Total entry count:')} ${clHighlight(String(totalEntryCount))}`
    )
    return
  }

  const sheetsNotShownCount = totalDbSheets - filteredSheets.length

  log('')
  log(
    `${clText('*')} ${clHighlightRed(
      String(sheetsNotShownCount)
    )} ${clText('Sheets not shown')}. ${clText('use')} ${clHighlightRed(
      '--all'
    )} ${clText('to show')}`
  )
}

export default logListSheetsAfterPrint
