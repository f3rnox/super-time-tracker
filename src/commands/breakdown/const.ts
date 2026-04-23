import {
  setup,
  AgoOption,
  HelpOption,
  TodayOption,
  SinceOption,
  FilterOption,
  SheetsOption,
  HumanizeOption,
  YesterdayOption,
  AllSheetsOption
} from '../../options'

export const CONFIG = {
  aliases: ['b'],
  command: 'breakdown [sheets..]',
  describe: 'Display total durations per day, weekday, and hour',
  builder: setup.bind(null, [
    SheetsOption,
    AllSheetsOption,
    AgoOption,
    HumanizeOption,
    SinceOption,
    TodayOption,
    YesterdayOption,
    FilterOption,
    HelpOption
  ])
}
