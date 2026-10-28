import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { products, categories, brands, posts } from '../js/data.js';

test('داده‌های نمایشی و قیمت‌های ضروری کامل‌اند', () => {
  assert.ok(products.length >= 24);
  assert.equal(categories.length, 6);
  assert.equal(brands.length, 6);
  assert.equal(posts.length, 6);
  const expected = new Map([
    ['پلیور یقه گرد', 890000], ['کتانی روزمره مردانه', 1450000], ['پیراهن کتان مشکی', 680000],
    ['کیف دوشی زنانه', 1950000], ['ساعت مچی کلاسیک', 2450000], ['هودی اسلیم فیت', 1280000]
  ]);
  for (const [name, price] of expected) assert.equal(products.find(p => p.name === name)?.price, price);
  for (const product of products) {
    assert.ok(categories.some(category => category.slug === product.category));
    assert.ok(brands.some(brand => brand.slug === product.brand));
    assert.ok(product.colors.length && product.sizes.length && product.images.length);
    if (product.oldPrice) assert.equal(product.discountPercent, Math.round((product.oldPrice-product.price)*100/product.oldPrice));
  }
});

test('صفحات، جهت فارسی و مسیرهای محلی معتبر دارند', async () => {
  const pages = ['index','products','product','cart','checkout','wishlist','account','blog','brands','404'];
  for (const page of pages) {
    const html = await readFile(new URL(`../${page}.html`, import.meta.url), 'utf8');
    assert.match(html, /<html lang="fa" dir="rtl">/);
    assert.match(html, /<main id="main-content"/);
    assert.match(html, /name="description"/);
    for (const [,path] of html.matchAll(/(?:href|src)="((?:css|js|assets)\/[^"?]+)"/g)) await access(new URL(`../${path}`, import.meta.url));
  }
  for (const product of products) for (const path of product.localImages) await access(new URL(`../${path}`, import.meta.url));
});

test('اسکیما برای همه جدول‌های فروشگاه RLS دارد', async () => {
  const sql = await readFile(new URL('../supabase/migrations/202610280001_initial.sql', import.meta.url), 'utf8');
  for (const table of ['categories','brands','products','product_variants','reviews','profiles','wishlists','cart_items','orders','order_items','blog_posts','newsletter_subscribers','coupons']) {
    assert.match(sql, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, 'i'));
  }
  assert.match(sql, /CREATE FUNCTION public\.place_order/);
});
