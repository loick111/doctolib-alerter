import fs from 'fs';

import config from '../config.json';
import gouv from '../api/gouv.js';
import doctolib from '../api/doctolib.js';
import { URL } from 'url';

const run = (postalPattern) => {
  gouv
    .getVaccinationCenters()
    .then((data) => {
      // create centers objects
      let centers = data.features
        .filter((f) =>
          f.properties.c_com_cp?.match(new RegExp(postalPattern, 'g'))
        ) // filter by postal code
        .filter((f) => !f.properties.c_nom.match(/réservé/i)) // remove professional only
        .filter((f) => f.properties.c_rdv_site_web?.match(/doctolib.fr/g)) // only doctolib
        .map((center) => {
          const url = new URL(center.properties.c_rdv_site_web);
          const id = url.pathname.split('/').pop();
          const practiceId = url.searchParams
            .get('pid')
            ?.replace('practice-', '')
            .replace(/\?.*/g, ''); // fix to remove bad formatted params
          const specialityId = url.searchParams.get('speciality_id');

          return {
            id: id,
            practiceId: practiceId || null,
            specialityId: specialityId,
            name: center.properties.c_nom,
            cp: center.properties.c_com_cp,
            city: center.properties.c_com_nom,
            link: center.properties.c_rdv_site_web,
          };
        });

      // get centers details on doctolib
      Promise.all(centers.map((center) => doctolib.Booking.get(center.id)))
        .then((data) => {
          let fullCenters = data.map((booking, i) => ({
            ...centers[i],
            booking: booking,
          }));

          let regExpFirstInjection = /^1re injection/g;

          // filter only wanted centers
          let bookable = fullCenters
            .filter(
              (c) =>
                !c.booking.data.profile.name_with_title_and_determiner?.match(
                  /réservé/i
                )
            ) // remove professional only
            .filter(
              (center) =>
                center.booking.data.visit_motives.filter(
                  (vm) =>
                    vm.name.match(regExpFirstInjection) != null &&
                    vm.allow_new_patients_on_insurance_sector != 'private' // remove professional only
                ).length > 0
            )
            .map((center) => {
              let visitMotive = center.booking.data.visit_motives.find((vm) =>
                vm.name.match(regExpFirstInjection)
              );

              let agendas = center.booking.data.agendas
                .filter((a) => a.booking_disabled == false)
                .filter((a) => a.booking_temporary_disabled == false)
                .filter((a) => a.visit_motive_ids.includes(visitMotive.id));

              return {
                center: center,
                visitMotive: visitMotive,
                agendas: agendas,
              };
            });

          // generate output
          let output = bookable
            .map((b) => {
              let agendas = b.agendas;

              // filter by practice id (if exists in center data)
              if (b.center.practiceId) {
                agendas = agendas.filter(
                  (a) => a.practice_id == b.center.practiceId
                );
              }

              const agenda_ids = agendas.map((a) => a.id).join('-');
              const practice_ids = agendas
                .map((a) => a.practice_id)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join('-');

              return {
                id: b.center.id,
                name: b.center.name,
                city: b.center.city,
                cp: b.center.cp,
                link: b.center.link,
                params: {
                  visit_motive_ids: b.visitMotive.id,
                  agenda_ids: agenda_ids,
                  practice_ids: practice_ids,
                  profileId: b.center.booking.data.profile.id,
                },
              };
            })
            .filter(
              (center) =>
                center.params.agenda_ids.length > 0 &&
                center.params.practice_ids.length > 0
            );

          // export centers to file
          let outputJSON = JSON.stringify(output, null, 2);
          console.log(outputJSON);
          fs.writeFile(config.centersFile, outputJSON, (err) => {
            if (err) {
              console.error(err);
            }
          });
        })
        .catch(console.error);
    })
    .catch(console.error);
};

export default {
  run: run,
};
