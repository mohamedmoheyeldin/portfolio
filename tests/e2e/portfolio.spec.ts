import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('publishes a semantic, accessible portfolio experience', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Engineering confidence into every release.' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Quality systems that make delivery feel clear.' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('provides complete work and about routes', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('confidence repeatable');
  await expect(page.getByText('Booz Allen Hamilton')).toBeVisible();

  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('clearer, not slower');
  await expect(page.getByRole('heading', { name: 'Trust before volume.' })).toBeVisible();
});

test('offers one-page and detailed resume formats', async ({ page }) => {
  await page.goto('/resume/');

  await expect(page.getByRole('heading', { level: 1, name: 'Two resumes. One verified career story.' })).toBeVisible();
  await expect(page.getByText('Booz Allen Hamilton')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Download Word' })).toHaveCount(2);
});
