import axios from 'axios';
import { UserService } from './userService';

/**
 * Global store variable - keep a reference here to be able to emmit alerts
 */
let globalStore;

export function useApi(userService: UserService) {
  const api = axios.create({
    baseURL: userService.getBaseUrl(),
    timeout: 10000,
    withCredentials: true,
  });
  // Sent auth headers interceptor
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
      // console.log(err);
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
        console.log('Bot not running...');
        globalStore.dispatch('setIsBotOnline', false);
      }

      return new Promise((resolve, reject) => {
        reject(err);
      });
    },
  );

  return {
    api,
  };
}

/**
 * Initialize api so store is accessible.
 * @param store Vuex store
 */
export function initApi(store) {
  globalStore = store;
  //
}
