import { test, expect } from '@playwright/test';

import { setLoginInfo, defaultMocks, tradeMocks } from './helpers';

test.describe('Trade', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    await setLoginInfo(page);

    await tradeMocks(page);
  });
  test('Trade page', async ({ page }) => {
    await Promise.all([
      page.goto('/trade'),
      // Wait for network requests
      //  page.waitForResponse('**/ping'),
      page.waitForResponse('**/status'),
      page.waitForResponse('**/profit'),
      page.waitForResponse('**/balance'),
      //  page.waitForResponse('**/trades'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
      page.waitForResponse('**/locks'),
    ]);

    // // Check visibility of elements
    await expect(page.locator('.drag-header', { hasText: 'Multi Pane' })).toBeInViewport();
    await expect(page.locator('.drag-header', { hasText: 'Chart' })).toBeInViewport();
    // Pairlist elements

    await expect(page.getByRole('listitem', { name: 'BTC/USDT' })).toBeInViewport();
    await expect(page.getByRole('listitem', { name: 'ETH/USDT' })).toBeInViewport();

    // // Click on Performance button and wait for response

    const performanceButton = page.locator('button[role="tab"] div[title="Performance"]');
    await expect(performanceButton).toBeVisible();
    await Promise.all([page.waitForResponse('**/performance'), performanceButton.click()]);

    // // Check visibility of Profit USDT
    await expect(page.locator('th:has-text("Profit USDT")')).toBeInViewport();

    // // Test messageBox behavior

    const dialogModal = page.getByRole('dialog');
    const modalCancelButton = dialogModal.getByRole('button', { name: 'Cancel' });

    await expect(dialogModal).not.toBeVisible();
    await expect(dialogModal).not.toBeInViewport();

    await expect(modalCancelButton).not.toBeVisible();

    await page.getByRole('button', { name: 'Stop Trading - Also stops' }).click();

    // Modal open
    await expect(dialogModal).toBeVisible();
    await expect(dialogModal).toBeInViewport();
    await expect(modalCancelButton).toBeInViewport();

    // // Close modal
    await modalCancelButton.click();

    // // Modal closed
    await expect(modalCancelButton).not.toBeVisible();
    await expect(modalCancelButton).not.toBeInViewport();

    // // Click on General tab
    const performancePair = page.locator('td:has-text("XRP/USDT")');
    await expect(performancePair).toBeInViewport();
    await page.locator('button[role="tab"] div[title="General"]').click();

    // // Check visibility of elements
    await expect(performancePair).not.toBeInViewport();
    const openTrades = page.locator('.drag-header:has-text("Open Trades")');
    openTrades.scrollIntoViewIfNeeded();
    await expect(openTrades).toBeInViewport();
    const closedTrades = page.locator('.drag-header:has-text("Closed Trades")');
    closedTrades.scrollIntoViewIfNeeded();
    await expect(closedTrades).toBeInViewport();
    await expect(page.getByRole('cell', { name: 'TRX/USDT' })).toBeInViewport();
    await expect(page.locator('td:has-text("8070.5")')).toBeInViewport();

    // Scroll to top
    const multiPane = page.locator('.drag-header', { hasText: 'Multi Pane' });
    await expect(multiPane).toBeVisible();
    await multiPane.scrollIntoViewIfNeeded();
    await expect(multiPane).toBeInViewport();

    // // Click on Reload Config button
    await page.getByRole('button', { name: 'Reload Config' }).click();
    // await page.locator('button[title*="Reload Config "]').click();
    await expect(dialogModal).toBeVisible();
    await expect(dialogModal).toBeInViewport();

    const modalOkButton = dialogModal.getByRole('button', { name: 'Ok' });
    await expect(modalOkButton).toBeVisible();
    await modalOkButton.click();

    await expect(page.getByText('Config reloaded successfully.')).toBeInViewport();
  });
  test('Trade page - drag and drop', async ({ page }) => {
    await Promise.all([
      page.goto('/trade'),
      // Wait for network requests
      //  page.waitForResponse('**/ping'),
      page.waitForResponse('**/status'),
      page.waitForResponse('**/profit'),
      page.waitForResponse('**/balance'),
      //  page.waitForResponse('**/trades'),
      page.waitForResponse('**/whitelist'),
      page.waitForResponse('**/blacklist'),
      page.waitForResponse('**/locks'),
    ]);
    // Wait for dynamic layout to settle
    await page.waitForTimeout(1000);
    const multiPane = await page.locator('.drag-header', { hasText: 'Multi Pane' });

    const multiPanebb = await multiPane.boundingBox();

    await page.getByRole('button', { name: 'FT' }).click();
    await page.getByText('Lock dynamic Layout').click();

    const chartHeader = await page.locator('.drag-header:has-text("Chart")');
    // Click outside of popup to ensure it's closed
    // await chartHeader.click();
    await expect(multiPane).toBeInViewport();
    await expect(chartHeader).toBeInViewport();

    // Test drag and drop functionality
    const chartHeaderbb = await chartHeader.boundingBox();
    if (chartHeaderbb) {
      await chartHeader.hover();
      await page.mouse.down();

      await page.mouse.move(chartHeaderbb?.x + chartHeaderbb.width / 2, chartHeaderbb?.y + 200);
      await page.mouse.up();
      await expect(multiPane).toBeInViewport();
      // Multipane wasn't moved.
      await expect(multiPanebb).toEqual(await multiPane.boundingBox());

      await expect(chartHeader).toBeInViewport();
      // ChartHeader was moved down
      await expect(chartHeaderbb).not.toEqual(await chartHeader.boundingBox());
    }
  });
});
