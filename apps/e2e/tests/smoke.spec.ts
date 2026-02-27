import { expect, test } from '@playwright/test';

test('home page title is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('CAW Hackathon Bootstrap')).toBeVisible();
});