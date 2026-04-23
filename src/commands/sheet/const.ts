import {
  setup,
  HelpOption,
  NameOption,
  DeleteOption,
  RenameOption
} from '../../options'

export const CONFIG = {
  aliases: ['s'],
  command: 'sheet [name]',
  describe: 'Switch to, create, rename, or delete a sheet',
  builder: setup.bind(null, [
    DeleteOption,
    NameOption,
    RenameOption,
    HelpOption
  ])
}
