import type { AxiosResponse } from 'axios';
import axios from 'axios';

import type {
  AuthPayload,
  AuthResponse,
  BotDescriptors,
  AuthStorage,
  AuthStorageMulti,
  BotDescriptor,
} from '@/types';

const AUTH_LOGIN_INFO = 'ftAuthLoginInfo';
const APIBASE = '/api/v1';

/**
 * Get all login infos for all registered bots
 */
function getAllLoginInfos(): AuthStorageMulti {
  const info = JSON.parse(localStorage.getItem(AUTH_LOGIN_INFO) || '{}');
  return info;
}

/**
 * Get available bots with their descriptors
 */
export function getAvailableBots(): BotDescriptors {
  const allInfo = getAllLoginInfos();
  const response: BotDescriptors = {};
  Object.keys(allInfo)
    .sort((a, b) => (allInfo[a].sortId ?? 0) - (allInfo[b].sortId ?? 0))
    .forEach((k, idx) => {
      response[k] = {
        botId: k,
        botName: allInfo[k].botName,
        botUrl: allInfo[k].apiUrl,
        sortId: allInfo[k].sortId ?? idx,
      };
    });

  return response;
}

/**
 * Get list of available bot IDs
 */
export function getAvailableBotList(): string[] {
  const allInfo = getAllLoginInfos();
  return Object.keys(allInfo);
}

export function useUserService(botId: string) {
  console.log('botId', botId);

  /**
   * Store login info for current botId in the object of all bots
   */
  function storeLoginInfo(loginInfo: AuthStorage): void {
    const allInfo = getAllLoginInfos();
    allInfo[botId] = loginInfo;
    localStorage.setItem(AUTH_LOGIN_INFO, JSON.stringify(allInfo));
  }

  /**
   * Get login info for current bot
   */
  function getLoginInfo(): AuthStorage {
    const info = getAllLoginInfos();
    if (botId in info && 'apiUrl' in info[botId] && 'refreshToken' in info[botId]) {
      return info[botId];
    }
    return {
      botName: '',
      apiUrl: '',
      username: '',
      refreshToken: '',
      accessToken: '',
      autoRefresh: false,
    };
  }

  function updateBot(newValues: Partial<BotDescriptor>): void {
    const newInfo = getLoginInfo();
    Object.assign(newInfo, newValues);
    storeLoginInfo(newInfo);
  }

  function setAccessToken(token: string): void {
    const loginInfo = getLoginInfo();
    loginInfo.accessToken = token;
    storeLoginInfo(loginInfo);
  }

  function setAutoRefresh(autoRefresh: boolean): void {
    const loginInfo = getLoginInfo();
    loginInfo.autoRefresh = autoRefresh;
    storeLoginInfo(loginInfo);
  }

  function setRefreshTokenExpired(): void {
    const loginInfo = getLoginInfo();
    loginInfo.refreshToken = '';
    loginInfo.accessToken = '';
    storeLoginInfo(loginInfo);
  }

  function getAutoRefresh(): boolean {
    return getLoginInfo().autoRefresh;
  }

  function getAccessToken(): string {
    return getLoginInfo().accessToken;
  }

  function getAPIUrl(): string {
    return getLoginInfo().apiUrl;
  }

  function logout(): void {
    console.log('Logging out');
    const info = getAllLoginInfos();
    delete info[botId];
    localStorage.setItem(AUTH_LOGIN_INFO, JSON.stringify(info));
  }

  async function loginCall(auth: AuthPayload): Promise<AuthStorage> {
    const { data } = await axios.post<Record<string, never>, AxiosResponse<AuthResponse>>(
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
        username: auth.username,
        accessToken: data.access_token || '',
        refreshToken: data.refresh_token || '',
        autoRefresh: true,
      };
      return Promise.resolve(obj);
    }
    return Promise.reject('login failed');
  }

  async function login(auth: AuthPayload) {
    const obj = await loginCall(auth);
    storeLoginInfo(obj);
  }

  function refreshToken(): Promise<string> {
    console.log('Refreshing token...');
    const token = getLoginInfo().refreshToken;
    return new Promise((resolve, reject) => {
      axios
        .post<Record<string, never>, AxiosResponse<AuthResponse>>(
          `${getAPIUrl()}${APIBASE}/token/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        .then((response) => {
          if (response.data.access_token) {
            setAccessToken(response.data.access_token);
            resolve(response.data.access_token);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.response && err.response.status === 401) {
            console.log('Refresh token did not refresh.');
            setRefreshTokenExpired();
          } else if (err.response && (err.response.status === 500 || err.response.status === 404)) {
            console.log('Bot seems to be offline... - retrying later');
          }
          reject(err);
        });
    });
  }

  function getBaseUrl(): string {
    const baseURL = getAPIUrl();
    if (baseURL === null) {
      return APIBASE;
    }
    if (!baseURL.endsWith(APIBASE)) {
      return `${baseURL}${APIBASE}`;
    }
    return `${baseURL}${APIBASE}`;
  }

  function getBaseWsUrl(): string {
    const baseUrl = getBaseUrl();
    if (baseUrl.startsWith('http://')) {
      return baseUrl.replace('http://', 'ws://');
    }
    if (baseUrl.startsWith('https://')) {
      return baseUrl.replace('https://', 'wss://');
    }
    return '';
  }

  return {
    updateBot,
    setAutoRefresh,
    getLoginInfo,
    setRefreshTokenExpired,
    getAutoRefresh,
    getAccessToken,
    logout,
    login,
    refreshToken,
    getBaseUrl,
    getBaseWsUrl,
  };
}
