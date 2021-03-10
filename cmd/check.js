import moment from "moment";
import fs from "fs";

import config from "../config.json";
import log from "../utils/log.js";
import notification from "../utils/notification.js";
import doctolib from "../api/doctolib.js";

const checkAvailabilities = (center) => {
  const baseParams = {
    start_date: moment().format("YYYY-MM-DD"),
    insurance_sector: "public",
    destroy_temporary: true,
    allowNewPatients: true,
    telehealth: false,
    isOrganization: true,
    telehealthFeatureEnabled: false,
    vaccinationMotive: true,
    vaccinationDaysRange: 25,
    vaccinationCenter: true,
    limit: 30,
  };

  return doctolib.Availabilities.getAll({
    ...baseParams,
    ...center.params,
  }).then((data) => {
    let availabilities = data.availabilities.filter((a) => a.slots.length > 0);

    if (availabilities.length > 0) {
      log.info(center, "Availability found!");
      notification.send(center, data.availabilities);
    } else {
      log.info(center, "No availability");
    }
  });
};

const check = (centers, interval) => {
  return Promise.all(centers.map((center) => checkAvailabilities(center)))
    .then(() => log.log("INFO", "Sleep for " + interval + " seconds..."))
    .catch((err) => log.error(center, err));
};

const run = (interval) => {
  fs.readFile(config.centersFile, "utf8", (err, data) => {
    if (err) {
      return log.error("Loading error: " + err);
    }

    let centers = JSON.parse(data);

    check(centers, interval);
    setInterval(() => {
      check(centers, interval);
    }, interval * 1000);
  });
};

export default {
  run: run,
};
