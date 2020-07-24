import axios from 'axios';
import userService from './userService';

export const api = axios.create({
  baseURL: userService.apiBase,
  timeout: 5000,
  withCredentials: true,
});

/**
 * Initialize api so store is accessible.
 * @param store Vuex store
 */
export function init(store) {
  api.interceptors.request.use(
    (config) => {
      const custconfig = config;
      const token = userService.getAccessToken();
      // Append token to each request
      if (token) {
        // Merge custconfig dicts
        custconfig.headers = { ...config.headers, ...{ Authorization: `Bearer ${token}` } };
      }
      return custconfig;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    (err) => {
      console.log(err);
      if (err.response && err.response.status === 401) {
        console.log('Dispatching refresh_token...');
        return userService
          .refreshToken()
          .then((token) => {
            // Retry original request with new token
            const { config } = err;
            config.headers.Authorization = `Bearer ${token}`;

            return new Promise((resolve, reject) => {
              axios
                .request(config)
                .then((response) => {
                  resolve(response);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          })
          .catch((error) => {
            console.log('No new token received');
            console.log(error);
          });

        // maybe redirect to /login if needed !
      }
      if ((err.response && err.response.status === 500) || err.message === 'Network Error') {
        console.log('Bot seems to be offline...');
        store.dispatch('setIsBotOnline', false);
      }
      return new Promise((resolve, reject) => {
        reject(err);
      });
    },
  );
}

export function setBaseUrl(baseURL: string) {
  if (baseURL === null) {
    // Reset to "local" baseurl
    api.defaults.baseURL = userService.apiBase;
  } else if (!baseURL.endsWith(userService.apiBase)) {
    api.defaults.baseURL = `${baseURL}${userService.apiBase}`;
  } else {
    api.defaults.baseURL = `${baseURL}${userService.apiBase}`;
  }
}

setBaseUrl(userService.getAPIUrl());
