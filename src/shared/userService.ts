import axios from 'axios';

import { AuthPayload } from '@/types';

const AUTH_REFRESH_TOKEN = 'auth_ref_token';
const AUTH_ACCESS_TOKEN = 'auth_access_token';
const AUTH_API_URL = 'auth_api_url';
const APIBASE = '/api/v1';

export class UserService {
  private setAPIUrl(apiurl: string): void {
    localStorage.setItem(AUTH_API_URL, JSON.stringify(apiurl));
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(AUTH_ACCESS_TOKEN, JSON.stringify(token));
  }

  private setRefreshTokens(refreshToken: string): void {
    localStorage.setItem(AUTH_REFRESH_TOKEN, JSON.stringify(refreshToken));
  }

  public logout(): void {
    console.log('Logging out');
    localStorage.removeItem(AUTH_REFRESH_TOKEN);
    localStorage.removeItem(AUTH_ACCESS_TOKEN);
    localStorage.removeItem(AUTH_API_URL);
  }

  public async login(auth: AuthPayload) {
    //  Login using username / password
    const result = await axios.post(
      `${auth.url}/api/v1/token/login`,
      {},
      {
        auth: { ...auth },
      },
    );
    console.log(result.data);
    if (result.data.access_token) {
      this.setAPIUrl(auth.url);
      this.setAccessToken(result.data.access_token);
    }
    if (result.data.refresh_token) {
      this.setRefreshTokens(result.data.refresh_token);
    }
  }

  public refreshToken(): Promise<string> {
    console.log('Refreshing token...');
    const token = JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${this.getAPIUrl()}${APIBASE}/token/refresh`,
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
  }

  public loggedIn() {
    return localStorage.getItem(AUTH_ACCESS_TOKEN) !== null;
  }

  private getAPIUrl(): string {
    const apiUrl = JSON.parse(localStorage.getItem(AUTH_API_URL) || '{}');
    return typeof apiUrl === 'object' ? '' : apiUrl;
  }

  public getBaseUrl(): string {
    const baseURL = this.getAPIUrl();
    if (baseURL === null) {
      // Relative url
      return APIBASE;
    }
    if (!baseURL.endsWith(APIBASE)) {
      return `${baseURL}${APIBASE}`;
    }
    return `${baseURL}${APIBASE}`;
  }

  getAccessToken(): string {
    return JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN) || '{}');
  }

  getRefreshToken() {
    return JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
  }
}

export function useUserService() {
  return new UserService();
}

export default useUserService();
