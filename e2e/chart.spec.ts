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

  test('Plot configurator', async ({ page }) => {
    await Promise.all([
      page.goto('/graph'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
    ]);

    // Wait for the chart to load
    await page.waitForSelector('span:has-text("NoActionStrategyFut | 1m")');

    await page.getByRole('button', { name: 'Plot configurator' }).click();
    await page.getByRole('button', { name: 'Indicator from template' }).click();
    // Apply bollinger bands
    await page.getByLabel('Select Templates').selectOption('BollingerBands');
    // Select template - Try to use
    await page.getByRole('button', { name: 'Use Template' }).click();
    // Accept remapping and close
    await page.getByRole('button', { name: 'Apply Template' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // Close Plot configurator
    await page.getByRole('button', { name: 'Plot configurator' }).click();

    await expect(page.locator('canvas')).toHaveScreenshot('Chart-Plot-with_BollingerBands.png', {
      threshold: 0.15,
      maxDiffPixelRatio: 0.15,
    });
    // Should assert if indicators have been set
    // but it's a canvas ...
  });
});
