import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('publishes a semantic, accessible portfolio baseline', async ({ page }) => {
  await page.goto('/portfolio/');

  await expect(page.getByRole('heading', { level: 1, name: 'Mohamed Moheyeldin' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('shares career content with the print resume route', async ({ page }) => {
  await page.goto('/portfolio/resume/');

  await expect(page.getByRole('heading', { level: 1, name: 'Mohamed Moheyeldin' })).toBeVisible();
  await expect(page.getByText('Booz Allen Hamilton')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeVisible();
});
