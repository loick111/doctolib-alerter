import moment from "moment";
import fs from "fs";

import config from "../config.json";
import log from "../utils/log.js";
import notification from "../utils/notification.js";
import doctolib from "../api/doctolib.js";

// object to save "already notified" flags
var notifiedFlags = {};

const checkAvailabilities = (centers, interval) => {
  return Promise.all(
    centers.map((center) =>
      doctolib.Availabilities.getAll({
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
        ...center.params,
      })
    )
  )
    .then((data) => {
      data.map((av, i) => {
        const center = centers[i];

        const availabilities = av.availabilities.filter(
          (a) => a.slots.length > 0
        );

        if (availabilities.length > 0) {
          log.info(center, "Availability found!");

          // skip notification if already notified
          if (notifiedFlags[center.id] == true) {
            return;
          }

          notification
            .send(center, av.availabilities)
            .then(() => (notifiedFlags[center.id] = true)); // set flag to notified
        } else {
          log.info(center, "No availability");
          notifiedFlags[center.id] = false; // remove flag
        }
      });
    })
    .catch(console.error);
};

const run = (interval) => {
  fs.readFile(config.centersFile, "utf8", (err, data) => {
    if (err) {
      return log.error("Loading error: " + err);
    }

    const centers = JSON.parse(data);

    checkAvailabilities(centers, interval);

    // check loop if interval is provided
    if (interval >= 0) {
      log.log("INFO", "Sleep for " + interval + " seconds...");

      setInterval(() => {
        checkAvailabilities(centers, interval);
        log.log("INFO", "Sleep for " + interval + " seconds...");
      }, interval * 1000);
    }
  });
};

export default {
  run: run,
};
