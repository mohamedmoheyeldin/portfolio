import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const representativeRoutes = [
  '/',
  '/work/',
  '/work/federal-quality-delivery-system/',
  '/work/ecommerce-feedback-platform/',
  '/about/',
  '/resume/',
  '/assistant/',
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

test('presents an animated quality-system story without widening the page', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveClass(/has-live-props/);
  await expect(page.locator('.quality-signal')).toBeVisible();
  await expect(page.locator('.quality-signal__bar')).toContainText('Quality signal model');
  await expect(page.locator('.quality-signal__footer')).toContainText('UI + API checks');

  const feature = page.locator('.feature-card--wide');
  await feature.scrollIntoViewIfNeeded();
  await expect(feature).toHaveCSS('opacity', '1');

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBe(dimensions.viewport);
});

test('uses centered, restrained page headers across routes', async ({ page }) => {
  const headingTops: number[] = [];
  for (const route of ['/', '/work/', '/about/', '/resume/', '/assistant/', '/work/federal-quality-delivery-system/']) {
    await page.goto(route);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const presentation = await heading.evaluate((element) => ({
      alignment: getComputedStyle(element).textAlign,
      backgroundImage: getComputedStyle(element).backgroundImage,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
      top: element.getBoundingClientRect().top,
    }));
    expect(presentation.alignment).toBe('center');
    expect(presentation.backgroundImage).toContain('linear-gradient');
    expect(presentation.fontSize).toBeLessThanOrEqual(68);
    expect(presentation.lineHeight / presentation.fontSize).toBeGreaterThanOrEqual(1.1);
    headingTops.push(presentation.top);
  }
  expect(Math.max(...headingTops) - Math.min(...headingTops)).toBeLessThanOrEqual(24);
});

test('uses the pipeline heading scale for section headings site-wide', async ({ page }) => {
  const headings = [
    ['/about/', '#principles-title'],
    ['/work/', '#projects-title'],
    ['/resume/', '#profile-title'],
    ['/assistant/', '#system-title'],
    ['/assistant/', '.assistant-toolbar h2'],
    ['/assistant/', '#architecture-title'],
    ['/work/federal-quality-delivery-system/', '#challenge-title'],
  ] as const;
  const fontSizes: number[] = [];

  for (const [route, selector] of headings) {
    await page.goto(route);
    const heading = page.locator(selector);
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    fontSizes.push(await heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)));
  }

  expect(Math.max(...fontSizes) - Math.min(...fontSizes)).toBeLessThanOrEqual(0.1);

  await page.goto('/assistant/');
  const supportingCopy = page.locator('.assistant-system__heading > p');
  await expect(supportingCopy).toBeVisible();
  expect(await supportingCopy.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
});

test('uses one shared interactive card surface across portfolio sections', async ({ page }) => {
  const cards = [
    ['/about/', '.principle-grid article'],
    ['/work/', '.project-card'],
    ['/resume/', '.resume-choice'],
    ['/assistant/', '.pipeline-stages li'],
  ] as const;
  const presentations = [];

  for (const [route, selector] of cards) {
    await page.goto(route);
    const card = page.locator(selector).first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    presentations.push(await card.evaluate((element) => ({
      backgroundImage: getComputedStyle(element).backgroundImage,
      borderRadius: getComputedStyle(element).borderRadius,
      boxShadow: getComputedStyle(element).boxShadow,
    })));
  }

  expect(new Set(presentations.map(({ borderRadius }) => borderRadius)).size).toBe(1);
  for (const presentation of presentations) {
    expect(presentation.backgroundImage).toContain('radial-gradient');
    expect(presentation.boxShadow).not.toBe('none');
  }
});

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

test('shows a privacy-safe, data-driven autonomous application-system case study', async ({ page }) => {
  await page.goto('/assistant/');

  await expect(page.getByRole('heading', { level: 1, name: /My inbox works like an AI application agent/ })).toBeVisible();
  await expect(page.getByText('Runtime contract', { exact: true })).toBeVisible();
  await expect(page.locator('.pipeline-observatory')).toBeVisible();
  await expect(page.locator('[data-flow-stage]')).toHaveCount(6);
  await expect(page.getByText('Gmail intake', { exact: true })).toBeVisible();
  await expect(page.getByText('Policy + classify', { exact: true })).toBeVisible();
  await expect(page.getByText('Resume generation', { exact: true })).toBeVisible();
  await expect(page.getByText('Gmail delivery', { exact: true })).toBeVisible();
  await expect(page.getByText('Thread completion', { exact: true })).toBeVisible();
  await expect(page.getByText('No production values are simulated in local preview.')).toBeVisible();
  await expect(page.locator('[data-flow-value="reviewed"]')).toHaveText('—');
  await expect(page.getByLabel('Pipeline summary').getByText('Inbox cleared', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Pipeline summary').getByText('Needs attention', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent automation' })).toHaveCount(0);
  await expect(page.getByText('Automation loop', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Deterministic safety gate', { exact: true })).toBeVisible();
  await expect(page.getByText('Governed Drive evidence', { exact: true })).toBeVisible();
  await expect(page.getByText('Identity-data firewall', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Connect Gmail' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sync inbox' })).toHaveCount(0);
  await expect(page.getByText(/final approval gate/i)).toHaveCount(0);

  await expect(page.getByRole('button', { name: 'Remote', exact: true })).toHaveCount(0);
});

test('binds pipeline visuals to the sanitized live snapshot', async ({ page }) => {
  await page.route('**/api/public-snapshot', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        mode: 'live',
        lastSyncAt: 'System updated Aug 21, 2026 at 2:15 AM',
        stats: { reviewed: 17, opportunities: 6, remote: 4, resumes: 5, replies: 3, archived: 2, attention: 1 },
      }),
    });
  });
  await page.goto('/assistant/');

  await expect(page.getByText('Live sanitized telemetry', { exact: true })).toBeVisible();
  await expect(page.locator('[data-flow-value="reviewed"]')).toHaveText('17');
  await expect(page.locator('[data-flow-value="opportunities"]')).toHaveText('6');
  await expect(page.locator('[data-flow-value="resumes"]')).toHaveText('5');
  await expect(page.locator('[data-flow-value="replies"]')).toHaveText('3');
  await expect(page.locator('[data-flow-value="archived"]')).toHaveText('2');
  await expect(page.locator('[data-flow-value="attention"]')).toHaveText('1');
  await expect(page.getByLabel('Pipeline summary').locator('[data-stat="remote"]')).toHaveText('4');
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
