import { test, expect } from '@playwright/test';

import { setLoginInfo, defaultMocks } from './helpers';

test.describe('Pairlists', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    page.route('**/api/v1/show_config', (route) => {
      return route.fulfill({ path: `./e2e/testData/backtest/show_config_webserver.json` });
    });

    page.route('**/api/v1/pairlists/available*', (route) => {
      return route.fulfill({ path: `./e2e/testData/pairlists_available.json` });
    });

    const jobID = 'c0578b6a-dd34-4bb7-b83c-492f02da2cfd';

    page.route('**/api/v1/pairlists/evaluate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Pairlist evaluation started in background.',
          job_id: jobID,
        }),
      });
    });

    page.route(`**/api/v1/background/${jobID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: jobID,
          job_category: 'pairlist',
          status: 'success',
          running: false,
          progress: null,
        }),
      });
    });

    page.route(`**/api/v1/pairlists/evaluate/${jobID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          error: null,
          status: 'success',
          result: {
            whitelist: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
            length: 3,
            method: ['VolumePairList'],
          },
        }),
      });
    });
    await setLoginInfo(page);
  });
  test('Pairlists page', async ({ page }) => {
    page.goto('/');

    const pairlistConfig = page.locator('a', { hasText: 'Pairlist Config' });

    await Promise.all([pairlistConfig.click(), page.waitForResponse('**/pairlists/available*')]);

    const volumePairList = page.locator('text="VolumePairList"');
    await expect(volumePairList).toBeVisible();

    const volumePairListButton = page.locator('.available-pairlists :nth-child(4) > .btn');
    await expect(volumePairListButton).toBeInViewport();
    await volumePairListButton.click();

    const resultsButton = page.locator('.btn', { hasText: 'Results' });
    // await expect(resultsButton).toHaveAttribute('value', 'Results');
    await expect(resultsButton).toBeDisabled();

    const copyContainer = page.locator('.copy-container');
    await expect(copyContainer).toBeVisible();
    await expect(copyContainer).toContainText('"method": "VolumePairList",');

    const evaluateButton = page.locator('button >> text="Evaluate"');

    await Promise.all([
      evaluateButton.click(),
      page.waitForResponse('**/evaluate'),
      page.waitForResponse('**/background/*'),
      page.waitForResponse('**/pairlists/evaluate/*'),
    ]);

    await expect(resultsButton).toBeEnabled();
    await expect(resultsButton).toBeChecked();

    await expect(copyContainer).toContainText('"BTC/USDT",');
    await expect(copyContainer).toContainText('"ETH/USDT",');
    await expect(copyContainer).toContainText('"BNB/USDT"');
  });
});
