import { test, expect } from '@playwright/test';
import { setLoginInfo, defaultMocks } from './helpers';

test.describe('Backtesting', () => {
  test.beforeEach(async ({ page }) => {
    await defaultMocks(page);
    page.route('**/api/v1/show_config', (route) => {
      return route.fulfill({ path: `./e2e/testData/backtest/show_config_webserver.json` });
    });
    page.route('**/api/v1/strategies', (route) => {
      return route.fulfill({ path: `./e2e/testData/backtest/strategies.json` });
    });

    await page.route('**/api/v1/backtest', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          path: './e2e/testData/backtest/backtest_post_start.json',
        });
      } else if (route.request().method() === 'GET') {
        route.fulfill({
          path: './e2e/testData/backtest/backtest_get_end.json',
        });
      }
    });

    await setLoginInfo(page);
  });
  test('Starts webserver mode', async ({ page }) => {
    await page.goto('/backtest');

    await expect(page.locator('a', { hasText: 'Backtest' })).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'New backtest' })).toBeInViewport();
    await expect(page.getByText('Use time')).toBeInViewport();

    const strategySelect = page.locator('#strategy-select');
    await expect(strategySelect).toBeVisible();
    await expect(strategySelect).toBeInViewport();
    await page.locator('#strategy-select svg').click();
    await page.getByRole('option', { name: 'SampleStrategy' }).click();

    const option = page.locator('[id="strategy-select"]');
    await expect(option).toBeAttached();
    const overviewTab = page.getByRole('tab', { name: 'Overview' });
    await expect(overviewTab).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Compare/ })).toBeDisabled();

    const startBacktestButton = page.getByRole('button', { name: 'Start Backtest' });
    await Promise.all([startBacktestButton.click(), page.waitForResponse('**/api/v1/backtest')]);

    // Result view is shown after the backtest finished
    await expect(overviewTab).toBeVisible();
    await expect(page.getByText('Max drawdown', { exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Trades' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Breakdowns' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Charts' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Pair chart' })).toBeVisible();

    // Switch to trades view
    await page.getByRole('tab', { name: 'Trades' }).click();
  });
});
