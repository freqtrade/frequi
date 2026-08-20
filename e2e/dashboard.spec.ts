import { test, expect } from '@playwright/test';
import { setLoginInfo, defaultMocks, tradeMocks } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    await tradeMocks(page);
    await setLoginInfo(page);
  });
  test('Dashboard Page', async ({ page }) => {
    await Promise.all([
      page.goto('/dashboard'),
      page.waitForResponse('**/status'),
      page.waitForResponse('**/profit'),
      page.waitForResponse('**/balance'),
      // page.waitForResponse('**/trades'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
      page.waitForResponse('**/locks'),
    ]);
    await expect(page.locator('.drag-header', { hasText: 'Bot comparison' })).toBeVisible();
    await expect(page.locator('.drag-header', { hasText: 'Bot comparison' })).toBeInViewport();
    await expect(page.locator('.drag-header', { hasText: 'Profit over time' })).toBeVisible();
    await expect(page.locator('.drag-header', { hasText: 'Profit over time' })).toBeInViewport();
    await expect(page.locator('.drag-header', { hasText: 'Open trades' })).toBeVisible();
    await expect(page.locator('.drag-header', { hasText: 'Open trades' })).toBeInViewport();
    await expect(page.locator('.drag-header', { hasText: 'Cumulative Profit' })).toBeVisible();
    await expect(page.locator('.drag-header', { hasText: 'Cumulative Profit' })).toBeInViewport();

    await expect(page.locator('span').filter({ hasText: /^TestBot$/ })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Summary' })).toBeVisible();
    // Scroll to bottom
    await page.locator('.drag-header', { hasText: 'Trades Log' }).scrollIntoViewIfNeeded();
    await expect(page.locator('.drag-header', { hasText: 'Closed Trades' })).toBeInViewport();
    await expect(page.locator('.drag-header', { hasText: 'Profit Distribution' })).toBeInViewport();

    await expect(page.locator('.drag-header', { hasText: 'Trades Log' })).toBeInViewport();
  });

  test('Dashboard Page - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await Promise.all([
      page.goto('/dashboard'),
      page.waitForResponse('**/status'),
      page.waitForResponse('**/profit'),
      page.waitForResponse('**/balance'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
      page.waitForResponse('**/locks'),
    ]);
    await expect(page.locator('.drag-header', { hasText: 'Bot comparison' })).toBeVisible();

    const viewportWidth = page.viewportSize()?.width ?? 0;
    // Grid cards must not be wider than the screen - otherwise most columns
    // are rendered off-screen and are unreachable on a phone.
    const cardWidths = await page
      .locator('.vue-grid-item:not(.vue-grid-placeholder)')
      .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().width));

    expect(cardWidths.length).toBeGreaterThan(0);
    for (const cardWidth of cardWidths) {
      expect(cardWidth).toBeLessThanOrEqual(viewportWidth);
    }
    await expect(page.getByText('Open Trades')).toBeVisible();
    await expect(page.getByText('Open Trades')).toBeInViewport();
  });
});
