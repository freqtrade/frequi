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

    await page
      .locator('[id=avatar-drop]')
      .isVisible()
      .then(() => page.locator('[id=avatar-drop]').click());
    await page.locator('.dropdown-menu > * > [href="/settings"]').click();
    await expect(page.locator(':text("FreqUI Settings")')).toBeVisible();

    // Switch option in the settings.
    await page.locator('select').first().selectOption('asTitle');

    const settings = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('ftUISettings') || '{}'),
    );
    await expect(settings['openTradesInTitle']).toBe('asTitle');
  });
});
