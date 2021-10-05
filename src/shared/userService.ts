import axios, { AxiosResponse } from 'axios';

import { AuthPayload, AuthResponse, BotDescriptors, AuthStorage, AuthStorageMulti } from '@/types';

const AUTH_LOGIN_INFO = 'auth_login_info';
const APIBASE = '/api/v1';

export class UserService {
  private botId: string;

  constructor(botId: string) {
    console.log('botId', botId);
    this.botId = botId;
  }

  /**
   * Stores info for current botId in the object of all bots.
   */
  private storeLoginInfo(loginInfo: AuthStorage): void {
    const allInfo = UserService.getAllLoginInfos();
    allInfo[this.botId] = loginInfo;
    localStorage.setItem(AUTH_LOGIN_INFO, JSON.stringify(allInfo));
  }

  /**
   * Logout - removing info for this particular bot.
   */
  private removeLoginInfo(): void {
    const info = UserService.getAllLoginInfos();
    delete info[this.botId];
    localStorage.setItem(AUTH_LOGIN_INFO, JSON.stringify(info));
  }

  private setAccessToken(token: string): void {
    const loginInfo = this.getLoginInfo();
    loginInfo.accessToken = token;
    this.storeLoginInfo(loginInfo);
  }

  /**
   * Store autorefresh preference for this bot instance
   * @param autoRefresh new autoRefresh value
   */
  public setAutoRefresh(autoRefresh: boolean): void {
    const loginInfo = this.getLoginInfo();
    loginInfo.autoRefresh = autoRefresh;
    this.storeLoginInfo(loginInfo);
  }

  /**
   * Retrieve full logininfo object (for all registered bots)
   * @returns
   */
  private static getAllLoginInfos(): AuthStorageMulti {
    const info = JSON.parse(localStorage.getItem(AUTH_LOGIN_INFO) || '{}');
    return info;
  }

  /**
   * Retrieve Login info object for the given bot
   * @returns Login Info object
   */
  private getLoginInfo(): AuthStorage {
    const info = UserService.getAllLoginInfos();
    if (this.botId in info && 'apiUrl' in info[this.botId] && 'refreshToken' in info[this.botId]) {
      return info[this.botId];
    }
    return {
      botName: '',
      apiUrl: '',
      refreshToken: '',
      accessToken: '',
      autoRefresh: false,
    };
  }

  public static getAvailableBots(): BotDescriptors {
    const allInfo = UserService.getAllLoginInfos();
    const response: BotDescriptors = {};
    Object.entries(allInfo).forEach(([k, v]) => {
      response[k] = {
        botId: k,
        botName: v.botName,
        botUrl: v.apiUrl,
      };
    });
    return response;
  }

  public static getAvailableBotList(): string[] {
    const allInfo = UserService.getAllLoginInfos();
    return Object.keys(allInfo);
  }

  public getAutoRefresh(): boolean {
    return this.getLoginInfo().autoRefresh;
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

    this.removeLoginInfo();
  }

  public async login(auth: AuthPayload) {
    //  Login using username / password
    const { data } = await axios.post<{}, AxiosResponse<AuthResponse>>(
      `${auth.url}/api/v1/token/login`,
      {},
      {
        auth: { ...auth },
      },
    );
    if (data.access_token && data.refresh_token) {
      const obj: AuthStorage = {
        botName: auth.botName,
        apiUrl: auth.url,
        accessToken: data.access_token || '',
        refreshToken: data.refresh_token || '',
        autoRefresh: true,
      };
      this.storeLoginInfo(obj);
    }
  }

  public refreshToken(): Promise<string> {
    console.log('Refreshing token...');
    const token = this.getRefreshToken();
    return new Promise((resolve, reject) => {
      axios
        .post<{}, AxiosResponse<AuthResponse>>(
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
    // TODO: this is actually never called!
    const AUTH_REFRESH_TOKEN = 'auth_ref_token'; // Legacy key - do not use
    const AUTH_ACCESS_TOKEN = 'auth_access_token';
    const AUTH_API_URL = 'auth_api_url';
    const AUTO_REFRESH = 'ft_auto_refresh';

    const apiUrl = JSON.parse(localStorage.getItem(AUTH_API_URL) || '{}');
    const refreshToken = JSON.parse(localStorage.getItem(AUTH_REFRESH_TOKEN) || '{}');
    const accessToken = JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN) || '{}');
    const autoRefresh: boolean = JSON.parse(localStorage.getItem(AUTO_REFRESH) || '{}');
    if (
      typeof apiUrl === 'string' &&
      typeof refreshToken === 'string' &&
      typeof accessToken === 'string'
    ) {
      const loginInfo: AuthStorage = {
        botName: '',
        apiUrl,
        refreshToken,
        accessToken,
        autoRefresh,
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
