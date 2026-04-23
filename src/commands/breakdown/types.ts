import { type Argv } from 'yargs'

import DB from '../../db'
import { TimeSheet, TimeSheetEntry } from '../../types/data'

export interface BreakdownCommandArgs {
  db: DB
  yargs: Argv
  ago?: boolean
  all?: boolean
  help?: boolean
  since?: string
  today?: boolean
  filter?: string
  sheets?: string[]
  humanize?: boolean
  allSheets?: boolean
  yesterday?: boolean
}

export interface BreakdownResult {
  date: Date
  duration: number
  sheets: TimeSheet[]
  entries: TimeSheetEntry[]
}

export type BreakdownResults = Record<string, BreakdownResult>
