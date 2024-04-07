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

export async function defaultMocks(page: Page) {
  page.route('**/api/v1/**', (route) => {
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {},
    });
  });

  await page.route('**/api/v1/ping', (route) => {
    return route.fulfill({ path: './cypress/fixtures/ping.json' });
  });
  await page.route('**/api/v1/show_config', (route) => {
    return route.fulfill({ path: './cypress/fixtures/show_config.json' });
  });
  await page.route('**/api/v1/pair_candles?*', (route) => {
    return route.fulfill({ path: './cypress/fixtures/pair_candles_btc_1m.json' });
  });
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
