import { test, expect } from '@playwright/test';

import { setLoginInfo, defaultMocks, getWaitForResponse } from './helpers';

test.describe('Logs', () => {
  test('Displays and reloads logs', async ({ page }) => {
    ///
    await defaultMocks(page);
    await setLoginInfo(page);
    // const pingPromise = page.route('**/*ping*',

    // const logsPromise = page.waitForResponse('**/api/v1/logs');
    await page.route('**/api/v1/logs', (route) => {
      return route.fulfill({ path: './e2e/testData/logs.json' });
    });

    const logs = getWaitForResponse(page, '@Logs');
    const ping = getWaitForResponse(page, '@ShowConf');
    await page.goto('/logs', { waitUntil: 'networkidle' });
    await Promise.all([logs, ping]);

    await expect(page.locator('span', { hasText: 'Checking exchange' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Checking exchange' })).toHaveText(
      /Checking exchange.../,
      {},
    );
    // const logsPromise = page.waitForResponse('**/api/v1/logs');
    const logsPromise = getWaitForResponse(page, '@Logs');
    await page.getByRole('button', { name: 'Reload Logs' }).click();
    await logsPromise;
  });
});
