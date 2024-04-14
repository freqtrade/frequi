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
    await expect(page.getByText('Run backtest')).toBeInViewport();
    await expect(page.getByText('Strategy', { exact: true })).toBeInViewport();

    const strategySelect = page.locator('select[id="strategy-select"]');
    await expect(strategySelect).toBeVisible();
    await expect(strategySelect).toBeInViewport();

    await strategySelect.selectOption('SampleStrategy');
    const option = page.locator('option[value="SampleStrategy"]');
    await expect(option).toBeAttached();
    const analyzeButton = page.locator('[id="bt-analyze-btn"]');
    await expect(analyzeButton).toBeDisabled();

    const startBacktestButton = page.locator('button[id="start-backtest"]');
    await Promise.all([startBacktestButton.click(), page.waitForResponse('**/api/v1/backtest')]);

    // All buttons are now enabled
    await expect(analyzeButton).toBeEnabled();
  });
});
