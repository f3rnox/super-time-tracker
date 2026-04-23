import { type Argv } from 'yargs'

import DB from '../../db'

export interface NoteCommandArgs {
  db: DB
  yargs: Argv
  at?: string
  help?: boolean
  entry?: number
  sheet?: string
  note: string[]
}
