import fs from "fs";

import config from "../config.json";
import gouv from "../api/gouv.js";
import doctolib from "../api/doctolib.js";

const run = (postalPattern) => {
  gouv.getVaccinationCenters().then((data) => {
    let centers = data.features
      .filter((f) =>
        f.properties.c_com_cp.match(new RegExp(postalPattern, "g"))
      ) // filter by postal code
      .filter((f) => !f.properties.c_nom.match(/réservé/i)) // remove professional only
      .filter((f) => f.properties.c_rdv_site_web.match(/doctolib/g)) // only doctolib
      .map((center) => ({
        id: center.properties.c_rdv_site_web
          .replace(/http(s)?\:\/\/(\w|\.)*\/(\w|-)*\/(\w|-)*\//g, "")
          .replace(/\//g, "")
          .replace(/\?.*/g, ""),
        name: center.properties.c_nom,
        cp: center.properties.c_com_cp,
        city: center.properties.c_com_nom,
        link: center.properties.c_rdv_site_web,
      }));

    Promise.all(centers.map((center) => doctolib.Booking.get(center.id)))
      .then((data) => {
        let fullCenters = data.map((booking, i) => ({
          ...centers[i],
          booking: booking,
        }));

        let regExpFirstInjection = /^1ère injection/g;

        let bookable = fullCenters
          .filter(
            (c) =>
              !c.booking.data.profile.name_with_title_and_determiner.match(
                /réservé/i
              )
          ) // remove professional only
          .filter(
            (center) =>
              center.booking.data.visit_motives.filter(
                (vm) =>
                  vm.name.match(regExpFirstInjection) != null &&
                  vm.allow_new_patients_on_insurance_sector != "private"
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

        let file = bookable.map((b) => ({
          id: b.center.id,
          name: b.center.name,
          city: b.center.city,
          cp: b.center.cp,
          link: b.center.link,
          params: {
            visit_motive_ids: b.visitMotive.id,
            agenda_ids: b.agendas.map((a) => a.id).join("-"),
            practice_ids: b.agendas
              .map((a) => a.practice_id)
              .filter((v, i, a) => a.indexOf(v) === i)
              .join("-"),
            profileId: b.center.booking.data.profile.id,
          },
        }));

        let json = JSON.stringify(file);

        console.log(json);
        fs.writeFile(config.centersFile, json, (err) => {
          if (err) {
            console.error(err);
          }
        });
      })
      .catch(console.error);
  });
};

export default {
  run: run,
};
