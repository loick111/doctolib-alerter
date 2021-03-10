import moment from "moment";

const log = (level, msg) => {
  if (level.toLowerCase() == "ERROR" || level.toLowerCase() == "FATAL") {
    console.error("[" + moment().toISOString() + "] [" + level + "] " + msg);
  } else {
    console.log("[" + moment().toISOString() + "] [" + level + "] " + msg);
  }
};

const info = (center, msg) => {
  log("INFO", "[" + center.name + "] " + msg);
};

const error = (center, msg) => {
  log("ERROR", "[" + center.name + "] " + msg);
};

export default {
  log: log,
  info: info,
  error: error,
};

let test = {
  visit_motive_ids: 2595649,
  agenda_ids: 413051,
  practice_ids: 165729, //found
  profileId: 243757, //found
};
