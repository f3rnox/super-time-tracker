import { type Argv } from 'yargs'

import DB from '../../db'

export interface ResumeCommandArgs {
  db: DB
  yargs: Argv
  at?: string
  help?: boolean
  entry?: number
  sheet?: string
  tags?: string[]
  description?: string[]
}
