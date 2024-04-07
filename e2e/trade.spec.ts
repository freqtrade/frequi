import { test, expect } from '@playwright/test';

import { setLoginInfo, defaultMocks } from './helpers';

function tradeMocks(page) {
  const mapping = [
    { name: '@Status', url: '**/api/v1/status', fixture: 'status_empty.json' },
    { name: '@Profit', url: '**/api/v1/profit', fixture: 'profit.json' },
    { name: '@Trades', url: '**/api/v1/trades*', fixture: 'trades.json' },
    { name: '@Balance', url: '**/api/v1/balance', fixture: 'balance.json' },
    { name: '@Whitelist', url: '**/api/v1/whitelist', fixture: 'whitelist.json' },
    { name: '@Blacklist', url: '**/api/v1/blacklist', fixture: 'blacklist.json' },
    { name: '@Locks', url: '**/api/v1/locks', fixture: 'locks_empty.json' },
    { name: '@Performance', url: '**/api/v1/performance', fixture: 'performance.json' },
    {
      name: '@ReloadConfig',
      method: 'POST',
      url: '**/api/v1/reload_config',
      fixture: 'reload_config.json',
    },
  ];
  mapping.forEach((item) => {
    page.route(item.url, (route) => {
      return route.fulfill({ path: `./cypress/fixtures/${item.fixture}` });
    });
  });
}

test('Trade', async ({ page }) => {
  await defaultMocks(page);
  await setLoginInfo(page);

  await tradeMocks(page);
  await page.goto('/trade');

  // Wait for network requests
  // await page.waitForResponse('**/ping');
  await page.waitForResponse('**/status');
  await page.waitForResponse('**/profit');
  await page.waitForResponse('**/balance');
  // await page.waitForResponse('**/trades');
  await page.waitForResponse('**/whitelist');
  await page.waitForResponse('**/blacklist');
  await page.waitForResponse('**/locks');

  // // Check visibility of elements
  await expect(page.locator('.drag-header', { hasText: 'Multi Pane' })).toBeInViewport();
  await expect(page.locator('.drag-header:has-text("Chart")')).toBeInViewport();
  // Pairlist elements
  await expect(page.locator('button:has-text("BTC/USDT")')).toBeInViewport();
  await expect(page.locator('button:has-text("ETH/USDT")')).toBeInViewport();

  // // Click on Performance button and wait for response
  await Promise.all([
    page.waitForResponse('**/performance'),
    page.click('button:has-text("Performance")'),
  ]);

  // // Check visibility of Profit USDT
  await expect(page.locator('th:has-text("Profit USDT")')).toBeInViewport();

  // // Test messageBox behavior

  const dialogModal = page.getByRole('dialog');
  const modalButton = page.locator(
    '#MsgBoxModal .modal-dialog > .modal-content > .modal-footer > .btn-secondary:has-text("Cancel")',
  );
  await expect(dialogModal).not.toBeVisible();
  await expect(dialogModal).not.toBeInViewport();

  await expect(modalButton).not.toBeVisible();

  await page.getByRole('button', { name: 'Stop Trading - Also stops' }).click();

  // Modal open
  await expect(dialogModal).toBeVisible();
  await expect(dialogModal).toBeInViewport();
  await expect(modalButton).toBeInViewport();

  // // Close modal
  await modalButton.click();

  // // Modal closed
  await expect(modalButton).not.toBeVisible();
  await expect(modalButton).not.toBeInViewport();

  // // Click on General tab
  const performancePair = page.locator('td:has-text("XRP/USDT")');
  await expect(performancePair).toBeInViewport();
  await page.click('button[role="tab"]:has-text("General")');

  // // Check visibility of elements
  await expect(performancePair).not.toBeInViewport();
  const openTrades = page.locator('.drag-header:has-text("Open Trades")');
  openTrades.scrollIntoViewIfNeeded();
  await expect(openTrades).toBeInViewport();
  const closedTrades = page.locator('.drag-header:has-text("Closed Trades")');
  closedTrades.scrollIntoViewIfNeeded();
  await expect(closedTrades).toBeInViewport();
  await expect(page.locator('span:has-text("TRX/USDT")')).toBeInViewport();
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

  const modalOkButton = page.locator(
    '#MsgBoxModal .modal-dialog > .modal-content > .modal-footer > .btn-primary:has-text("Ok")',
  );
  await expect(modalOkButton).toBeVisible();
  await modalOkButton.click();

  await expect(page.getByText('Config reloaded successfully.')).toBeInViewport();

  await page.locator('#avatar-drop').click();

  await page.getByLabel('Lock layout').uncheck();

  const chartHeader = await page.locator('.drag-header:has-text("Chart")');
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
    await expect(chartHeader).toBeInViewport();
  }
});
