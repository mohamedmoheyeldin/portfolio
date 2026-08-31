import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const representativeRoutes = [
  '/',
  '/work/',
  '/work/federal-quality-delivery-system/',
  '/work/ecommerce-feedback-platform/',
  '/about/',
  '/resume/',
];

for (const route of representativeRoutes) {
  test(`${route} is semantic and accessible`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('presents project-first work and complete case studies', async ({ page }) => {
  await page.goto('/work/');

  await expect(page.getByRole('heading', { level: 2, name: 'Real delivery problems. Traceable engineering decisions.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Federal Quality Delivery System' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'E-commerce Quality Feedback Platform' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Banking Risk-Based Validation System' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Portfolio & Career Content System' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('link', { name: 'Federal Quality Delivery System' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Federal Quality Delivery System' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The delivery problem.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How I shaped the system.' })).toBeVisible();
  await expect(page.getByText('Client-sensitive details are intentionally generalized')).toBeVisible();
});

test('keeps typography, project cards, and expertise presentation consistent', async ({ page }) => {
  await page.goto('/work/');

  const projectCards = page.locator('.project-card');
  const cardColors = await projectCards.evaluateAll((cards) => cards.map((card) => getComputedStyle(card).backgroundColor));
  expect(new Set(cardColors).size).toBe(1);
  await expect(page.locator('.project-card__number')).toHaveText(['1', '2', '3', '4']);
  await expect(page.getByText('Official title:', { exact: false })).toHaveCount(0);

  await page.goto('/about/');
  const aboutSkills = await page.locator('.skill-grid h3').allTextContents();
  await expect(page.getByText('Core expertise', { exact: true })).toBeVisible();
  await expect(page.getByText(/Local and cloud AI|Local-First AI|Local AI/i)).toHaveCount(0);

  await page.goto('/resume/');
  const resumeSkills = await page.locator('.skill-grid h3').allTextContents();
  expect(resumeSkills).toEqual(aboutSkills);
  await expect(page.getByText(/Local and cloud AI|Local-First AI|Local AI/i)).toHaveCount(0);
});

test('publishes complete root metadata and route-specific case-study metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://mohamedmoheyeldin.com/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://mohamedmoheyeldin.com/og.png');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData).toContain('ProfilePage');

  await page.goto('/work/federal-quality-delivery-system/');
  await expect(page).toHaveTitle(/Federal Quality Delivery System/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Federal Quality Delivery System/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(0);
});

test('offers working PDF and Word resume downloads', async ({ page, request }) => {
  await page.goto('/resume/');

  await expect(page.getByRole('heading', { level: 1, name: 'Two resumes. One consistent career story.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Download Word' })).toHaveCount(2);

  const pdf = await request.get('/resume/mohamed-moheyeldin-resume-one-page.pdf');
  const word = await request.get('/resume/mohamed-moheyeldin-resume-one-page.docx');
  expect(pdf.ok()).toBeTruthy();
  expect(word.ok()).toBeTruthy();
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await word.body()).subarray(0, 2).toString()).toBe('PK');
});

test('publishes sitemap, robots policy, and a useful not-found page', async ({ page, request }) => {
  const sitemap = await request.get('/sitemap.xml');
  const robots = await request.get('/robots.txt');

  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('https://mohamedmoheyeldin.com/work/federal-quality-delivery-system/');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap: https://mohamedmoheyeldin.com/sitemap.xml');

  const response = await page.goto('/not-a-real-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('didn’t pass');
});
