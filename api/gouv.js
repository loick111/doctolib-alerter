import fetch from 'node-fetch';
import utils from '../utils/api.js';

const getVaccinationCenters = () => {
  return fetch(
    'https://www.data.gouv.fr/fr/datasets/r/d0566522-604d-4af6-be44-a26eefa01756',
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json; charset=utf-8',
      },
      method: 'GET',
    }
  )
    .then(utils.checkStatus)
    .then((res) => res.json());
};

export default {
  getVaccinationCenters: getVaccinationCenters,
};
