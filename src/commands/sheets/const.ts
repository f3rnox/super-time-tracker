import {
  setup,
  HelpOption,
  TodayOption,
  SinceOption,
  FilterOption,
  ConciseOption,
  HumanizeOption,
  YesterdayOption
} from '../../options'

export const CONFIG = {
  aliases: ['ss'],
  command: 'sheets',
  describe: 'List all sheets',
  builder: setup.bind(null, [
    HumanizeOption,
    SinceOption,
    TodayOption,
    YesterdayOption,
    ConciseOption,
    FilterOption,
    HelpOption
  ])
}
