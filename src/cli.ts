#!/usr/bin/env node

import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import { type Argv, type CommandModule } from 'yargs'
import updateNotifier from 'simple-update-notifier'

import DB from './db'
import log from './log'
import * as C from './color'
import commands from './commands'

import pkg from '../package.json'

updateNotifier({ pkg })

const { DEBUG, NODE_ENV } = process.env
const PRINT_TRACES = DEBUG || !_isEmpty(DEBUG) || NODE_ENV === 'development'

type YargsFactory = (args?: readonly string[]) => Argv

/**
 * Loads yargs in both CommonJS and ESM runtimes.
 */
const loadYargsFactory = async (): Promise<YargsFactory> => {
  const yargsModule = (await import('yargs')) as { default?: YargsFactory }

  if (!_isUndefined(yargsModule.default)) {
    return yargsModule.default
  }

  throw new Error('Failed to load yargs default export')
}

/**
 * Bootstraps and executes the CLI command parser.
 */
const runCli = async (): Promise<void> => {
  const yargsFactory = await loadYargsFactory()
  const y = yargsFactory(process.argv.slice(2))
    .scriptName('super-time-tracker')
    .middleware(async (argv) => {
      const db = new DB()

      await db.load()

      argv.db = db
      argv.yargs = y
    })
    .fail((_, error: Error): void => {
      if (!_isUndefined(error)) {
        const errMessage = PRINT_TRACES ? error.stack : error.message

        log(`${C.clHighlight('Error:')} ${errMessage}`)
      }

      process.exit(1)
    })
    .help(false)
    .version()
    .recommendCommands()
    .example(
      'stt in --at "20 minutes ago" fixing a bug',
      'Check in at a custom time'
    )
    .example('stt out --at "5 minutes ago"', 'Check out at a custom time')
    .example('stt list --today --all', 'View all entries from today')
    .example('stt b', 'Show a breakdown of your activity')
    .example('stt today --all', 'View activity for the current day')

  commands.forEach((def) => {
    y.command(def as unknown as CommandModule)
  })

  await y.parse()
}

runCli()
