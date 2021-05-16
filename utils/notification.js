import nodemailer from 'nodemailer';
import moment from 'moment';
import ejs from 'ejs';
import fs from 'fs';

import log from './log.js';

const send = (center, availabilities) => {
  log.info(center, 'Sending notification...');

  return new Promise((resolve, reject) => {
    fs.readFile('config.json', 'utf8', (err, config) => {
      if (err) {
        return log.error('Error loading config.json file: ' + err);
      }
      config = JSON.parse(config);

      fs.readFile(config.template, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        }

        let content = ejs.render(data, {
          center: center,
          availabilities: availabilities,
          moment: moment,
        });

        const transporter = nodemailer.createTransport({
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

        transporter
          .sendMail({
            from: '"Doctolib alerter" <' + config.smtp.mail + '>',
            bcc: config.notify,
            subject: center.name + ' disponible !',
            html: content,
          })
          .then(() => log.info(center, 'Notification sent!'))
          .then(resolve)
          .catch(reject);
      });
    });
  });
};

export default {
  send: send,
};
