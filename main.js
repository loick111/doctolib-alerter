import moment from 'moment';
import yargs from 'yargs';
import check from './cmd/check.js';
import retrieve from './cmd/retrieve.js';

const params = yargs(process.argv.slice(2))
  .usage('Usage: $0 <command> [options]')

  // Commands
  .command(
    'check',
    'Check vaccination centers availability',
    {
      interval: {
        alias: 'i',
        description: 'Interval between two checks (in seconds)',
        default: -1,
      },
      startDate: {
        alias: 's',
        description: 'Check availabilities after provided date',
        default: -1,
      },
      daysFromToday: {
        alias: 'd',
        description: 'Numbers of days to wait for availabilities',
        default: -1,
      },
      forceNotify: {
        alias: 'f',
        description:
          'Force notification every time (could have multipe time the same mail)',
        default: false,
      },
    },
    (argv) =>
      check.run(
        argv.interval,
        argv.startDate,
        argv.daysFromToday,
        argv.forceNotify != false
      )
  )

  .command(
    'retrieve',
    'Retrieve vaccination centers',
    {
      postal_pattern: {
        alias: 'p',
        description: 'Postal code RegExp pattern',
        required: true,
      },
    },
    (argv) => retrieve.run(argv.postal_pattern)
  )

  // Mandatory options
  .demandCommand()

  .help('h')
  .alias('h', 'help').argv;
