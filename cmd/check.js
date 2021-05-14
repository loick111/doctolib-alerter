import moment from 'moment';
import fs from 'fs';

import config from '../config.json';
import log from '../utils/log.js';
import notification from '../utils/notification.js';
import doctolib from '../api/doctolib.js';

// object to save "already notified" flags
var notifiedFlags = {};

const checkAvailabilities = (
  centers,
  startDate,
  daysFromToday,
  forceNotify
) => {
  return Promise.all(
    centers.map((center) =>
      doctolib.Availabilities.getAll({
        start_date: moment(startDate).format('YYYY-MM-DD'),
        insurance_sector: 'public',
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

        const availabilities = av.availabilities
          .filter((a) => {
            if (daysFromToday == -1) {
              return true;
            }

            const duration = moment.duration(
              moment(a.date).diff(moment(startDate))
            );

            if (duration.asDays() > -1 && duration.asDays() <= daysFromToday) {
              return true;
            }

            return false;
          })
          .filter((a) => a.slots.length > 0);

        if (availabilities.length > 0) {
          log.info(center, 'Availability found!');

          // skip notification if already notified
          // continue if forced
          if (notifiedFlags[center.id] == true && forceNotify == false) {
            return;
          }

          notification
            .send(center, availabilities)
            .then(() => (notifiedFlags[center.id] = true)); // set flag to notified
        } else {
          log.info(center, 'No availability');
          notifiedFlags[center.id] = false; // remove flag
        }
      });
    })
    .catch(console.error);
};

const run = (interval, startDate, daysFromToday, forceNotify) => {
  fs.readFile(config.centersFile, 'utf8', (err, data) => {
    if (err) {
      return log.error('Loading error: ' + err);
    }

    const centers = JSON.parse(data);

    checkAvailabilities(centers, startDate, daysFromToday, forceNotify);

    // check loop if interval is provided
    if (interval >= 0) {
      log.log('INFO', 'Sleep for ' + interval + ' seconds...');

      setInterval(() => {
        checkAvailabilities(centers, startDate, daysFromToday, forceNotify);
        log.log('INFO', 'Sleep for ' + interval + ' seconds...');
      }, interval * 1000);
    }
  });
};

export default {
  run: run,
};
