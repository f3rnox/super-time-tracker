import { type YArgsOptionDefinition } from '../types'

const RENAME_OPTION: YArgsOptionDefinition = [
  'rename',
  {
    alias: ['r'],
    describe: 'New name to rename the specified sheet to',
    type: 'string'
  }
]

export default RENAME_OPTION
