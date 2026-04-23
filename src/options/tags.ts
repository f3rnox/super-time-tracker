import { type YArgsOptionDefinition } from '../types'

const TAGS_OPTION: YArgsOptionDefinition = [
  'tags',
  {
    alias: ['t'],
    describe: 'Tags to associate with the entry',
    type: 'array'
  }
]

export default TAGS_OPTION
