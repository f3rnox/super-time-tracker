import { type Argv } from 'yargs'

import DB from '../../db'

export interface NowCommandArgs {
  db: DB
  yargs: Argv
  all?: boolean
  help?: boolean
  humanize?: boolean
  allSheets?: boolean
}
