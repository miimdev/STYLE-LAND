import { getBackendPhase, isOnline, placeOrder } from './supabase.js';
import * as store from './store.js';
import { SHIPPING_COSTS, FREE_SHIPPING_THRESHOLD } from './config.js';
import { breadcrumb, emptyState, fa, price, escapeHTML, latinDigits, toast, icon } from './ui.js';

const provinces = ['آذربایجان شرقی','آذربایجان غربی','اردبیل','اصفهان','البرز','ایلام','بوشهر','تهران','چهارمحال و بختیاری','خراسان جنوبی','خراسان رضوی','خراسان شمالی','خوزستان','زنجان','سمنان','سیستان و بلوچستان','فارس','قزوین','قم','کردستان','کرمان','کرمانشاه','کهگیلویه و بویراحمد','گلستان','گیلان','لرستان','مازندران','مرکزی','هرمزگان','همدان','یزد'];
const shippingLabels = { post:'پست پیشتاز', courier:'پیک موتوری', free:'ارسال رایگان' };
const paymentLabels = { online:'پرداخت آنلاین شبیه‌سازی‌شده', cod:'پرداخت در محل (آزمایشی)' };
const emptyCustomer = { fullName:'', phone:'', province:'', city:'', address:'', postalCode:'' };
let customer = { ...emptyCustomer };
let shipping = 'post';
let payment = 'online';
let step = 1;
let accepted = false;
let success = null;
let submitting = false;
let bound = false;

