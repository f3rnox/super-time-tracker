import {
  setup,
  AgoOption,
  HelpOption,
  FilterOption,
  SheetsOption,
  ConciseOption,
  AbsoluteOption,
  HumanizeOption,
  AllSheetsOption
} from '../../options'

export const CONFIG = {
  aliases: ['t'],
  command: 'today [sheets..]',
  describe: 'Display a summary of activity for today',
  builder: setup.bind(null, [
    SheetsOption,
    AbsoluteOption,
    AgoOption,
    HumanizeOption,
    ConciseOption,
    FilterOption,
    AllSheetsOption,
    HelpOption
  ])
}
