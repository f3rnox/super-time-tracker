import {
  setup,
  AtOption,
  TagsOption,
  HelpOption,
  SheetOption,
  NoteOption,
  DescriptionOption
} from '../../options'

export const CONFIG = {
  aliases: ['i'],
  command: 'in [description..]',
  describe: 'Check in to a time sheet',
  builder: setup.bind(null, [
    AtOption,
    SheetOption,
    TagsOption,
    NoteOption,
    DescriptionOption,
    HelpOption
  ])
}
