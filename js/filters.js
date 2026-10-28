import { getCatalog, getBrandName, getCategoryName } from './supabase.js';
import { breadcrumb, productCard, emptyState, icon, escapeHTML, fa, showOverlay, drawer, closeOverlay, latinDigits } from './ui.js';

const sizes = ['S','M','L','XL','XXL','38','39','40','41','42','43','44','45','46'];
const colors = ['مشکی','سفید','کرم','بژ','قهوه‌ای','طوسی','طلایی','سرمه‌ای'];
const sortLabels = { popular:'پرفروش‌ترین', newest:'جدیدترین', cheapest:'ارزان‌ترین', expensive:'گران‌ترین', discount:'بیشترین تخفیف' };
let state;
let visible = 12;
let bound = false;
const array = value => value ? value.split(',').filter(Boolean) : [];
function readState() {
  const params = new URLSearchParams(location.search);
  return { q:params.get('q') || '', category:params.get('category') || '', gender:params.get('gender') || '', size:array(params.get('size')), color:array(params.get('color')), brand:array(params.get('brand')), min:Number(params.get('min')) || 0, max:Number(params.get('max')) || 5000000, stock:params.get('stock') === '1', sale:params.get('sale') === '1', sort:sortLabels[params.get('sort')] ? params.get('sort') : 'popular' };
}
function writeState() {
  const params = new URLSearchParams();
  for (const key of ['q','category','gender']) if (state[key]) params.set(key,state[key]);
  for (const key of ['size','color','brand']) if (state[key].length) params.set(key,state[key].join(','));
  if (state.min > 0) params.set('min',state.min);
  if (state.max < 5000000) params.set('max',state.max);
  if (state.stock) params.set('stock','1');
  if (state.sale) params.set('sale','1');
  if (state.sort !== 'popular') params.set('sort',state.sort);
  history.replaceState(null,'',`${location.pathname}${params.size ? `?${params}` : ''}`);
}
function filtered() {
  const query = state.q.trim().toLocaleLowerCase('fa');
  const list = getCatalog().products.filter(p => {
    const matchesQuery = !query || `${p.name} ${getBrandName(p.brand)} ${getCategoryName(p.category)}`.toLocaleLowerCase('fa').includes(query);
    return matchesQuery && (!state.category || p.category === state.category) && (!state.gender || p.gender === state.gender || p.gender === 'unisex') &&
      (!state.size.length || state.size.some(size => p.sizes.includes(size))) && (!state.color.length || state.color.some(color => p.colors.some(c => c.name === color))) &&
      (!p.variants?.length || (!state.size.length && !state.color.length && !state.stock) || p.variants.some(v => (!state.size.length || state.size.includes(v.size)) && (!state.color.length || state.color.includes(v.color)) && (!state.stock || v.stock > 0))) &&
      (!state.brand.length || state.brand.includes(p.brand)) && p.price >= state.min && p.price <= state.max && (!state.stock || p.stock > 0) && (!state.sale || p.discountPercent > 0);
  });
  return list.sort((a,b) => ({ newest:() => new Date(b.createdAt) - new Date(a.createdAt), cheapest:() => a.price - b.price, expensive:() => b.price - a.price, discount:() => b.discountPercent - a.discountPercent, popular:() => a.id - b.id })[state.sort]());
}
function filterPanel() {
  const { categories, brands } = getCatalog();
  return `<div class="filters__heading"><h2>${icon('sliders','icon--sm')} فیلترها</h2><button type="button" class="filters__clear" data-filter-clear>پاک کردن همه</button></div>
  <details class="accordion" open><summary>دسته‌بندی</summary><div class="accordion__content filters__options"><label class="check"><input type="radio" name="category-filter" data-filter="category" value="" ${!state.category ? 'checked' : ''}> همه دسته‌ها</label>${categories.map(c => `<label class="check"><input type="radio" name="category-filter" data-filter="category" value="${escapeHTML(c.slug)}" ${state.category === c.slug ? 'checked' : ''}>${escapeHTML(c.name)}</label>`).join('')}</div></details>
  <details class="accordion" open><summary>سایز</summary><div class="accordion__content filters__chips">${sizes.map(size => `<button type="button" class="chip ${state.size.includes(size) ? 'is-selected' : ''}" data-filter-toggle="size" data-value="${size}" aria-pressed="${state.size.includes(size)}">${size}</button>`).join('')}</div></details>
  <details class="accordion" open><summary>رنگ</summary><div class="accordion__content filters__chips">${colors.map(color => `<button type="button" class="color-chip ${state.color.includes(color) ? 'is-selected' : ''}" data-color="${escapeHTML(color)}" data-filter-toggle="color" data-value="${escapeHTML(color)}" aria-label="${escapeHTML(color)}" title="${escapeHTML(color)}" aria-pressed="${state.color.includes(color)}"></button>`).join('')}</div></details>
  <details class="accordion" open><summary>محدوده قیمت</summary><div class="accordion__content filters__price"><div class="range-dual"><input type="range" min="0" max="5000000" step="50000" value="${state.min}" data-filter="min" aria-label="حداقل قیمت"><input type="range" min="0" max="5000000" step="50000" value="${state.max}" data-filter="max" aria-label="حداکثر قیمت"></div><div class="filters__price-inputs"><label><span class="visually-hidden">از قیمت (تومان)</span><input class="input" inputmode="numeric" data-filter="min" value="${fa(state.min)}" aria-label="از قیمت به تومان"></label><label><span class="visually-hidden">تا قیمت (تومان)</span><input class="input" inputmode="numeric" data-filter="max" value="${fa(state.max)}" aria-label="تا قیمت به تومان"></label></div><span class="text-small text-muted">مبلغ به تومان</span></div></details>
  <details class="accordion" open><summary>برند</summary><div class="accordion__content filters__options"><input class="input" type="search" placeholder="جستجوی برند" data-brand-search aria-label="جستجوی برند">${brands.map(b => `<label class="check" data-brand-option="${escapeHTML(b.name.toLowerCase())}"><input type="checkbox" data-filter-multi="brand" value="${escapeHTML(b.slug)}" ${state.brand.includes(b.slug) ? 'checked' : ''}><span dir="ltr">${escapeHTML(b.name)}</span></label>`).join('')}</div></details>
  <div class="filters__bottom"><label class="check"><input type="checkbox" data-filter="stock" ${state.stock ? 'checked' : ''}> فقط کالاهای موجود</label><label class="check"><input type="checkbox" data-filter="sale" ${state.sale ? 'checked' : ''}> فقط کالاهای تخفیف‌دار</label></div>`;
}
function activeChips() {
  const chips = [];
  if (state.q) chips.push(['q','',`جستجو: ${state.q}`]);
  if (state.category) chips.push(['category','',getCategoryName(state.category)]);
  if (state.gender) chips.push(['gender','',({women:'زنانه',men:'مردانه',kids:'بچگانه'})[state.gender] || state.gender]);
  for (const value of state.size) chips.push(['size',value,`سایز ${value}`]);
  for (const value of state.color) chips.push(['color',value,value]);
  for (const value of state.brand) chips.push(['brand',value,getBrandName(value)]);
  if (state.min) chips.push(['min','',`از ${fa(state.min)} تومان`]);
  if (state.max < 5000000) chips.push(['max','',`تا ${fa(state.max)} تومان`]);
  if (state.stock) chips.push(['stock','','موجود']);
  if (state.sale) chips.push(['sale','','تخفیف‌دار']);
  if (!chips.length) return '';
  return `<div class="active-filters" aria-label="فیلترهای فعال">${chips.map(([key,value,label]) => `<span class="active-filter">${escapeHTML(label)}<button type="button" data-filter-remove="${key}" data-value="${escapeHTML(value)}" aria-label="حذف فیلتر ${escapeHTML(label)}">×</button></span>`).join('')}<button class="filters__clear" data-filter-clear type="button">پاک کردن همه</button></div>`;
}
function render() {
  const products = filtered();
  const genderTitle = ({women:'پوشاک زنانه',men:'پوشاک مردانه',kids:'پوشاک بچگانه'})[state.gender];
  const title = state.q ? `نتایج جستجو برای «${state.q}»` : state.category ? getCategoryName(state.category) : genderTitle || (state.sale ? 'تخفیف‌ها' : 'همه محصولات');
  document.getElementById('main-content').innerHTML = `<div class="container">${breadcrumb([{ label:'فروشگاه', href:'products.html' },{ label:title }])}<div class="page-heading"><div><h1>${escapeHTML(title)}</h1><p>${fa(products.length)} محصول برای انتخاب شما</p></div></div><div class="catalog"><aside class="filters" aria-label="فیلتر محصولات">${filterPanel()}</aside><div class="catalog__results"><div class="catalog__toolbar"><button class="btn btn--secondary btn--small catalog__filter-button" type="button" data-open-filters>${icon('filter','icon--sm')} فیلترها</button><span class="text-muted text-small catalog__count">${fa(products.length)} محصول</span><div class="catalog__sort"><label for="sort-products">مرتب‌سازی:</label><select class="select" id="sort-products" data-filter="sort">${Object.entries(sortLabels).map(([value,label]) => `<option value="${value}" ${state.sort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div></div>${activeChips()}${products.length ? `<div class="product-grid">${products.slice(0,visible).map(productCard).join('')}</div>${products.length > visible ? '<div class="catalog__more"><button class="btn btn--secondary" type="button" data-show-more>نمایش محصولات بیشتر</button></div>' : ''}` : emptyState('محصولی پیدا نشد','فیلترها را تغییر بده یا همه محصولات را ببین.','مشاهده همه محصولات','products.html','search')}</div></div></div>`;
}
function openFilters() {
  showOverlay(drawer('فیلتر محصولات', `<div class="filters filters--sheet">${filterPanel()}</div>`, `<button type="button" class="btn btn--primary btn--block" data-close-overlay>نمایش ${fa(filtered().length)} محصول</button>`), 'overlay--filter');
}
function update(reopen = false) { visible = 12; writeState(); render(); if (reopen) openFilters(); }
export function initFilters() {
  state = readState(); visible = 12; render();
  if (bound) return;
  bound = true;
  document.addEventListener('change', event => {
    if (document.body.dataset.page !== 'products') return;
    const target = event.target;
    const sheet = Boolean(target.closest('.overlay--filter'));
    if (target.matches('[data-filter]')) {
      const name = target.dataset.filter;
      if (name === 'stock' || name === 'sale') state[name] = target.checked;
      else if (name === 'min' || name === 'max') {
        const value = Math.max(0,Math.min(5000000,Number(latinDigits(target.value).replace(/[^0-9]/g,'')) || 0));
        state[name] = value;
        if (state.min > state.max) { if (name === 'min') state.max = state.min; else state.min = state.max; }
      } else state[name] = target.value;
      update(sheet);
    } else if (target.matches('[data-filter-multi]')) {
      const name = target.dataset.filterMulti;
      state[name] = target.checked ? [...new Set([...state[name],target.value])] : state[name].filter(x => x !== target.value);
      update(sheet);
    }
  });
  document.addEventListener('input', event => {
    if (!event.target.matches('[data-brand-search]')) return;
    const value = event.target.value.toLowerCase();
    event.target.closest('.filters__options').querySelectorAll('[data-brand-option]').forEach(option => { option.hidden = !option.dataset.brandOption.includes(value); });
  });
  document.addEventListener('click', event => {
    if (document.body.dataset.page !== 'products') return;
    const target = event.target.closest('button'); if (!target) return;
    const sheet = Boolean(target.closest('.overlay--filter'));
    if (target.matches('[data-open-filters]')) return openFilters();
    if (target.matches('[data-show-more]')) { visible += 12; render(); return; }
    if (target.matches('[data-filter-clear]')) { state = { q:'',category:'',gender:'',size:[],color:[],brand:[],min:0,max:5000000,stock:false,sale:false,sort:'popular' }; update(sheet); return; }
    if (target.matches('[data-filter-toggle]')) {
      const name = target.dataset.filterToggle, value = target.dataset.value;
      state[name] = state[name].includes(value) ? state[name].filter(x => x !== value) : [...state[name],value]; update(sheet); return;
    }
    if (target.matches('[data-filter-remove]')) {
      const name = target.dataset.filterRemove, value = target.dataset.value;
      if (Array.isArray(state[name])) state[name] = state[name].filter(x => x !== value);
      else if (name === 'max') state[name] = 5000000;
      else if (name === 'min') state[name] = 0;
      else if (name === 'stock' || name === 'sale') state[name] = false;
      else state[name] = '';
      update();
    }
  });
  window.addEventListener('popstate', () => { if (document.body.dataset.page === 'products') { state = readState(); visible = 12; render(); closeOverlay(); } });
}
