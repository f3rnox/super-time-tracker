import {
  setup,
  AtOption,
  HelpOption,
  EntryOption,
  SheetOption
} from '../../options'

export const CONFIG = {
  aliases: ['n'],
  command: 'note [note..]',
  describe: 'Attach a note to a sheet entry',
  builder: setup.bind(null, [SheetOption, EntryOption, AtOption, HelpOption])
}
