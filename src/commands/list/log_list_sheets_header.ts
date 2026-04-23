import sAgo from 's-ago'

import log from '../../log'
import { clDate, clHighlight, clText } from '../../color'

/**
 * Logs a one-line description of the list scope (today, undated, or since).
 * @param options - What to print and how
 */
const logListSheetsHeader = (options: {
  today: boolean | undefined
  sinceDate: Date | null
  filteredCount: number
}): void => {
  const { today, sinceDate, filteredCount } = options
  const count = String(filteredCount)

  if (today) {
    log(
      `${clText('* Showing')} ${clHighlight(count)} ${clText('sheets for today')}`
    )
    return
  }
  if (sinceDate === null) {
    log(`${clText('* Showing')} ${clHighlight(count)} ${clText('sheets')}`)
    return
  }
  log(
    `${clText('* Showing sheets since')} ${clHighlight(
      sinceDate.toLocaleString()
    )} ${clDate('[' + sAgo(sinceDate) + ']')}`
  )
}

export default logListSheetsHeader
