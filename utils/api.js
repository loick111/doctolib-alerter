const checkStatus = (res) => {
  if (!res.ok) {
    throw Error(res.statusText);
  }

  return res;
};

const generateParams = (params) => {
  let url = '';

  if (Object.keys(params).length > 0) {
    url = '?' + new URLSearchParams(params);
  }

  return url;
};

export default {
  checkStatus: checkStatus,
  generateParams: generateParams,
};