const rules = {
  fullName: value => value.trim().length >= 3 && value.trim().length <= 100 ? '' : 'نام و نام خانوادگی را وارد کنید (حداقل ۳ حرف).',
  phone: value => /^09\d{9}$/.test(latinDigits(value)) ? '' : 'شماره موبایل معتبر وارد کنید؛ مانند ۰۹۱۲۳۴۵۶۷۸۹.',
  province: value => provinces.includes(value) ? '' : 'استان را انتخاب کنید.',
  city: value => value.trim().length >= 2 && value.trim().length <= 80 ? '' : 'نام شهر را وارد کنید.',
  address: value => value.trim().length >= 10 && value.trim().length <= 500 ? '' : 'آدرس را کامل و حداقل در ۱۰ حرف وارد کنید.',
  postalCode: value => /^\d{10}$/.test(latinDigits(value)) ? '' : 'کد پستی باید ۱۰ رقم باشد.'
};
function persistDraft() {
  try { sessionStorage.setItem('styleland:checkout', JSON.stringify({ customer,shipping,payment,step })); } catch { /* session storage is optional */ }
}
function loadDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem('styleland:checkout') || '{}');
    customer = { ...emptyCustomer, ...(draft.customer || {}) };
    shipping = ['post','courier','free'].includes(draft.shipping) ? draft.shipping : 'post';
    payment = ['online','cod'].includes(draft.payment) ? draft.payment : 'online';
    step = [1,2,3].includes(draft.step) ? draft.step : 1;
    if (step > 1 && Object.entries(rules).some(([name,rule]) => rule(customer[name] || ''))) step = 1;
  } catch { customer = { ...emptyCustomer }; step = 1; }
  if (shipping === 'free' && !store.totals('free').eligibleFree) shipping = 'post';
}
function steps() {
  return `<div class="checkout-steps" aria-label="مراحل تسویه حساب">${['اطلاعات شما','روش ارسال','پرداخت و مرور'].map((label,index) => `<div class="checkout-step ${step === index+1 ? 'is-active' : step > index+1 ? 'is-done' : ''}" ${step === index+1 ? 'aria-current="step"' : ''}><span class="checkout-step__number">${step > index+1 ? icon('check','icon--sm') : fa(index+1)}</span><span>${label}</span></div>`).join('')}</div>`;
}
function field(name,label,placeholder, options = {}) {
  const value = escapeHTML(customer[name]);
  const attributes = `id="checkout-${name}" name="${name}" aria-describedby="error-${name}" ${options.inputmode ? `inputmode="${options.inputmode}"` : ''} ${options.autocomplete ? `autocomplete="${options.autocomplete}"` : ''} ${options.maxlength ? `maxlength="${options.maxlength}"` : ''}`;
  let input;
  if (name === 'province') input = `<select class="select" ${attributes}><option value="">استان را انتخاب کنید</option>${provinces.map(p => `<option value="${p}" ${customer[name] === p ? 'selected' : ''}>${p}</option>`).join('')}</select>`;
  else if (name === 'address') input = `<textarea class="textarea" ${attributes} placeholder="${placeholder}">${value}</textarea>`;
  else input = `<input class="input" ${attributes} type="text" value="${value}" placeholder="${placeholder}">`;
  return `<div class="field ${options.full ? 'form-grid__full' : ''}"><label class="field__label" for="checkout-${name}">${label} <span aria-hidden="true">*</span></label>${input}<span class="field__error" id="error-${name}"></span></div>`;
}
function stepOne() {
  return `<form data-checkout-form="1" novalidate><h2 tabindex="-1" data-step-title>اطلاعات تحویل سفارش</h2><p class="checkout-card__intro">لطفاً اطلاعات گیرنده را با دقت وارد کنید.</p><div class="form-grid">
    ${field('fullName','نام و نام خانوادگی','نام گیرنده',{ autocomplete:'name' })}
    ${field('phone','شماره موبایل','۰۹۱۲۳۴۵۶۷۸۹',{ inputmode:'numeric', autocomplete:'tel', maxlength:11 })}
    ${field('province','استان','')}${field('city','شهر','نام شهر',{ autocomplete:'address-level2' })}
    ${field('address','آدرس کامل','خیابان، کوچه، پلاک و واحد',{ full:true, autocomplete:'street-address', maxlength:500 })}
    ${field('postalCode','کد پستی','۱۰ رقم بدون خط تیره',{ inputmode:'numeric', autocomplete:'postal-code', maxlength:10 })}
  </div><div class="checkout-card__actions"><a class="btn btn--secondary" href="cart.html">بازگشت به سبد خرید</a><button class="btn btn--primary" type="submit">ادامه و انتخاب ارسال ${icon('arrow','icon--sm')}</button></div></form>`;
}
function stepTwo() {
  const eligible = store.totals('free').eligibleFree;
  const option = (value,title,description,amount,disabled = false) => `<label class="shipping-option"><input type="radio" name="shipping" value="${value}" ${shipping === value ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="shipping-option__body"><strong>${title}</strong><small>${description}</small></span><span class="shipping-option__price">${amount ? `${fa(amount)} تومان` : 'رایگان'}</span></label>`;
  return `<form data-checkout-form="2"><h2 tabindex="-1" data-step-title>روش ارسال را انتخاب کنید</h2><p class="checkout-card__intro">زمان‌ها و هزینه‌های ارسال در این نسخه آزمایشی هستند.</p>
    ${option('post','پست پیشتاز','تحویل تقریبی ۳ تا ۵ روز کاری',SHIPPING_COSTS.post)}
    ${option('courier','پیک موتوری','تحویل تقریبی ۱ تا ۲ روز کاری',SHIPPING_COSTS.courier)}
    ${option('free','ارسال رایگان',eligible ? 'برای خریدهای بالای ۱٬۶۰۰٬۰۰۰ تومان' : `برای خریدهای بالای ${fa(FREE_SHIPPING_THRESHOLD)} تومان`,0,!eligible)}
    <div class="checkout-card__actions"><button class="btn btn--secondary" type="button" data-checkout-back>مرحله قبل</button><button class="btn btn--primary" type="submit">ادامه و مرور سفارش ${icon('arrow','icon--sm')}</button></div></form>`;
}
function connectionNote() {
  if (getBackendPhase() === 'connecting') return 'در حال بررسی اتصال و حساب شما؛ لطفاً برای ثبت سفارش کمی صبر کنید.';
  if (!isOnline()) return 'اتصال برقرار نیست؛ سفارش فقط به‌صورت نمایشی روی این دستگاه ثبت می‌شود و به سرور ارسال نمی‌شود.';
  if (!store.getUser()) return 'برای ثبت سفارش آزمایشی در حساب خود، ابتدا وارد شوید یا ثبت‌نام کنید.';
  return '';
}
function orderButtonLabel() {
  if (getBackendPhase() === 'connecting') return 'در حال بررسی اتصال';
  return isOnline() && !store.getUser() ? 'ورود و ثبت سفارش' : isOnline() ? 'ثبت سفارش آزمایشی' : 'ثبت نمایشی آفلاین';
}
function stepThree() {
  const note = connectionNote();
  return `<form data-checkout-form="3"><h2 tabindex="-1" data-step-title>مرور و ثبت سفارش</h2><p class="checkout-card__intro">این فرایند نمایشی است؛ هیچ وجهی دریافت یا کالایی ارسال نمی‌شود.</p>
    <div class="review-order"><p><span>گیرنده</span><strong>${escapeHTML(customer.fullName)} · ${escapeHTML(customer.phone)}</strong></p><p><span>آدرس</span><strong>${escapeHTML(customer.province)}، ${escapeHTML(customer.city)}، ${escapeHTML(customer.address)}</strong></p><p><span>کد پستی</span><strong>${escapeHTML(customer.postalCode)}</strong></p><p><span>روش ارسال</span><strong data-review-shipping>${shippingLabels[shipping]}</strong></p></div>
    <h3 class="checkout-subtitle">روش پرداخت</h3>
    <label class="shipping-option"><input type="radio" name="payment" value="online" ${payment === 'online' ? 'checked' : ''}><span class="shipping-option__body"><strong>پرداخت آنلاین (شبیه‌سازی‌شده)</strong><small>اتصال به درگاه واقعی انجام نمی‌شود.</small></span></label>
    <label class="shipping-option"><input type="radio" name="payment" value="cod" ${payment === 'cod' ? 'checked' : ''}><span class="shipping-option__body"><strong>پرداخت در محل (آزمایشی)</strong><small>فقط برای نمایش روند سفارش.</small></span></label>
    <label class="check checkout-terms"><input type="checkbox" name="terms" ${accepted ? 'checked' : ''}> نمایشی بودن سفارش و شرایط ثبت آن را می‌پذیرم.</label><span class="field__error" data-terms-error></span>
    <p class="checkout-login-note" data-checkout-connection role="status" ${note ? '' : 'hidden'}>${note}</p>
    <div class="checkout-card__actions"><button class="btn btn--secondary" type="button" data-checkout-back>مرحله قبل</button><button class="btn btn--primary" type="submit" data-order-submit ${getBackendPhase() === 'connecting' ? 'disabled' : ''}>${orderButtonLabel()} ${icon('arrow','icon--sm')}</button></div></form>`;
}
function summary() {
  const { subtotal, discount, shipping: fee, total } = store.totals(shipping);
  return `<details class="summary-card checkout-summary" open><summary>خلاصه سفارش <span>${fa(store.cartCount())} کالا</span></summary><div class="checkout-summary__items">${store.cartDetails().map(item => `<div><span>${escapeHTML(item.product.name)} × ${fa(item.quantity)}</span><strong>${fa(item.product.price*item.quantity)}</strong></div>`).join('')}</div><div class="summary-card__line"><span>جمع محصولات</span><strong>${price(subtotal)}</strong></div>${discount ? `<div class="summary-card__line"><span>تخفیف ${escapeHTML(store.getState().coupon?.code)}</span><strong>− ${price(discount)}</strong></div>` : ''}<div class="summary-card__line"><span>هزینه ارسال</span><strong>${fee ? price(fee) : 'رایگان'}</strong></div><div class="summary-card__line summary-card__line--total"><span>مبلغ نهایی</span><strong>${price(total)}</strong></div></details>`;
}
function renderSuccess() {
  const online = !success.offline;
  document.getElementById('main-content').innerHTML = `<div class="container">${breadcrumb([{label:'تسویه حساب'}])}<section class="checkout-card checkout-success"><div class="checkout-success__icon">${icon('check','icon--lg')}</div><h1>${online ? 'سفارش آزمایشی ثبت شد' : 'سفارش نمایشی آفلاین آماده شد'}</h1><p>${online ? 'سفارش در حساب شما ثبت شد. پرداختی انجام نشده و کالایی ارسال نخواهد شد.' : 'این کد فقط روی همین دستگاه ساخته شده و سفارشی به سرور ارسال نشده است.'}</p><span class="checkout-success__code">${escapeHTML(success.trackingCode)}</span><p>کد پیگیری ${online ? 'آزمایشی' : 'محلی'} شما</p><div><a class="btn btn--primary" href="${online ? 'account.html' : 'products.html'}">${online ? 'مشاهده سفارش‌ها' : 'ادامه خرید'}</a> <a class="btn btn--secondary" href="index.html">بازگشت به خانه</a></div></section></div>`;
}
function render() {
  if (success) return renderSuccess();
  if (!store.cartDetails().length) {
    document.getElementById('main-content').innerHTML = `<div class="container">${breadcrumb([{label:'تسویه حساب'}])}${emptyState('سبد خریدت خالیه','برای شروع، محصول مورد علاقه‌ات را به سبد خرید اضافه کن.','رفتن به فروشگاه','products.html','bag')}</div>`;
    return;
  }
  if (shipping === 'free' && !store.totals('free').eligibleFree) shipping = 'post';
  document.getElementById('main-content').innerHTML = `<div class="container">${breadcrumb([{label:'سبد خرید',href:'cart.html'},{label:'تسویه حساب'}])}<h1 class="checkout-title">تسویه حساب</h1>${steps()}<div class="checkout-layout"><section class="checkout-card">${step === 1 ? stepOne() : step === 2 ? stepTwo() : stepThree()}</section>${summary()}</div></div>`;
}
// Update totals and connection status without replacing in-progress checkout fields.
export function refreshCheckout() {
  if (success || document.body.dataset.page !== 'checkout') return;
  const form = document.querySelector('[data-checkout-form]');
  if (!store.cartDetails().length || !form) { render(); return; }
  if (shipping === 'free' && !store.totals('free').eligibleFree) { shipping = 'post'; persistDraft(); }
  const oldSummary = document.querySelector('.checkout-summary');
  if (oldSummary) {
    const wasOpen = oldSummary.open;
    const wasFocused = oldSummary.contains(document.activeElement);
    oldSummary.outerHTML = summary();
    const nextSummary = document.querySelector('.checkout-summary');
    nextSummary.open = wasOpen;
    if (wasFocused) nextSummary.querySelector('summary')?.focus({ preventScroll:true });
  }
  const free = form.querySelector('[name="shipping"][value="free"]');
  if (free) {
    free.disabled = !store.totals('free').eligibleFree;
    const selected = form.querySelector(`[name="shipping"][value="${shipping}"]`);
    if (selected) selected.checked = true;
  }
  const shippingLabel = form.querySelector('[data-review-shipping]');
  if (shippingLabel) shippingLabel.textContent = shippingLabels[shipping];
  const status = form.querySelector('[data-checkout-connection]');
  if (status) { status.textContent = connectionNote(); status.hidden = !status.textContent; }
  const button = form.querySelector('[data-order-submit]');
  if (button) {
    button.disabled = getBackendPhase() === 'connecting' || submitting;
    button.innerHTML = `${orderButtonLabel()} ${icon('arrow','icon--sm')}`;
  }
}
function showFieldError(input) {
  const message = rules[input.name]?.(input.value) || '';
  const error = document.getElementById(`error-${input.name}`);
  if (error) error.textContent = message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}
