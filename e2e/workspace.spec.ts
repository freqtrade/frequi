import { test, expect } from '@playwright/test';
import { defaultMocks, setLoginInfo } from './helpers';

test('Workspace notes stay in their strategy space and survive reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await defaultMocks(page);
  await setLoginInfo(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'agent-commons', exact: false })).toBeVisible();
  await page.getByRole('textbox', { name: 'Message agent-commons' }).fill('Portfolio review');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Portfolio review', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /TestBot/ }).click();
  await expect(
    page.getByRole('navigation', { name: 'Agent views' }).getByRole('button', { name: 'Charts' }),
  ).toBeVisible();
  await expect(page.getByText('Portfolio review', { exact: true })).not.toBeVisible();
  await page.getByRole('textbox', { name: 'Message TestBot' }).fill('Review strategy risk');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('button', { name: 'agent-commons' }).click();
  await page.reload();
  await expect(page.getByText('Portfolio review', { exact: true })).toBeVisible();
  await expect(page.getByText('Review strategy risk', { exact: true })).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('Empty workspace offers a real account connection', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A meeting place for your strategies.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Connect your first strategy' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('Anomaly account connection prefills its name and API address', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /anomaly.*Connect account/ }).click();
  await expect(page.getByRole('textbox', { name: 'Bot Name' })).toHaveValue('anomaly');
  await expect(page.getByRole('textbox', { name: 'API Url' })).toHaveValue('http://129.159.253.20:8081');
});
