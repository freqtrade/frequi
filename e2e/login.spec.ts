import { test, expect } from '@playwright/test';
import { setLoginInfo, defaultMocks, tradeMocks } from './helpers';

test.describe('Login', () => {
  test('Is not logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button', { hasText: 'Login' })).toBeInViewport();

    await page.locator('li', { hasText: 'No bot selected' });
    await page.locator('button:has-text("Login")').click();
    await page.locator('.modal-title:has-text("Login to your bot")');
    // Test prefilled URL
    await expect(page.locator('input[id=url-input]').inputValue()).resolves.toBe(
      'http://localhost:3000',
    );
    await page.locator('#name-input').isVisible();
    await page.locator('#username-input').isVisible();
    await page.locator('#password-input').isVisible();
    // Modal popup will use "OK" instead of "submit"
    await expect(page.locator('button[type=submit]')).not.toBeVisible();
  });

  test('Explicit login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button', { hasText: 'Login' })).not.toBeInViewport();
    await page.locator('li', { hasText: 'No bot selected' });
    await page.locator('.card-header:has-text("Freqtrade bot Login")');
    // Test prefilled URL
    await expect(page.locator('input[id=url-input]').inputValue()).resolves.toBe(
      'http://localhost:3000',
    );
    await page.locator('input[id=name-input]').isVisible();
    await page.locator('input[id=username-input]').isVisible();
    await page.locator('input[id=password-input]').isVisible();
    await page.locator('button[type=submit]').isVisible();
  });

  test('Redirect when not logged in', async ({ page }) => {
    await page.goto('/trade');
    // await expect(page.locator('button', { hasText: 'Login' })).toBeInViewport();
    await expect(page.locator('li', { hasText: 'No bot selected' }).first()).toBeInViewport();
    await expect(page).toHaveURL(/.*\/login\?redirect=\/trade/);
  });
});
