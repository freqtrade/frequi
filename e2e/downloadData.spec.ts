import { test, expect } from '@playwright/test';

import { setLoginInfo, defaultMocks } from './helpers';

test.describe('Download Data View', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    page.route('**/api/v1/show_config', (route) => {
      return route.fulfill({ path: `./e2e/testData/backtest/show_config_webserver.json` });
    });

    const jobID = 'c0578b6a-dd34-4bb7-b83c-492f02da2cfd';

    page.route('**/api/v1/download_data', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Data Download started in background.',
          job_id: jobID,
        }),
      });
    });

    page.route('**/api/v1/exchanges', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          exchanges: [],
        }),
      });
    });

    page.route(`**/api/v1/background/${jobID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: jobID,
          job_category: 'download_data',
          status: 'success',
          running: false,
          progress: null,
          progress_tasks: {
            0: { progress: 2, total: 2, description: 'Timeframe 5m' },
            1: { progress: 2, total: 2, description: 'Downloading BTC/USDT' },
          },
        }),
      });
    });

    await setLoginInfo(page);
  });
  test('Download Data page ', async ({ page }) => {
    const downloadDataPromise = page.waitForRequest('**/api/v1/download_data');

    page.goto('/');

    const downloadData = page.locator('a', { hasText: 'Download Data' });
    await Promise.all([downloadData.click(), page.waitForResponse('**/exchanges')]);

    await page.getByRole('button', { name: 'All USDT Pairs' }).click();

    await page.getByRole('spinbutton', { name: 'Days to download' }).click();

    const daysInput = page.getByRole('spinbutton', { name: 'Days to download' });
    await daysInput.clear();
    await page.keyboard.type('3');
    await page.keyboard.press('Tab');
    const startDownloadBtn = page.getByRole('button', { name: 'Start Download' });

    await Promise.all([
      startDownloadBtn.click(),
      page.waitForResponse('**/download_data'),
      page.waitForResponse('**/background/*'),
    ]);

    const downloadDataRequest = await downloadDataPromise;
    const postData = downloadDataRequest.postDataJSON();

    expect(postData).toMatchObject({
      pairs: expect.any(Array),
      timeframes: expect.any(Array),
      days: 3,
    });

    expect(postData.pairs).toContain('BTC/USDT');
    expect(postData.timeframes).toContain('5m');
    await expect(page.getByText('Downloading BTC/USDT')).toBeVisible();
    await expect(page.getByText('Timeframe 5m')).toBeVisible();
  });
  test('Download Data page with advanced settings', async ({ page }) => {
    const downloadDataPromise = page.waitForRequest('**/api/v1/download_data');

    page.goto('/');

    const downloadData = page.locator('a', { hasText: 'Download Data' });
    await Promise.all([downloadData.click(), page.waitForResponse('**/exchanges')]);

    await page.getByRole('button', { name: 'All USDT Pairs' }).click();
    const daysInput = page.getByLabel('Days to download');
    await daysInput.clear();
    await page.keyboard.type('3');
    await page.keyboard.press('Tab');

    await page.getByRole('button', { name: 'Advanced Options' }).click();
    await page.getByText('Erase existing data').click();
    const startDownloadBtn = page.getByRole('button', { name: 'Start Download' });

    await Promise.all([
      startDownloadBtn.click(),
      page.waitForResponse('**/download_data'),
      page.waitForResponse('**/background/*'),
    ]);

    const downloadDataRequest = await downloadDataPromise;
    const postData = downloadDataRequest.postDataJSON();

    expect(postData).toMatchObject({
      pairs: expect.any(Array),
      timeframes: expect.any(Array),
      days: 3,
      erase: true,
    });

    expect(postData.pairs).toContain('BTC/USDT');
    expect(postData.timeframes).toContain('5m');
  });
});
