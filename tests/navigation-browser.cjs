/* Optional Playwright coverage for navigation and controls. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000/';

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_BIN || undefined, args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{ width:1440, height:900 } });
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const open = async path => { await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>!document.querySelector('main .skeleton')); };

  await open('index.html');
  await page.locator('[data-slider-toggle]').click();
  assert.equal(await page.locator('[data-slider-toggle]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-slide-to="2"]').click();
  assert.equal(await page.locator('[data-slide="2"]').getAttribute('aria-hidden'),'false');
  assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-hidden'),'true');
  await page.locator('[data-home-tab="best"]').click();
  assert.equal(await page.locator('[data-home-tab="best"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-license-info="مجوز فروشگاه"]').click();
  assert.match(await page.locator('[role="dialog"]').innerText(),/نمایشی/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[role="dialog"]').count(),0);

  await open('products.html');
  await page.locator('[data-quick-view]').first().click();
  await page.waitForSelector('[data-quick-product]');
  await page.locator('[data-quick-confirm]').click();
  await page.locator('[data-open-cart]').first().click();
  await page.waitForSelector('.overlay--cart .drawer-cart-item');
  await page.locator('.overlay--cart [data-quantity="plus"]').click();
  assert.equal(await page.locator('.overlay--cart .quantity span').innerText(),'۲');
  await page.locator('.overlay--cart [data-remove-cart]').click();
  assert.match(await page.locator('.overlay--cart').innerText(),/خالی/);
  await page.keyboard.press('Escape');

  await open('product.html?id=1');
  await page.locator('[data-gallery="1"]').click();
  assert.equal(await page.locator('[data-gallery="1"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('[data-gallery-main] img').getAttribute('src'),/knit-brown\.webp/);
  await page.locator('[data-size-guide]').click();
  assert.match(await page.locator('[role="dialog"]').innerText(),/راهنمای انتخاب سایز/);
  await page.keyboard.press('Escape');
  await page.locator('[data-product-tab="care"]').click();
  assert.match(await page.locator('[data-product-panel]').innerText(),/نگهداری/);

  await open('brands.html');
  await page.locator('[data-brand-letter="Z"]').click();
  assert.equal(await page.locator('.brand-card').count(),1);
  assert.equal(await page.locator('.brand-card').innerText(),'ZARA');
  await page.locator('.brand-card').click();
  assert.match(page.url(),/brand=zara/);

  await open('blog.html');
  await page.locator('[data-blog-category="راهنمای استایل"]').click();
  await page.locator('[data-blog-search]').fill('کپسولی');
  assert.equal(await page.locator('[data-blog-results] .article-card').count(),1);
  await page.locator('[data-blog-results] .article-card a').first().click();
  assert.match(page.url(),/slug=capsule-wardrobe/);
  assert.match(await page.locator('.article-detail h1').innerText(),/کمد کپسولی/);

  await page.setViewportSize({width:390,height:844});
  await open('index.html');
  await page.locator('[data-open-menu]').click();
  assert.match(await page.locator('.overlay--menu').innerText(),/زنانه/);
  await page.keyboard.press('Escape');
  await page.locator('[data-open-search]').first().click();
  await page.locator('#mobile-search').fill('پلیور');
  await page.waitForSelector('.overlay--search .search-results__item');
  await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);
  await browser.close();

  // If WebP is unavailable, the local JPEGs still render without Unsplash.
  const fallbackBrowser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN || undefined,args:['--no-sandbox']});
  const fallback=await fallbackBrowser.newPage({viewport:{width:390,height:844}});
  await fallback.route('**/*', route => {
    const url=route.request().url();
    if(!url.startsWith(base))return route.abort();
    return /\.webp(?:\?|$)/.test(url) ? route.abort() : route.continue();
  });
  await fallback.goto(new URL('index.html',base).href,{waitUntil:'domcontentloaded'});
  await fallback.waitForFunction(()=>{const img=document.querySelector('.hero__slide.is-active img');return img?.getAttribute('src')==='assets/hero-fashion.jpg' && img.complete && img.naturalWidth>0;});
  await fallback.locator('.style-story--women').scrollIntoViewIfNeeded();
  await fallback.waitForFunction(()=>{const img=document.querySelector('.style-story--women img');return img?.getAttribute('src')?.endsWith('.jpg') && img.complete && img.naturalWidth>0;});
  await fallbackBrowser.close();
  console.log('Navigation, overlays, gallery, mobile search and image fallback passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
