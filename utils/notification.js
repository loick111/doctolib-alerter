import nodemailer from "nodemailer";
import moment from "moment";
import ejs from "ejs";
import fs from "fs";

import config from "../config.json";
import log from "./log.js";

let transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.mail,
    pass: config.smtp.password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const send = (center, availabilities) => {
  log.info(center, "Sending notification...");

  fs.readFile(config.template, "utf8", (err, data) => {
    if (err) {
      return log.error("Notification error: " + err);
    }

    let content = ejs.render(data, {
      center: center,
      availabilities: availabilities,
      moment: moment,
    });

    transporter
      .sendMail({
        from: '"Doctolib alerter" <' + config.smtp.mail + ">",
        bcc: config.notify,
        subject: center.name + " disponible !",
        html: content,
      })
      .then(() => log.info(center, "Notification sent!"))
      .catch((err) => log.error(center, err));
  });
};

export default {
  send: send,
};
