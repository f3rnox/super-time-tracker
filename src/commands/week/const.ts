import {
  setup,
  AgoOption,
  HelpOption,
  SinceOption,
  TotalOption,
  FilterOption,
  SheetsOption,
  HumanizeOption,
  AllSheetsOption
} from '../../options'

export const CONFIG = {
  aliases: ['w'],
  command: 'week [sheets..]',
  describe: 'Display a summary of activity for the past week',
  builder: setup.bind(null, [
    TotalOption,
    AgoOption,
    HumanizeOption,
    SheetsOption,
    AllSheetsOption,
    SinceOption,
    FilterOption,
    HelpOption
  ])
}
