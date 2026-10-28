/* Optional development test: Playwright is not shipped to the storefront. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000/';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || undefined,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Verify graceful fallback without relying on third-party network access.
  await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const open = async path => {
    await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !document.querySelector('main .skeleton'));
  };
  const pages = ['index.html', 'products.html', 'product.html?id=1', 'cart.html', 'checkout.html', 'wishlist.html', 'account.html', 'blog.html', 'blog.html?slug=capsule-wardrobe', 'brands.html', '404.html'];
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await open(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `${path} overflows at ${width}px`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await open('index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.hero');
  await page.locator('#header-search').fill('پلیور');
  await page.waitForSelector('.search-results__item');
  await page.locator('.search-results__item').first().click();
  await page.waitForSelector('.product-detail');
  await page.locator('.product-info [data-wishlist]').click();
  await page.locator('[data-product-size="M"]').click();
  await page.locator('.add-main').click();
  await open('wishlist.html');
  assert.equal(await page.locator('.product-card').count(), 1);
  await open('cart.html');
  await page.reload();
  await page.waitForSelector('.cart-item');
  assert.equal(await page.locator('.cart-item').count(), 1);
  await page.locator('#coupon-code').fill('STYLE10');
  await page.locator('[data-coupon-form] button').click();
  await page.waitForSelector('.coupon-applied');
  await open('products.html?gender=women');
  await page.locator('aside [data-filter="sale"]').check();
  await page.locator('aside [data-filter-toggle="size"][data-value="M"]').click();
  assert.match(page.url(), /sale=1/);
  assert.match(page.url(), /size=M/);
  await page.setViewportSize({ width: 390, height: 844 });
  await open('products.html');
  await page.locator('[data-open-filters]').click();
  await page.locator('.overlay--filter [data-filter-toggle="color"][data-value="مشکی"]').click();
  assert.match(page.url(), /color=/);
  await page.locator('.overlay--filter [data-close-overlay]').last().click();
  await open('checkout.html');
  await page.locator('[data-checkout-form="1"] [type="submit"]').click();
  assert.ok((await page.locator('#error-fullName').innerText()).length);
  assert.equal(await page.evaluate(() => document.activeElement.name), 'fullName');
  await page.locator('#checkout-fullName').fill('کاربر آزمایشی');
  await page.locator('#checkout-phone').fill('۰۹۱۲۳۴۵۶۷۸۹');
  await page.locator('#checkout-province').selectOption('تهران');
  await page.locator('#checkout-city').fill('تهران');
  await page.locator('#checkout-address').fill('خیابان آزمایشی پلاک دوازده');
  await page.locator('#checkout-postalCode').fill('۱۲۳۴۵۶۷۸۹۰');
  await page.locator('[data-checkout-form="1"] [type="submit"]').click();
  await page.locator('[data-checkout-form="2"] [type="submit"]').click();
  await page.locator('[name="terms"]').check();
  await page.locator('[data-checkout-form="3"] [type="submit"]').click();
  await page.waitForSelector('.checkout-success');
  assert.match(await page.locator('.checkout-success').innerText(), /آفلاین/);
  assert.deepEqual(errors, []);
  console.log('Responsive pages, search, cart, wishlist, filters and offline checkout passed.');
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
