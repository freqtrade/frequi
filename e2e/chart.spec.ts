import { test, expect } from '@playwright/test';
import { setLoginInfo, defaultMocks } from './helpers';

test.describe('Chart', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    await setLoginInfo(page);
  });
  test('Chart page', async ({ page }) => {
    await Promise.all([
      page.goto('/graph'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
    ]);

    // await page.waitForResponse('**/pair_candles');
    await page.locator('input[title="AutoRefresh"]').click();
    // await page.click('input[title="AutoRefresh"]');

    await page.waitForSelector('span:has-text("NoActionStrategyFut | 1m")');

    await page.click('.form-check:has-text("Heikin Ashi")');

    // Reload triggers a new request
    await Promise.all([
      page.getByRole('button', { name: 'Refresh chart' }).click(),

      page.waitForResponse('**/pair_candles?*'),
    ]);
    // Disable Heikin Ashi
    await page.locator('.form-check:has-text("Heikin Ashi")').click();
    // Default plotconfig exists
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Heikin Ashidefault$/ })
        .locator('#plotConfigSelect'),
    ).toHaveValue('default');
  });
});
