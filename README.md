# super-time -- A CLI Time Tracker

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
![CI GitHub Workflow Status](https://github.com/f3rnox/super-time/actions/workflows/ci.yml/badge.svg)

[**super-time**](https://npmjs.com/package/super-time) is a Node.JS CLI
utility for tracking tasks in time sheets, inspired by ruby's
[**timetrap**](https://github.com/samg/timetrap) (sadly not maintained).

It supports natural language specification of entry start and end times,
allowing you to check out of entries retroactively, or check in after already
starting a task without leaving any time untracked. The database is a JSON file
stored in your home folder, at `~/.super-time/db.json`.

## Example Usage

Below are a few example commands to illustrate the usual workflow for managing
and viewing time sheet entries.

```bash
stt sheet work
stt in --at '2 hours and 24 minutes ago' crafting something
stt note pair with alice on the widget
stt out
stt list --since '4 hours ago'
stt today
stt week
```

## Installation

**super-time** is available as an [**NPM**](https://npmjs.com/package/super-time)
package; install it with your package manager of choice. For example, if you
use npm, run `npm i -g super-time`.

Once installed, it will be available as the **stt** command.

## Commands

**super-time** provides commands for both managing time sheet entries, and
viewing historical activity in a variety of ways. To see a full list, run
**`stt --help`**.

### Managing Time Sheets and Entries

The examples listed below use the shorthand command aliases (i.e. **`e`** is
the alias for the **`edit`** command). To view all command aliases, consult
**`stt --help`**.

- **`stt ss`** -- view a list of all time sheets. Supports `--today`,
`--yesterday`, `--since <natural language time>`, `--filter <substring>`, and
`--concise`.
- **`stt s <sheet name>`** -- switch to a sheet by name. It will be automatically
created if it does not already exist.
- **`stt s --rename <new name>`** -- rename the active sheet (or any sheet
specified by name).
- **`stt s <sheet name> --delete`** -- delete a sheet by name.

- **`stt i <description>`** -- start a new entry with the given description.
- **`stt i --at '<natural language time>'`** -- start a new entry at a custom
time.
- **`stt i --sheet <sheet name> <description>`** -- start a new entry on a
specific sheet (creating it if it does not exist).
- **`stt i --tags @foo @bar <description>`** -- attach explicit tags to the new
entry in addition to any `@tag` tokens found in the description.
- **`stt i --note 'kickoff thought' <description>`** -- create the entry with an
initial note already attached.

- **`stt o --at '<natural language time>'`** -- check out of the current entry at
a specified time.
- **`stt o --sheet <sheet name>`** -- check out of the active entry on a
specific sheet.
- **`stt o --note 'final thought'`** -- append a final note when checking out.

- **`stt n <note text>`** -- attach a timestamped note to the active entry on
the active sheet.
- **`stt n --sheet <sheet name> --entry <id> <note text>`** -- attach a note to
a specific entry on a specific sheet. **`--at '<natural language time>'`**
back-dates the note timestamp.

- **`stt e <description>`** -- edit the active entry's description.
- **`stt e --entry 32 --delete`** -- delete an entry by ID (retrieve the ID
with **`stt list`**).
- **`stt e --entry 32 --start '10am' --end '11:30am'`** -- rewrite an entry's
start and/or end times from natural language input.
- **`stt e --entry 32 --tags @new @tags`** -- replace an entry's tag set.
- **`stt e --sheet <sheet name> --name <new sheet name>`** -- change the name
of a time sheet.

- **`stt r`** -- resume (clone) the most recent entry as a fresh active entry.
- **`stt r --entry <id>`** -- resume a specific previous entry by ID.
- **`stt r --sheet <sheet name>`** -- resume on a different sheet.
- **`stt r --at '<natural language time>' --tags @foo <description override>`**
-- resume with an overridden start time, tag set, or description.

### View Historical Activity

Several commands are available to consult the database, either per-sheet or for
all sheets together.

- **`stt now`** (the default command, also **`stt`**) -- show the active entry
for the active sheet; pass **`--all`** to show active entries across every
sheet that has one.
- **`stt l`** -- list sheet entries for the previous 24 hours; provide
`--all-sheets` to view entries for all sheets at once.
Passing `--since <natural language time>` will set the start date from which to
list entries, while passing `--all` will list sheets from the start of time.
**`--filter <substring>`** narrows by description, **`--concise`** suppresses
start and end columns, and **`-r`** renders dates as "N minutes ago" instead of
absolute timestamps. This command has many arguments, for a full list see
**`stt l --help`**.
- **`stt w`** -- view a breakdown of activity for the past week. Accepts
**`--total`** for a single per-day aggregate, **`--since`** to override the
7-day window, **`--all-sheets`**, and **`--filter`**.
- **`stt t`** -- view a list of entries from today. Accepts **`--filter`** and
**`--concise`**.
- **`stt y`** -- view a list of entries from yesterday. Accepts **`--filter`**
and **`--concise`**.
- **`stt b`** -- view a breakdown of activity by day, weekday and hour. Accepts
**`--today`**, **`--yesterday`**, **`--since`**, **`--all-sheets`**, and
**`--filter`**.

### Useful Flags

Nearly all commands allow durations to be displayed in a human-readable format
with the **`-h`** flag (for example, rendering *1:36:18* as
*1 hour, 36 minutes*), and dates and times to be shown as relative to the
current time with the **`-r`** flag (converting *2/5/2024, 5:49:44 PM* to
*3 hours ago*).

## Help Reference

For reference, the full output of **`stt --help`** is reproduced below:

```text
super-time now

Display all active time sheet entries

Commands:
  super-time in [description..]      Check in to a time sheet     [aliases: i]
  super-time now                     Display all active time sheet entries
                                                                       [default]
  super-time out                     Check out of the active time sheet entry
                                                                    [aliases: o]
  super-time note [note..]           Attach a note to a sheet entry
                                                                    [aliases: n]
  super-time week [sheets..]         Display a summary of activity for the past
                                         week                       [aliases: w]
  super-time list [sheets..]         List all time sheet entries  [aliases: l]
  super-time edit [description..]    View, edit, or delete a time sheet entry
                                                                    [aliases: e]
  super-time today [sheets..]        Display a summary of activity for today
                                                                    [aliases: t]
  super-time sheet [name]            Switch to, create, rename, or delete a
                                         sheet                      [aliases: s]
  super-time sheets                  List all sheets             [aliases: ss]
  super-time resume [description..]  Start a new entry from a previous one
                                                                    [aliases: r]
  super-time yesterday [sheets..]    Display a summary of activity for
                                         yesterday                  [aliases: y]
  super-time breakdown [sheets..]    Display total durations per day, weekday,
                                         and hour                   [aliases: b]

Options:
      --version   Show version number                                  [boolean]
  -h, --humanize  Print the total duration in human-readable format    [boolean]
      --help      Show help                                            [boolean]

Examples:
  stt in --at "20 minutes ago" fixing a bug  Check in at a custom time
  stt out --at "5 minutes ago"               Check out at a custom time
  stt note pair with alice on the widget     Attach a note to the active entry
  stt list --today --all                     View all entries from today
  stt b                                      Show a breakdown of your activity
  stt today --all                            View activity for the current day
```

## Release History

See [*CHANGELOG.md*](/CHANGELOG.md) for more information.

## License

Distributed under the **MIT** license. See [*LICENSE.md*](/LICENSE.md)
for more information.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

[npm-image]: https://img.shields.io/npm/v/super-time.svg?style=flat-square
[npm-url]: https://npmjs.org/package/super-time
[npm-downloads]: https://img.shields.io/npm/dm/super-time.svg?style=flat-square
