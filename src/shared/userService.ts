import axios from 'axios';

const AUTH_REF_TOKEN = 'auth_ref_token';
const AUTH_ACCESS_TOKEN = 'auth_access_token';
const AUTH_API_URL = 'auth_api_url';

export default {
  setAPIUrl(apiurl) {
    localStorage.setItem(AUTH_API_URL, JSON.stringify(apiurl));
  },

  setAccessToken(token) {
    localStorage.setItem(AUTH_ACCESS_TOKEN, JSON.stringify(token));
  },

  setRefreshTokens(refreshToken) {
    localStorage.setItem(AUTH_REF_TOKEN, JSON.stringify(refreshToken));
  },

  logout() {
    console.log('Logging out');
    localStorage.removeItem(AUTH_REF_TOKEN);
    localStorage.removeItem(AUTH_ACCESS_TOKEN);
    localStorage.removeItem(AUTH_API_URL);
  },

  login(auth) {
    //  Login using username / password
    console.log(auth);
    axios
      .post(
        `${auth.url}/api/v1/token/login`,
        {},
        {
          auth: { ...auth },
        },
      )
      .then((result) => {
        console.log(result.data);
        this.setAPIUrl(auth.url);
        if (result.data.access_token) {
          this.setAccessToken(result.data.access_token);
        }
        if (result.data.refresh_token) {
          this.setRefreshTokens(result.data.refresh_token);
        }
      })
      .catch(console.error);
  },

  refreshToken() {
    console.log('Refreshing token...');
    const token = JSON.parse(localStorage.getItem(AUTH_REF_TOKEN) || '{}');
    const apiurl = this.getAPIUrl();
    console.log(apiurl);
    axios
      .post(
        `${this.getAPIUrl()}/token/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((result) => {
        if (result.data.access_token) {
          this.setAccessToken(result.data.access_token);
        }
      })
      .catch((error) => {
        console.error(error);
        // in case of errors when using the refresh token - logout.
        this.logout();
      });
  },

  loggedIn() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN) !== null;
  },

  getAPIUrl() {
    return JSON.parse(localStorage.getItem(AUTH_API_URL) || '{}');
  },

  getAccessToken() {
    return JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN) || '{}');
  },

  getRefreshToken() {
    return JSON.parse(localStorage.getItem(AUTH_REF_TOKEN) || '{}');
  },

  getAuthHeader() {
    let result = {};
    const accessToken = this.getAccessToken();

    if (accessToken) {
      result = {
        Authorization: `Bearer ${accessToken}`,
      };
    } else {
      console.log('user not logged in');
    }
    return result;
  },
};
