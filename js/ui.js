import { getCatalog, getProduct, getBrandName, getCategoryName, subscribe } from './supabase.js';
import * as store from './store.js';
import { FREE_SHIPPING_THRESHOLD } from './config.js';

const paths = {
  bag:'<path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  heart:'<path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  arrow:'<path d="M19 12H5m6-6-6 6 6 6"/>',
  chevron:'<path d="m7 10 5 5 5-5"/>',
  truck:'<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  shield:'<path d="M12 3 20 6v5c0 5-3.5 8.2-8 10-4.5-1.8-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
  headset:'<path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4ZM17 18c0 2-2 3-5 3"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.4-2"/>',
  star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  home:'<path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-6h6v6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  filter:'<path d="M4 7h10M18 7h2M4 17h2m4 0h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  spark:'<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  phone:'<path d="M5 3h3l2 5-2 1.5a15 15 0 0 0 6.5 6.5L16 14l5 2v3a2 2 0 0 1-2 2C10 20 4 14 3 5a2 2 0 0 1 2-2Z"/>',
  tag:'<path d="M3 12V4h8l9 9-7 7-10-8Z"/><circle cx="7.5" cy="8" r="1"/>',
  sliders:'<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>'
};
export function icon(name, extra = '') { return `<svg class="icon ${extra}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`; }
export function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]); }
export const fa = value => new Intl.NumberFormat('fa-IR').format(Number(value) || 0);
export const price = value => `${fa(value)} <span class="product-card__currency">تومان</span>`;
export function latinDigits(value = '') { return String(value).replace(/[۰-۹]/g, n => '۰۱۲۳۴۵۶۷۸۹'.indexOf(n)).replace(/[٠-٩]/g, n => '٠١٢٣٤٥٦٧٨٩'.indexOf(n)); }
export const toFaDate = value => { try { return new Intl.DateTimeFormat('fa-IR', { year:'numeric', month:'long', day:'numeric' }).format(new Date(value)); } catch { return ''; } };
export function image(src, fallback, alt, className = '', options = '') {
  const safe = /^(https:\/\/images\.unsplash\.com\/|assets\/)/.test(src || '') ? src : (fallback || 'assets/hero-fashion.jpg');
  const local = /^assets\//.test(fallback || '') ? fallback : 'assets/hero-fashion.jpg';
  return `<img class="${escapeHTML(className)}" src="${escapeHTML(safe)}" data-fallback="${escapeHTML(local)}" alt="${escapeHTML(alt)}" width="600" height="750" loading="lazy" ${options}>`;
}
export function toast(message, kind = '') {
  const region = document.getElementById('toast-region');
  const item = document.createElement('div');
  item.className = `toast ${kind ? `toast--${kind}` : ''}`;
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 4200);
}
export function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="مسیر صفحه"><a href="index.html">خانه</a>${items.map((item, i) => `<span class="breadcrumb__separator" aria-hidden="true">/</span>${item.href ? `<a href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>` : `<span aria-current="page">${escapeHTML(item.label)}</span>`}`).join('')}</nav>`;
}
export function sectionHeading(title, subtitle = '', href = '', link = 'مشاهده همه', eyebrow = '') {
  return `<div class="section__heading"><div>${eyebrow ? `<p class="section__eyebrow">${escapeHTML(eyebrow)}</p>` : ''}<h2 class="section__title">${escapeHTML(title)}</h2>${subtitle ? `<p class="section__description">${escapeHTML(subtitle)}</p>` : ''}</div>${href ? `<a class="section-link" href="${escapeHTML(href)}">${escapeHTML(link)} ${icon('arrow')}</a>` : ''}</div>`;
}
export function productCard(product) {
  const id = Number(product.id);
  const wished = store.isWishlisted(id);
  return `<article class="product-card" data-product-card="${id}">
    <div class="product-card__visual">
      <a class="product-card__image-link" href="product.html?id=${id}" aria-label="مشاهده ${escapeHTML(product.name)}">${image(product.images?.[0], product.localImages?.[0], product.name, 'product-card__image')}</a>
      <div class="product-card__badges">${product.discountPercent ? `<span class="badge badge--discount">٪${fa(product.discountPercent)}</span>` : (product.tags?.includes('جدید') ? '<span class="badge badge--new">جدید</span>' : '')}</div>
      <button class="icon-button icon-button--white product-card__heart ${wished ? 'is-active' : ''}" type="button" data-wishlist="${id}" aria-label="${wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}" aria-pressed="${wished}">${icon('heart')}</button>
      <div class="product-card__actions"><button class="btn btn--small" type="button" data-quick-add="${id}">افزودن سریع ${icon('bag','icon--sm')}</button><button class="icon-button icon-button--white quick-view" type="button" data-quick-view="${id}" aria-label="مشاهده سریع ${escapeHTML(product.name)}">${icon('eye')}</button></div>
    </div>
    <div class="product-card__body"><p class="product-card__brand">${escapeHTML(getBrandName(product.brand))}</p><h3 class="product-card__title"><a href="product.html?id=${id}">${escapeHTML(product.name)}</a></h3>
      <div class="product-card__price-row"><span class="product-card__price">${price(product.price)}</span>${product.oldPrice ? `<del class="product-card__old">${fa(product.oldPrice)}</del>` : ''}</div>
      <div class="product-card__colors" aria-label="رنگ‌های موجود">${(product.colors || []).map(color => `<span class="color-dot" data-color="${escapeHTML(color.name)}" title="${escapeHTML(color.name)}"></span>`).join('')}</div>
    </div></article>`;
}
export function articleCard(post) {
  return `<article class="article-card"><a class="article-card__image-wrap" href="blog.html?slug=${encodeURIComponent(post.slug)}">${image(post.image, post.localImage, post.title, 'article-card__image')}</a><div class="article-card__body"><div class="article-card__meta"><span>${escapeHTML(post.category)}</span><span>${fa(post.readTime)} دقیقه مطالعه</span></div><h3><a href="blog.html?slug=${encodeURIComponent(post.slug)}">${escapeHTML(post.title)}</a></h3><p>${escapeHTML(post.excerpt)}</p><a class="article-card__more" href="blog.html?slug=${encodeURIComponent(post.slug)}">ادامه مطلب ${icon('arrow','icon--sm')}</a></div></article>`;
}
export function emptyState(title, description, action = 'محصولات را ببینید', href = 'products.html', iconName = 'bag') {
  return `<div class="empty"><div class="empty__icon">${icon(iconName,'icon--lg')}</div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(description)}</p><a class="btn btn--primary" href="${escapeHTML(href)}">${escapeHTML(action)} ${icon('arrow','icon--sm')}</a></div>`;
}
function logo() { return `<a href="index.html" class="logo" aria-label="استایلند، صفحه اصلی"><span class="logo__mark">${icon('spark')}</span><span class="logo__name">استایلند<span class="logo__latin">STYLELAND</span></span></a>`; }
function mega(gender) {
  const label = gender === 'women' ? 'زنانه' : 'مردانه';
  return `<div class="mega"><div><strong>پوشاک ${label}</strong><a href="products.html?gender=${gender}">همه محصولات ${label}</a><a href="products.html?gender=${gender}&amp;category=tops">تیشرت و پیراهن</a><a href="products.html?gender=${gender}&amp;category=outerwear">کاپشن و پالتو</a></div><div><strong>کامل‌کننده استایل</strong><a href="products.html?gender=${gender}&amp;category=shoes">کفش و کتانی</a><a href="products.html?gender=${gender}&amp;category=bags">کیف</a><a href="products.html?gender=${gender}&amp;category=accessories">اکسسوری</a></div>${image('assets/editorial/editorial-couple.jpg','assets/editorial/editorial-couple.jpg','کالکشن استایلند','')}</div>`;
}
export function renderHeader() {
  const page = document.body.dataset.page;
  const gender = new URLSearchParams(location.search).get('gender');
  const links = [
    ['صفحه اصلی','index.html', page === 'home', ''], ['زنانه','products.html?gender=women', gender === 'women', 'women'], ['مردانه','products.html?gender=men', gender === 'men', 'men'],
    ['بچگانه','products.html?gender=kids', gender === 'kids', ''], ['برندها','brands.html', page === 'brands', ''], ['تخفیف‌ها','products.html?sale=1', new URLSearchParams(location.search).get('sale') === '1', ''], ['مجله استایلند','blog.html', page === 'blog', '']
  ];
  document.getElementById('site-header').innerHTML = `<div class="announcement"><div class="container announcement__inner"><span class="announcement__side">به دنیای استایلند خوش اومدی ${icon('spark','icon--sm')}</span><span class="announcement__center">${icon('truck')} ارسال رایگان برای خریدهای بالای ${fa(FREE_SHIPPING_THRESHOLD)} تومان</span><a class="announcement__side" href="blog.html?slug=right-sneakers">راهنمای خرید ${icon('arrow','icon--sm')}</a></div></div>
    <div class="container"><div class="header"><div class="header__main">
      <button class="icon-button header__mobile-menu" type="button" data-open-menu aria-label="باز کردن منو">${icon('menu')}</button>${logo()}
      <div class="header__search"><form class="search-field" action="products.html" role="search">${icon('search')}<label class="visually-hidden" for="header-search">جستجوی محصولات</label><input id="header-search" name="q" type="search" placeholder="جستجوی محصول، برند یا دسته..." autocomplete="off" data-search-input></form><div class="search-results" data-search-results hidden></div></div>
      <div class="header__actions"><button class="icon-button header__mobile-search" type="button" data-open-search aria-label="جستجو">${icon('search')}</button><a class="header__login" href="account.html">${icon('user')} <span data-account-label>${store.getUser() ? 'حساب کاربری' : 'ورود / ثبت‌نام'}</span></a><span class="header__separator"></span><a class="icon-button desktop-heart" href="wishlist.html" aria-label="علاقه‌مندی‌ها">${icon('heart')}<span class="header__count" data-wishlist-count aria-live="polite" hidden>۰</span></a><button class="icon-button" type="button" data-open-cart aria-label="باز کردن سبد خرید">${icon('bag')}<span class="header__count" data-cart-count aria-live="polite" hidden>۰</span></button></div>
    </div><nav class="header__nav" aria-label="ناوبری اصلی"><div class="header__links">${links.map(([label,href,active,menu]) => `<div class="header__nav-item"><a class="header__link ${active ? 'is-active' : ''}" href="${href}" ${active ? 'aria-current="page"' : ''}>${label}${menu ? icon('chevron','icon--sm') : ''}</a>${menu ? mega(menu) : ''}</div>`).join('')}</div><span class="header__nav-note">${icon('spark','icon--sm')} استایلی که شبیه خودته</span></nav></div></div>
    <nav class="mobile-nav" aria-label="ناوبری موبایل"><a href="index.html" class="${page === 'home' ? 'is-active' : ''}">${icon('home')}خانه</a><a href="products.html" class="${page === 'products' ? 'is-active' : ''}">${icon('grid')}دسته‌ها</a><a href="cart.html" class="${page === 'cart' ? 'is-active' : ''}">${icon('bag')}سبد خرید<span class="header__count" data-cart-count hidden>۰</span></a><a href="wishlist.html" class="${page === 'wishlist' ? 'is-active' : ''}">${icon('heart')}علاقه‌مندی</a><a href="account.html" class="${page === 'account' ? 'is-active' : ''}">${icon('user')}حساب من</a></nav>`;
  updateHeaderState();
}
export function renderFooter() {
  document.getElementById('site-footer').innerHTML = `<div class="container"><div class="footer__top"><div class="footer__about">${logo()}<p>استایلند همراه شماست تا با انتخاب‌هایی ساده و دوست‌داشتنی، استایل شخصی خودتان را بسازید. این فروشگاه در حال حاضر نسخه نمایشی است.</p><div class="footer__socials"><a href="mailto:hello@styleland.example" aria-label="ایمیل استایلند">${icon('mail','icon--sm')}</a><a href="blog.html" aria-label="مجله استایلند">${icon('spark','icon--sm')}</a></div></div>
  <div class="footer__col"><h3>راهنمای خرید</h3><a href="products.html">همه محصولات</a><a href="blog.html?slug=right-sneakers">راهنمای انتخاب</a><a href="cart.html">سبد خرید</a><a href="checkout.html">مراحل ثبت سفارش</a></div>
  <div class="footer__col"><h3>خدمات مشتریان</h3><a href="account.html">حساب کاربری</a><a href="wishlist.html">علاقه‌مندی‌ها</a><a href="blog.html">مجله استایلند</a><a href="brands.html">برندها</a></div>
  <div class="footer__col"><h3>تماس با ما</h3><p>پشتیبانی نمایشی فروشگاه</p><a href="mailto:hello@styleland.example" class="ltr">hello@styleland.example</a><p>شنبه تا پنجشنبه، ۹ تا ۱۸</p><p>همیشه کنار استایل شما</p></div></div>
  <div class="footer__bottom"><span>© ${fa(new Date().getFullYear())} استایلند؛ همه حقوق محفوظ است.</span><div class="footer__trust"><span>پرداخت آزمایشی</span><span>ارسال نمونه</span><span>تجربه خرید امن</span></div></div></div>`;
}
export function updateHeaderState() {
  document.querySelectorAll('[data-cart-count]').forEach(el => { const count = store.cartCount(); el.textContent = fa(count); el.hidden = !count; });
  document.querySelectorAll('[data-wishlist-count]').forEach(el => { const count = store.getState().wishlist.length; el.textContent = fa(count); el.hidden = !count; });
  document.querySelectorAll('[data-account-label]').forEach(el => { el.textContent = store.getUser() ? 'حساب کاربری' : 'ورود / ثبت‌نام'; });
  document.querySelectorAll('[data-wishlist]').forEach(el => {
    const active = store.isWishlisted(el.dataset.wishlist);
    el.classList.toggle('is-active', active);
    el.setAttribute('aria-pressed', String(active));
    el.setAttribute('aria-label', active ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها');
  });
}
let previousFocus = null;
export function closeOverlay() {
  const root = document.getElementById('overlay-root');
  root.innerHTML = '';
  document.body.classList.remove('is-locked');
  if (previousFocus?.isConnected) previousFocus.focus();
  previousFocus = null;
}
export function showOverlay(content, overlayClass = '') {
  const root = document.getElementById('overlay-root');
  if (!root.firstElementChild) previousFocus = document.activeElement;
  root.innerHTML = `<div class="overlay ${escapeHTML(overlayClass)}" data-overlay>${content}</div>`;
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => (root.querySelector('[data-autofocus]') || root.querySelector('button,input,a,select,textarea'))?.focus());
}
export function modal(title, body, extra = '') {
  return `<div class="modal ${escapeHTML(extra)}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="modal__head"><h2>${escapeHTML(title)}</h2><button class="icon-button" type="button" data-close-overlay aria-label="بستن">${icon('close')}</button></div><div class="modal__body">${body}</div></div>`;
}
export function drawer(title, body, foot = '', extra = '') {
  return `<div class="drawer ${escapeHTML(extra)}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="drawer__head"><h2>${escapeHTML(title)}</h2><button class="icon-button" type="button" data-close-overlay aria-label="بستن">${icon('close')}</button></div><div class="drawer__body">${body}</div>${foot ? `<div class="drawer__foot">${foot}</div>` : ''}</div>`;
}
function cartKeyAttributes(item) { return `data-id="${Number(item.productId)}" data-color="${escapeHTML(item.color)}" data-size="${escapeHTML(item.size)}"`; }
export function quantityControl(item) {
  const attrs = cartKeyAttributes(item);
  return `<div class="quantity"><button type="button" data-quantity="minus" ${attrs} aria-label="کاهش تعداد">−</button><span>${fa(item.quantity)}</span><button type="button" data-quantity="plus" ${attrs} aria-label="افزایش تعداد">+</button></div>`;
}
export function shippingProgress() {
  const total = store.totals().subtotal;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  return `<div class="shipping-progress">${remaining ? `${fa(remaining)} تومان تا ارسال رایگان فاصله داری` : 'سفارش شما شرایط ارسال رایگان را دارد'}<progress value="${Math.min(total, FREE_SHIPPING_THRESHOLD)}" max="${FREE_SHIPPING_THRESHOLD}" aria-label="پیشرفت ارسال رایگان"></progress></div>`;
}
export function openCartDrawer() {
  const items = store.cartDetails();
  const body = items.length ? `${shippingProgress()}${items.map(item => `<div class="drawer-cart-item">${image(item.product.images[0],item.product.localImages?.[0],item.product.name,'')}<div><h3><a href="product.html?id=${item.productId}">${escapeHTML(item.product.name)}</a></h3><p>${escapeHTML(item.color)} / ${escapeHTML(item.size)}</p><p>${price(item.product.price)}</p><div class="drawer-cart-item__bottom">${quantityControl(item)}<button class="icon-button" data-remove-cart ${cartKeyAttributes(item)} aria-label="حذف ${escapeHTML(item.product.name)}">${icon('trash','icon--sm')}</button></div></div></div>`).join('')}` : `<div class="empty"><div class="empty__icon">${icon('bag')}</div><h3>سبد خریدت خالیه</h3><p>وقتشه چیزهای دوست‌داشتنی پیدا کنی.</p><a class="btn btn--primary" href="products.html">مشاهده محصولات</a></div>`;
  const foot = items.length ? `<div class="summary-card__line"><span>جمع محصولات</span><strong>${price(store.totals().subtotal)}</strong></div><a class="btn btn--primary btn--block" href="cart.html">مشاهده سبد خرید ${icon('arrow','icon--sm')}</a>` : '';
  showOverlay(drawer('سبد خرید', body, foot, 'drawer--end'), 'overlay--cart');
}
function openMenu() {
  showOverlay(drawer('منوی استایلند', `<nav class="mobile-menu-links" aria-label="منوی موبایل"><a href="index.html">صفحه اصلی</a><a href="products.html?gender=women">زنانه</a><a href="products.html?gender=men">مردانه</a><a href="products.html?gender=kids">بچگانه</a><a href="products.html">همه دسته‌ها</a><a href="brands.html">برندها</a><a href="products.html?sale=1">تخفیف‌ها</a><a href="blog.html">مجله استایلند</a><a href="account.html">ورود / حساب کاربری</a></nav>`), 'overlay--menu');
}
function openSearch() {
  showOverlay(drawer('جستجو در استایلند', `<form class="search-field" action="products.html" role="search">${icon('search')}<label class="visually-hidden" for="mobile-search">جستجوی محصول</label><input id="mobile-search" data-autofocus data-search-input name="q" type="search" placeholder="جستجوی محصول، برند یا دسته..." autocomplete="off"></form><div class="search-results search-results--mobile" data-search-results hidden></div><p class="text-muted text-small search-suggestion">نام محصول، برند یا دسته مورد نظرت را جستجو کن.</p>`), 'overlay--search');
}
function available(product, color, size) {
  if (!product.variants?.length) return product.stock > 0;
  return product.variants.some(v => v.color === color && v.size === size && v.stock > 0);
}
export function openQuickView(productId) {
  const product = getProduct(productId);
  if (!product) return;
  let color = product.colors[0]?.name, size = product.sizes[0];
  const first = product.variants?.find(v => v.stock > 0);
  if (first) { color = first.color; size = first.size; }
  const body = `<div class="quick-product" data-quick-product="${Number(product.id)}" data-selected-color="${escapeHTML(color)}" data-selected-size="${escapeHTML(size)}"><div class="quick-product__image">${image(product.images[0], product.localImages?.[0], product.name)}</div><div><p class="product-info__brand">${escapeHTML(getBrandName(product.brand))}</p><h3>${escapeHTML(product.name)}</h3><p class="quick-product__price">${price(product.price)}</p><div class="product-info__choice"><div class="product-info__choice-head">رنگ: <span data-quick-color-label>${escapeHTML(color)}</span></div><div class="product-info__choices">${product.colors.map(c => `<button type="button" class="color-chip ${c.name === color ? 'is-selected' : ''}" data-color="${escapeHTML(c.name)}" data-quick-color="${escapeHTML(c.name)}" aria-label="رنگ ${escapeHTML(c.name)}" aria-pressed="${c.name === color}"></button>`).join('')}</div></div><div class="product-info__choice"><div class="product-info__choice-head">سایز</div><div class="product-info__choices" data-quick-sizes>${quickSizes(product,color,size)}</div></div><button class="btn btn--primary btn--block" type="button" data-quick-confirm ${product.stock <= 0 ? 'disabled' : ''}>افزودن به سبد خرید ${icon('bag','icon--sm')}</button><a class="quick-product__detail" href="product.html?id=${Number(product.id)}">مشاهده جزئیات محصول ${icon('arrow','icon--sm')}</a></div></div>`;
  showOverlay(modal('انتخاب محصول', body, 'modal--wide'));
}
function quickSizes(product, color, selected) { return product.sizes.map(size => `<button type="button" class="chip ${size === selected ? 'is-selected' : ''}" data-quick-size="${escapeHTML(size)}" aria-pressed="${size === selected}" ${available(product,color,size) ? '' : 'disabled'}>${escapeHTML(size)}</button>`).join(''); }
function renderSearch(input) {
  const container = input.closest('.header__search, .drawer__body');
  const results = container?.querySelector('[data-search-results]');
  if (!results) return;
  const query = input.value.trim().toLocaleLowerCase('fa');
  if (!query) { results.hidden = true; results.innerHTML = ''; return; }
  const matches = getCatalog().products.filter(p => `${p.name} ${getBrandName(p.brand)} ${getCategoryName(p.category)}`.toLocaleLowerCase('fa').includes(query)).slice(0,5);
  const highlight = text => {
    const safe = escapeHTML(text), term = escapeHTML(query);
    const index = safe.toLocaleLowerCase('fa').indexOf(term.toLocaleLowerCase('fa'));
    return index < 0 ? safe : `${safe.slice(0, index)}<mark>${safe.slice(index, index + term.length)}</mark>${safe.slice(index + term.length)}`;
  };
  results.innerHTML = matches.length ? `${matches.map(p => `<a class="search-results__item" href="product.html?id=${Number(p.id)}">${image(p.images[0],p.localImages?.[0],p.name)}<span><strong>${highlight(p.name)}</strong><small>${fa(p.price)} تومان</small></span></a>`).join('')}<a class="search-results__all" href="products.html?q=${encodeURIComponent(input.value.trim())}">مشاهده همه نتایج ${icon('arrow','icon--sm')}</a>` : `<p class="search-results__all">محصولی پیدا نشد.</p><a class="search-results__all" href="products.html?q=${encodeURIComponent(input.value.trim())}">مشاهده همه نتایج</a>`;
  results.hidden = false;
}
let searchTimer;
export function bindUI() {
  document.addEventListener('error', event => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.dataset.fallback && img.getAttribute('src') !== img.dataset.fallback) img.src = img.dataset.fallback;
  }, true);
  document.addEventListener('input', event => {
    if (!event.target.matches('[data-search-input]')) return;
    clearTimeout(searchTimer); searchTimer = setTimeout(() => renderSearch(event.target), 250);
  });
  document.addEventListener('submit', async event => {
    const form = event.target.closest('[data-newsletter]');
    if (!form) return;
    event.preventDefault();
    const input = form.elements.email;
    if (!input.reportValidity()) return;
    const button = form.querySelector('button'); button.disabled = true;
    try { await subscribe(input.value); form.reset(); toast('عضویت شما در خبرنامه ثبت شد.', 'success'); }
    catch (error) { toast(error.code === '23505' ? 'این ایمیل پیش‌تر ثبت شده است.' : 'ثبت ایمیل انجام نشد؛ اتصال را بررسی کنید.', 'error'); }
    finally { button.disabled = false; }
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('button, [data-overlay]');
    if (!target) return;
    if (target.matches('[data-overlay]') && event.target === target) return closeOverlay();
    if (target.matches('[data-close-overlay]')) return closeOverlay();
    if (target.matches('[data-open-cart]')) return openCartDrawer();
    if (target.matches('[data-open-menu]')) return openMenu();
    if (target.matches('[data-open-search]')) return openSearch();
    if (target.matches('[data-wishlist]')) { const added = store.toggleWishlist(target.dataset.wishlist); toast(added ? 'به علاقه‌مندی‌ها اضافه شد.' : 'از علاقه‌مندی‌ها حذف شد.'); return; }
    if (target.matches('[data-quick-add],[data-quick-view]')) return openQuickView(target.dataset.quickAdd || target.dataset.quickView);
    if (target.matches('[data-quantity]')) {
      const { id, color, size } = target.dataset;
      const item = store.getState().cart.find(value => String(value.productId) === id && value.color === color && value.size === size);
      if (item) store.setQuantity(id, color, size, item.quantity + (target.dataset.quantity === 'plus' ? 1 : -1));
      if (document.querySelector('.overlay--cart')) openCartDrawer();
      return;
    }
    if (target.matches('[data-remove-cart]')) { store.removeFromCart(target.dataset.id,target.dataset.color,target.dataset.size); toast('محصول از سبد خرید حذف شد.'); if (document.querySelector('.overlay--cart')) openCartDrawer(); return; }
    const quick = target.closest('[data-quick-product]');
    if (quick && target.matches('[data-quick-color]')) {
      const product = getProduct(quick.dataset.quickProduct); const color = target.dataset.quickColor;
      quick.dataset.selectedColor = color; quick.querySelector('[data-quick-color-label]').textContent = color;
      quick.querySelectorAll('[data-quick-color]').forEach(button => { const selected = button.dataset.quickColor === color; button.classList.toggle('is-selected',selected); button.setAttribute('aria-pressed',String(selected)); });
      let size = quick.dataset.selectedSize;
      if (!available(product,color,size)) size = product.sizes.find(value => available(product,color,value)) || '';
      quick.dataset.selectedSize = size; quick.querySelector('[data-quick-sizes]').innerHTML = quickSizes(product,color,size);
      quick.querySelector('[data-quick-confirm]').disabled = !size; return;
    }
    if (quick && target.matches('[data-quick-size]')) {
      quick.dataset.selectedSize = target.dataset.quickSize;
      quick.querySelectorAll('[data-quick-size]').forEach(button => { const selected = button === target; button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed',String(selected)); }); return;
    }
    if (quick && target.matches('[data-quick-confirm]')) {
      const added = store.addToCart(quick.dataset.quickProduct, quick.dataset.selectedColor, quick.dataset.selectedSize);
      if (added) { closeOverlay(); toast('محصول به سبد خرید اضافه شد.', 'success'); } else toast('این ترکیب در حال حاضر موجود نیست.', 'error');
    }
  });
  document.addEventListener('keydown', event => {
    const overlay = document.querySelector('[data-overlay]');
    if (!overlay) return;
    if (event.key === 'Escape') { event.preventDefault(); closeOverlay(); }
    if (event.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden && el.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('styleland:store', updateHeaderState);
  window.addEventListener('styleland:error', event => toast(event.detail,'error'));
}