function validateForm(form) {
  const invalid = [];
  for (const name of Object.keys(rules)) {
    const input = form.elements[name];
    customer[name] = ['phone','postalCode'].includes(name) ? latinDigits(input.value).trim() : input.value.trim();
    input.value = customer[name];
    if (!showFieldError(input)) invalid.push(input);
  }
  if (invalid.length) invalid[0].focus();
  return !invalid.length;
}
export function initCheckout() {
  loadDraft(); success = null; accepted = false; render();
  if (bound) return;
  bound = true;
  document.addEventListener('input', event => {
    if (document.body.dataset.page !== 'checkout') return;
    if (event.target.closest('[data-checkout-form="1"]') && rules[event.target.name]) {
      customer[event.target.name] = event.target.value;
      persistDraft();
      if (event.target.getAttribute('aria-invalid') === 'true') showFieldError(event.target);
    }
  });
  document.addEventListener('focusout', event => {
    if (event.target.closest('[data-checkout-form="1"]') && rules[event.target.name]) showFieldError(event.target);
  });
  document.addEventListener('change', event => {
    if (document.body.dataset.page !== 'checkout') return;
    if (event.target.closest('[data-checkout-form="1"]') && rules[event.target.name]) { customer[event.target.name] = event.target.value; persistDraft(); }
    if (event.target.name === 'shipping') { shipping = event.target.value; persistDraft(); render(); }
    if (event.target.name === 'payment') { payment = event.target.value; persistDraft(); }
    if (event.target.name === 'terms') { accepted = event.target.checked; const error = document.querySelector('[data-terms-error]'); if (error) error.textContent = ''; }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-checkout-back]')) return;
    step = Math.max(1,step-1); persistDraft(); render(); document.querySelector('[data-step-title]')?.focus();
  });
  document.addEventListener('submit', async event => {
    const form = event.target.closest('[data-checkout-form]'); if (!form) return;
    event.preventDefault();
    if (step === 1) { if (!validateForm(form)) return; step = 2; persistDraft(); render(); document.querySelector('[data-step-title]')?.focus(); return; }
    if (step === 2) { step = 3; persistDraft(); render(); document.querySelector('[data-step-title]')?.focus(); return; }
    if (getBackendPhase() === 'connecting') { toast('در حال بررسی اتصال و حساب شما هستیم؛ کمی صبر کنید.'); return; }
    if (submitting) return;
    if (!accepted) { form.querySelector('[data-terms-error]').textContent = 'برای ادامه، شرایط سفارش آزمایشی را بپذیرید.'; form.elements.terms.focus(); return; }
    if (isOnline() && !store.getUser()) { persistDraft(); location.href = 'account.html?return=checkout'; return; }
    const button = form.querySelector('[type="submit"]'); button.disabled = true; submitting = true;
    try {
      if (isOnline()) {
        success = await placeOrder(store.getState().cart,customer,shipping,payment,store.getState().coupon?.code);
      } else {
        const bytes = new Uint8Array(4); crypto.getRandomValues(bytes);
        success = { trackingCode:`LOCAL-${Array.from(bytes, byte => byte.toString(16).padStart(2,'0')).join('').toUpperCase()}`, offline:true };
      }
      store.clearCart();
      try { sessionStorage.removeItem('styleland:checkout'); } catch { /* optional */ }
      renderSuccess(); window.scrollTo({top:0,behavior:'smooth'});
    } catch (error) {
      const message = /OUT_OF_STOCK/.test(error.message) ? 'موجودی یکی از کالاها تغییر کرده است؛ سبد خرید را بررسی کنید.' : /INVALID_COUPON/.test(error.message) ? 'کد تخفیف دیگر معتبر نیست.' : 'ثبت سفارش انجام نشد؛ لطفاً دوباره تلاش کنید.';
      toast(message,'error'); button.disabled = false;
    } finally { submitting = false; }
  });
  window.addEventListener('styleland:store', refreshCheckout);
}
