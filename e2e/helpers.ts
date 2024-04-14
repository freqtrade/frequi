import { Page } from '@playwright/test';

export async function setLoginInfo(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem(
      'ftAuthLoginInfo',
      JSON.stringify({
        'ftbot.0': {
          botName: 'TestBot',
          apiUrl: 'http://localhost:3000',
          accessToken: 'access_token_tesst',
          refreshToken: 'refresh_test',
          autoRefresh: true,
        },
      }),
    );
    localStorage.setItem('ftSelectedBot', 'ftbot.0');
  });
}

interface mockArray {
  name: string;
  url: string;
  fixture: string;
  method?: string;
}

function mockRequests(page, mocks: mockArray[]) {
  mocks.forEach((item) => {
    page.route(item.url, (route) => {
      return route.fulfill({ path: `./e2e/testData/${item.fixture}` });
    });
  });
}

export async function defaultMocks(page: Page) {
  page.route('**/api/v1/**', (route) => {
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {},
    });
  });

  const mapping: mockArray[] = [
    { name: '@Ping', url: '**/api/v1/ping', fixture: 'ping.json' },
    { name: '@Ping', url: '**/api/v1/show_config', fixture: 'show_config.json' },
    { name: '@Ping', url: '**/api/v1/pair_candles?*', fixture: 'pair_candles_btc_1m.json' },
    { name: '@Whitelist', url: '**/api/v1/whitelist', fixture: 'whitelist.json' },
    { name: '@Blacklist', url: '**/api/v1/blacklist', fixture: 'blacklist.json' },
  ];

  mockRequests(page, mapping);
}

export function tradeMocks(page) {
  const mapping: mockArray[] = [
    { name: '@Status', url: '**/api/v1/status', fixture: 'status_empty.json' },
    { name: '@Profit', url: '**/api/v1/profit', fixture: 'profit.json' },
    { name: '@Trades', url: '**/api/v1/trades*', fixture: 'trades.json' },
    { name: '@Balance', url: '**/api/v1/balance', fixture: 'balance.json' },
    { name: '@Locks', url: '**/api/v1/locks', fixture: 'locks_empty.json' },
    { name: '@Performance', url: '**/api/v1/performance', fixture: 'performance.json' },
    {
      name: '@ReloadConfig',
      method: 'POST',
      url: '**/api/v1/reload_config',
      fixture: 'reload_config.json',
    },
  ];
  mockRequests(page, mapping);
}

export function getWaitForResponse(page: Page, url: string) {
  const urlMapping = {
    '@Ping': '**/api/v1/ping',
    '@ShowConf': '**/api/v1/show_config',
    '@PairCandles': '**/api/v1/pair_candles',
    '@Logs': '**/api/v1/logs',
  };
  const urlMap = urlMapping[url] ?? url;

  return page.waitForResponse(urlMap);
}
