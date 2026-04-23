import { type Argv } from 'yargs'

import DB from '../../db'

export interface YesterdayCommandArgs {
  db: DB
  yargs: Argv
  ago?: boolean
  all?: boolean
  help?: boolean
  filter?: string
  concise?: boolean
  sheets?: string[]
  absolute?: boolean
  humanize?: boolean
  allSheets?: boolean
}
