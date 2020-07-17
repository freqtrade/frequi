import axios from 'axios';

import { AuthPayload } from '../store/types';

const AUTH_REFRESH_TOKEN = 'auth_ref_token';
const AUTH_ACCESS_TOKEN = 'auth_access_token';
const AUTH_API_URL = 'auth_api_url';
const apiBase = '/api/v1';

export default {
  apiBase,
  AUTH_API_URL,
  setAPIUrl(apiurl: string): void {
    localStorage.setItem(AUTH_API_URL, JSON.stringify(apiurl));
  },

  setAccessToken(token: string): void {
    localStorage.setItem(AUTH_ACCESS_TOKEN, JSON.stringify(token));
  },

  setRefreshTokens(refreshToken: string): void {
    localStorage.setItem(AUTH_REFRESH_TOKEN, JSON.stringify(refreshToken));
  },

  logout(): void {
    console.log('Logging out');
    localStorage.removeItem(AUTH_REFRESH_TOKEN);
    localStorage.removeItem(AUTH_ACCESS_TOKEN);
    localStorage.removeItem(AUTH_API_URL);
  },

  async login(auth: AuthPayload) {
    //  Login using username / password
    const result = await axios.post(
      `${auth.url}/api/v1/token/login`,
      {},
      {
        auth: { ...auth },
      },
    );
    console.log(result.data);
    this.setAPIUrl(auth.url);
    if (result.data.access_token) {
      this.setAccessToken(result.data.access_token);
    }
    if (result.data.refresh_token) {
      this.setRefreshTokens(result.data.refresh_token);
    }
  },

  refreshToken(): Promise<string> {
    console.log('Refreshing token...');
    const token = JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${this.getAPIUrl()}/${apiBase}/token/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .then((response) => {
          if (response.data.access_token) {
            this.setAccessToken(response.data.access_token);
            // Return plain access token
            resolve(response.data.access_token);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.response && err.response.status === 401) {
            // in case of errors when using the refresh token - logout.
            this.logout();
          } else if (err.response && (err.response.status === 500 || err.response.status === 404)) {
            console.log('Bot seems to be offline... - retrying later');
            reject(err);
          }
        });
    });
  },

  loggedIn() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN) !== null;
  },

  getAPIUrl(): string {
    const apiUrl = JSON.parse(localStorage.getItem(AUTH_API_URL) || '{}');
    return typeof apiUrl === 'object' ? '' : apiUrl;
  },

  getAccessToken(): string {
    return JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN) || '{}');
  },

  getRefreshToken() {
    return JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
  },
};
