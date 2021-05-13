import fetch from 'node-fetch';

import utils from '../utils/api.js';

const Availabilities = {
  getAll: (params) => {
    let url =
      'https://partners.doctolib.fr/availabilities.json' +
      utils.generateParams(params);

    return fetch(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
      method: 'GET',
    })
      .then(utils.checkStatus)
      .then((res) => res.json());
  },
};

const Booking = {
  get: (id) => {
    let url = 'https://partners.doctolib.fr/booking/' + id + '.json';

    return fetch(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
      method: 'GET',
    })
      .then(utils.checkStatus)
      .then((res) => res.json());
  },
};

export default {
  Availabilities: Availabilities,
  Booking: Booking,
};
