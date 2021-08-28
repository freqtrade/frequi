import axios from 'axios';

import { AuthPayload, AuthStorage } from '@/types';

const AUTH_LOGIN_INFO = 'auth_login_info';
const APIBASE = '/api/v1';

export class UserService {
  private botId: string;

  constructor(botId: string) {
    console.log('botId', botId);
    this.botId = botId;
  }

  private storeLoginInfo(loginInfo: AuthStorage): void {
    localStorage.setItem(AUTH_LOGIN_INFO, JSON.stringify(loginInfo));
  }

  private setAccessToken(token: string): void {
    const loginInfo = this.getLoginInfo();
    loginInfo.accessToken = token;
    this.storeLoginInfo(loginInfo);
  }

  private getLoginInfo(): AuthStorage {
    const info = JSON.parse(localStorage.getItem(AUTH_LOGIN_INFO) || '{}');
    if ('apiUrl' in info && 'refreshToken' in info) {
      return info;
    }
    return {
      apiUrl: '',
      refreshToken: '',
      accessToken: '',
    };
  }

  public getAccessToken(): string {
    return this.getLoginInfo().accessToken;
  }

  private getRefreshToken() {
    return this.getLoginInfo().refreshToken;
  }

  public loggedIn() {
    return this.getLoginInfo().refreshToken !== '';
  }

  private getAPIUrl(): string {
    return this.getLoginInfo().apiUrl;
  }

  public logout(): void {
    console.log('Logging out');
    localStorage.removeItem(AUTH_LOGIN_INFO);
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
    if (result.data.access_token && result.data.refresh_token) {
      const obj: AuthStorage = {
        apiUrl: auth.url,
        accessToken: result.data.access_token || '',
        refreshToken: result.data.refresh_token || '',
      };
      this.storeLoginInfo(obj);
    }
  }

  public refreshToken(): Promise<string> {
    console.log('Refreshing token...');
    const token = this.getRefreshToken();
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

  /**
   * Call on startup to migrate old login info to new login
   */
  public migrateLogin() {
    const AUTH_REFRESH_TOKEN = 'auth_ref_token'; // Legacy key - do not use
    const AUTH_ACCESS_TOKEN = 'auth_access_token';
    const AUTH_API_URL = 'auth_api_url';

    const apiUrl = JSON.parse(localStorage.getItem(AUTH_API_URL) || '{}');
    const refreshToken = JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
    const accessToken = JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN) || '{}');
    if (
      typeof apiUrl === 'string' &&
      typeof refreshToken === 'string' &&
      typeof accessToken === 'string'
    ) {
      const loginInfo: AuthStorage = {
        apiUrl,
        refreshToken,
        accessToken,
      };
      this.storeLoginInfo(loginInfo);
    }

    localStorage.removeItem(AUTH_REFRESH_TOKEN);
    localStorage.removeItem(AUTH_ACCESS_TOKEN);
    localStorage.removeItem(AUTH_API_URL);
  }
}

export function useUserService(botId: string) {
  const userservice = new UserService(botId);
  userservice.migrateLogin();
  return userservice;
}

export default useUserService('ftbot.0');
