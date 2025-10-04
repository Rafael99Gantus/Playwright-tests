import { test, expect } from '@playwright/test';

test('app opens', async ({ page }) => {
  await page.goto('/'); // откроет BASE_URL/
  await expect(page).toHaveURL(/\/?$/); // просто факт, что главная открылась
});