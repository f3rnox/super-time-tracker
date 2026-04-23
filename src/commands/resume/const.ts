import {
  setup,
  AtOption,
  TagsOption,
  HelpOption,
  EntryOption,
  SheetOption,
  DescriptionOption
} from '../../options'

export const CONFIG = {
  aliases: ['r'],
  command: 'resume [description..]',
  describe: 'Start a new entry from a previous one',
  builder: setup.bind(null, [
    SheetOption,
    EntryOption,
    AtOption,
    TagsOption,
    DescriptionOption,
    HelpOption
  ])
}
