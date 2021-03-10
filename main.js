import yargs from "yargs";
import check from "./cmd/check.js";
import retrieve from "./cmd/retrieve.js";

const params = yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")

  // Commands
  .command(
    "check",
    "Check vaccination centers availability",
    {
      interval: {
        alias: "i",
        description: "Interval between two checks (in seconds)",
        required: true,
      },
    },
    (argv) => check.run(argv.interval)
  )

  .command(
    "retrieve",
    "Retrieve vaccination centers",
    {
      postal_pattern: {
        alias: "p",
        description: "Postal code RegExp pattern",
        required: true,
      },
    },
    (argv) => retrieve.run(argv.postal_pattern)
  )

  // Mandatory options
  .demandCommand()

  .help("h")
  .alias("h", "help").argv;
