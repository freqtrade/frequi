import { test, expect } from '@playwright/test';
import { setLoginInfo, defaultMocks } from './helpers';

test.describe('Settings', () => {
  test('Settings stores', async ({ page }) => {
    await setLoginInfo(page);
    await defaultMocks(page);
    await Promise.all([
      page.goto('/'),
      // page.waitForResponse('**/Ping'),
      // page.waitForResponse('**/ShowConf'),
    ]);
    // await expect(page.locator('li', { hasText: 'Online' })).toBeInViewport();
    await expect(page.locator('h1', { hasText: 'Welcome to the Freqtrade UI' })).toBeInViewport({
      timeout: 5000,
    });
    await expect(page.getByRole('button', { name: 'FT' })).toBeVisible();
    await page.getByRole('button', { name: 'FT' }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    await expect(page.getByText('FreqUI Settings')).toBeVisible();
    await expect(page.url()).toBe('http://localhost:3000/settings');

    // Switch option in the settings.
    await page.getByRole('combobox', { name: 'Show pill in icon' }).click();
    await page.getByRole('option', { name: 'Show in title' }).click();

    const settings = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('ftUISettings') || '{}'),
    );
    await expect(settings['openTradesInTitle']).toBe('asTitle');
  });
});
