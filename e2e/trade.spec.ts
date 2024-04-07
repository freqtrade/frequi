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
  // await page.waitForResponse('**/Profit');
  // await page.waitForResponse('**/Balance');
  // await page.waitForResponse('**/Trades');
  // await page.waitForResponse('**/Whitelist');
  // await page.waitForResponse('**/Blacklist');
  // await page.waitForResponse('**/Locks');

  // // Check visibility of elements
  await expect(page.locator('.drag-header', { hasText: 'Multi Pane' })).toBeInViewport();
  await expect(page.locator('.drag-header:has-text("Chart")')).toBeInViewport();
  await expect(page.locator('button:has-text("BTC/USDT")')).toBeInViewport();
  await expect(page.locator('button:has-text("ETH/USDT")')).toBeInViewport();

  // // Click on Performance button and wait for response
  await Promise.all([
    page.waitForResponse('**/performance'),
    page.click('button:has-text("Performance")'),
  ]);

  // // Check visibility of Profit USDT
  // await expect(page.locator('th:has-text("Profit USDT")')).toBeInViewport();

  // // Test messageBox behavior
  // // No modal visible
  expect(
    await page.$$eval(
      '.modal-dialog > .modal-content > .modal-footer > .btn-secondary:visible',
      (elements) => elements.length,
    ),
  ).toBe(0);

  // // Click on Stop Trading button

  // await page.locator('.mt-1 > .mt-1').getByRole('button').getByTitle('Stop Trading').click();

  // // Modal open
  // await expect(
  //   page.locator(
  //     '.modal-dialog > .modal-content > .modal-footer > .btn-secondary:visible:has-text("Cancel")',
  //   ),
  // ).toBeVisible();

  // // Close modal
  // await page.click(
  //   '.modal-dialog > .modal-content > .modal-footer > .btn-secondary:visible:has-text("Cancel")',
  // );

  // // Modal closed
  // expect(
  //   await page.$$eval(
  //     '.modal-dialog > .modal-content > .modal-footer > .btn-secondary:visible',
  //     (elements) => elements.length,
  //   ),
  // ).toBe(0);

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
  // await page.locator('button[title*="Reload Config "]').click();
});
