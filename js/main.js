import { initBackend, getCatalog, getProduct, getBrandName, getCategoryName, getSession, getClient, isOnline, getBackendPhase, finishBackendInitialization, checkCoupon, getReviews, addReview, signIn, signUp, signOut, getOrders, getProfile, updateProfile } from './supabase.js';
import * as store from './store.js';
import { FREE_SHIPPING_THRESHOLD } from './config.js';
import { icon, escapeHTML as e, fa, price, latinDigits, toFaDate, image, toast, breadcrumb, sectionHeading, productCard, articleCard, emptyState, renderHeader, renderFooter, updateHeaderState, refreshLiveSearch, bindUI, showOverlay, closeOverlay, modal, quantityControl, shippingProgress } from './ui.js';
import { initFilters, refreshFilters } from './filters.js';
import { initCheckout, refreshCheckout } from './checkout.js';
import { initMotion, observeMotion } from './motion.js';

const main = document.getElementById('main-content');
let sliderTimer;
let countdownTimer;
let productSelection = { color:'', size:'', quantity:1, tab:'description', gallery:0, reviews:[] };
let accountTab = 'orders';
let authTab = 'login';
let accountData = { orders:[], profile:null };
let blogCategory = 'همه';
let blogQuery = '';
let brandLetter = 'همه';
let simulatedOtp = '';
let couponChecking = false;
const page = document.body.dataset.page;

function renderHome() {
  const { products, categories, brands, posts } = getCatalog();
  const benefits = [
    ['truck','ارسال رایگان','برای سفارش‌های بالای ۱٬۶۰۰٬۰۰۰ تومان'], ['shield','ضمانت اصالت کالا','تمام محصولات با ضمانت اصالت'],
    ['headset','پشتیبانی ۲۴/۷','همیشه همراه و پاسخگوی شما'], ['refresh','۷ روز ضمانت بازگشت','در صورت عدم رضایت از خرید']
  ];
  main.innerHTML = `<div class="container"><section class="hero-layout" aria-label="کالکشن جدید و مزایای استایلند"><aside class="benefits" aria-label="مزایای خرید">${benefits.map(([symbol,title,text]) => `<div class="benefit"><span class="benefit__icon">${icon(symbol)}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join('')}</aside>
    <div class="hero" aria-roledescription="اسلایدر" aria-label="پیشنهادهای استایلند">
      <div class="hero__slide is-active" data-slide="0" aria-hidden="false"><img class="hero__image" src="assets/hero-fashion.webp" data-fallback="assets/hero-fashion.jpg" width="1600" height="900" fetchpriority="high" decoding="async" alt="مدل‌های زن و مرد در کالکشن جدید استایلند"><div class="hero__content"><p class="hero__eyebrow">کالکشن جدید استایلند</p><h1 class="hero__title">استایل جدیدتو <span>از اینجا</span> شروع کن</h1><p class="hero__description">جدیدترین کالکشن‌های زنانه و مردانه از برندهای معتبر دنیا</p><a href="products.html?sort=newest" class="btn btn--primary">مشاهده کالکشن جدید ${icon('arrow','icon--sm')}</a></div></div>
      <div class="hero__slide hero__slide--secondary" data-slide="1" aria-hidden="true" inert>${image('https://images.unsplash.com/photo-1507297448044-a99b358cd06e?w=1400&q=80&fit=crop','assets/editorial/editorial-couple.jpg','استایل روزمره زنانه و مردانه','hero__image')}<div class="hero__content"><p class="hero__eyebrow">فرصت‌های دوست‌داشتنی</p><h2 class="hero__title">فصل تازه، <span>انتخاب تازه</span></h2><p class="hero__description">آیتم‌های محبوبت را با تخفیف‌های ویژه پیدا کن.</p><a href="products.html?sale=1" class="btn btn--primary">مشاهده تخفیف‌ها ${icon('arrow','icon--sm')}</a></div></div>
      <div class="hero__slide hero__slide--secondary" data-slide="2" aria-hidden="true" inert>${image('https://images.unsplash.com/photo-1630484179057-75e24310e2ff?w=1400&q=80&fit=crop','assets/products/bag-brown.jpg','اکسسوری و کیف برای استایل روزمره','hero__image')}<div class="hero__content"><p class="hero__eyebrow">جزئیات متفاوت</p><h2 class="hero__title">استایلت را <span>کامل کن</span></h2><p class="hero__description">اکسسوری‌هایی برای لحظه‌های ساده و خاص تو.</p><a href="products.html?category=accessories" class="btn btn--primary">کشف اکسسوری‌ها ${icon('arrow','icon--sm')}</a></div></div>
      <div class="hero__dots" aria-label="انتخاب اسلاید">${[0,1,2].map(i => `<button class="hero__dot" type="button" data-slide-to="${i}" aria-label="نمایش اسلاید ${fa(i+1)}" aria-current="${i===0}"></button>`).join('')}</div><button class="hero__pause" type="button" data-slider-toggle aria-label="توقف چرخش خودکار اسلایدها" aria-pressed="false"><span aria-hidden="true">Ⅱ</span></button><span class="hero__number" data-slide-number>01 / 03</span>
    </div></section>
    <section class="section" aria-label="دسته‌بندی‌های محبوب">${sectionHeading('دسته‌بندی‌های محبوب','از هر چیزی که دوست داری، شروع کن.','products.html','همه دسته‌ها','EXPLORE THE COLLECTION')}<div class="category-grid no-scrollbar" data-home-categories>${categories.map(c => `<a class="category-card" href="products.html?category=${encodeURIComponent(c.slug)}">${image(c.image,c.localImage,c.name,'category-card__image')}<div class="category-card__body"><h3>${e(c.name)}</h3>${icon('arrow','icon--sm category-card__arrow')}</div></a>`).join('')}</div></section>
    <section class="section style-edit" aria-labelledby="style-edit-title">
      <div class="style-edit__heading"><div><p class="section__eyebrow">THE STYLELAND EDIT / 01</p><h2 id="style-edit-title">استایل، از <span>جزئیات</span> شروع می‌شه.</h2><p>سه انتخاب، برای هزار جور خودت بودن.</p></div><a class="section-link" href="products.html">کشف همه مجموعه‌ها ${icon('arrow','icon--sm')}</a></div>
      <div class="style-edit__grid no-scrollbar">
        <a class="style-story style-story--women" href="products.html?gender=women">${image('assets/editorial/women-campaign.jpg','assets/editorial/women-campaign.jpg','استایل زنانه با پالتوی کرم','style-story__image')}<span class="style-story__index" aria-hidden="true">01 / WOMEN</span><span class="style-story__copy"><span>برای روزهای خودت</span><strong>دنیای زنانه</strong><span class="style-story__link">کشف مجموعه ${icon('arrow','icon--sm')}</span></span></a>
        <a class="style-story style-story--men" href="products.html?gender=men">${image('assets/editorial/men-campaign.jpg','assets/editorial/men-campaign.jpg','استایل مردانه با پیراهن ذغالی','style-story__image')}<span class="style-story__index" aria-hidden="true">02 / MEN</span><span class="style-story__copy"><span>ساده و بی‌تکرار</span><strong>دنیای مردانه</strong><span class="style-story__link">کشف مجموعه ${icon('arrow','icon--sm')}</span></span></a>
        <a class="style-story style-story--details" href="products.html?category=accessories">${image('assets/editorial/accessories-campaign.jpg','assets/editorial/accessories-campaign.jpg','کیف چرمی، ساعت و عینک آفتابی','style-story__image')}<span class="style-story__index" aria-hidden="true">03 / DETAILS</span><span class="style-story__copy"><span>تکمیل‌کننده هر استایل</span><strong>جزئیات خاص</strong><span class="style-story__link">کشف اکسسوری ${icon('arrow','icon--sm')}</span></span></a>
      </div><p class="style-edit__footnote"><span>CURATED FOR YOUR EVERYDAY</span><span>سبک تو، داستان تو ${icon('spark','icon--sm')}</span></p>
    </section>
    <section class="section">${sectionHeading('پیشنهادهای ویژه','منتخب‌هایی برای استایل هر روز تو','products.html?sale=1','مشاهده همه','CURATED FOR YOU')}<div class="product-grid" data-home-featured>${products.slice(0,6).map(productCard).join('')}</div></section>
    <section class="section"><div class="deal-banner"><div class="deal-banner__copy"><span class="deal-banner__icon">${icon('tag','icon--lg')}</span><div><p class="section__eyebrow">A LITTLE SOMETHING FOR YOU</p><h2>یه تخفیف، برای حال خوبت</h2><p>پیشنهادهای ویژه منتخب، برای مدتی محدود</p></div></div><div class="deal-banner__action"><div class="countdown" data-countdown aria-label="زمان باقی‌مانده"></div><a class="btn btn--primary" href="products.html?sale=1">مشاهده تخفیف‌ها ${icon('arrow','icon--sm')}</a></div></div></section>
    <section class="section"><div class="section__heading"><div><p class="section__eyebrow">FIND YOUR FAVORITES</p><h2 class="section__title">برای سلیقه تو</h2><p class="section__description">محبوب‌ها و تازه‌رسیده‌ها را از دست نده</p></div><a class="section-link" href="products.html">مشاهده همه ${icon('arrow','icon--sm')}</a></div><div class="tabs home-tabs" role="tablist" aria-label="مرتب‌سازی محصولات"><button class="tab" role="tab" aria-selected="true" data-home-tab="new">جدیدترین‌ها</button><button class="tab" role="tab" aria-selected="false" data-home-tab="best">پرفروش‌ترین‌ها</button></div><div class="product-grid home-products" data-home-products>${[...products].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6).map(productCard).join('')}</div></section>
    <section class="section"><div class="collection-grid"><a class="collection" href="products.html?gender=women">${image('https://images.unsplash.com/photo-1648066380643-675d30c3cd17?w=900&q=80&fit=crop','assets/products/trench.jpg','کالکشن زنانه')}<div class="collection__content"><p>برای خودِ منحصر‌به‌فردت</p><h3>کالکشن زنانه</h3><span class="btn btn--small">مشاهده کالکشن ${icon('arrow','icon--sm')}</span></div></a><a class="collection" href="products.html?gender=men">${image('https://images.unsplash.com/photo-1603233176974-0a4333ee6078?w=900&q=80&fit=crop','assets/products/coat-men.jpg','کالکشن مردانه')}<div class="collection__content"><p>سادگی، همیشه جذابه</p><h3>کالکشن مردانه</h3><span class="btn btn--small">مشاهده کالکشن ${icon('arrow','icon--sm')}</span></div></a></div></section>
    <section class="section">${sectionHeading('برندهای منتخب','نام‌هایی که دوستشان داریم','brands.html','همه برندها','OUR FAVORITE BRANDS')}<div class="brand-strip" data-home-brands>${brands.map(b=>`<a href="products.html?brand=${encodeURIComponent(b.slug)}" dir="ltr">${e(b.name)}</a>`).join('')}</div></section>
    <section class="section">${sectionHeading('از مجله استایلند','ایده‌های تازه برای استایل هر روز','blog.html','همه مطالب','THE STYLE JOURNAL')}<div class="article-grid" data-home-posts>${posts.slice(0,3).map(articleCard).join('')}</div></section>
    <section class="section"><div class="newsletter"><div class="newsletter__title"><span class="newsletter__icon">${icon('mail')}</span><div><h2>خبرهای خوب رو از دست نده</h2><p>برای باخبر شدن از تازه‌ها و پیشنهادهای استایلند عضو شو.</p></div></div><form class="newsletter__form" data-newsletter><label class="visually-hidden" for="newsletter-email">آدرس ایمیل</label><input class="input" id="newsletter-email" type="email" name="email" placeholder="آدرس ایمیل شما" required maxlength="254" dir="ltr"><button class="btn btn--accent" type="submit">عضویت در خبرنامه</button></form></div></section>
  </div>`;
  initSlider(); initCountdown();
}
function initSlider() {
  clearInterval(sliderTimer);
  const hero = document.querySelector('.hero'); if (!hero) return;
  let current = 0, paused = false, userPaused = false, startX = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = hero.querySelector('[data-slider-toggle]');
  if (reducedMotion) toggle.hidden = true;
  const show = value => {
    current = (value + 3) % 3;
    hero.querySelectorAll('[data-slide]').forEach(slide => {
      const active = Number(slide.dataset.slide) === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    hero.querySelectorAll('[data-slide-to]').forEach(dot => dot.setAttribute('aria-current',String(Number(dot.dataset.slideTo) === current)));
    hero.querySelector('[data-slide-number]').textContent = `0${current+1} / 03`;
  };
  hero.addEventListener('click', event => {
    const dot = event.target.closest('[data-slide-to]'); if (dot) show(Number(dot.dataset.slideTo));
    if (event.target.closest('[data-slider-toggle]')) {
      userPaused = !userPaused;
      toggle.setAttribute('aria-pressed',String(userPaused));
      toggle.setAttribute('aria-label',userPaused?'ادامه چرخش خودکار اسلایدها':'توقف چرخش خودکار اسلایدها');
      toggle.querySelector('span').textContent=userPaused?'▶':'Ⅱ';
    }
  });
  hero.addEventListener('mouseenter', () => { paused = true; }); hero.addEventListener('mouseleave', () => { paused = false; });
  hero.addEventListener('focusin', () => { paused = true; }); hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) paused = false; });
  hero.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive:true });
  hero.addEventListener('touchend', event => { const delta = event.changedTouches[0].clientX - startX; if (Math.abs(delta)>50) show(current + (delta < 0 ? 1 : -1)); }, { passive:true });
  if (!reducedMotion) sliderTimer = setInterval(() => { if (!paused && !userPaused && !document.hidden) show(current+1); },5000);
}
function initCountdown() {
  clearInterval(countdownTimer);
  const target = new Date('2026-11-05T20:30:00+03:30').getTime();
  const update = () => {
    const el = document.querySelector('[data-countdown]'); if (!el) return;
    const seconds = Math.max(0,Math.floor((target-Date.now())/1000));
    if (!seconds) { el.innerHTML = '<span class="countdown__ended">پایان یافت</span>'; clearInterval(countdownTimer); return; }
    const values = [[Math.floor(seconds/86400),'روز'],[Math.floor(seconds/3600)%24,'ساعت'],[Math.floor(seconds/60)%60,'دقیقه'],[seconds%60,'ثانیه']];
    el.innerHTML = values.map(([n,label]) => `<span>${fa(n)}<small>${label}</small></span>`).join('');
  };
  update(); countdownTimer = setInterval(update,1000);
}
function selectedProduct() { return getProduct(new URLSearchParams(location.search).get('id')); }
function available(product,color,size) { return product.variants?.length ? product.variants.some(v=>v.color===color && v.size===size && v.stock>0) : product.stock>0; }
function productSizes(product) { return product.sizes.map(size => `<button type="button" class="chip ${productSelection.size===size?'is-selected':''}" data-product-size="${e(size)}" aria-pressed="${productSelection.size===size}" ${available(product,productSelection.color,size)?'':'disabled'}>${e(size)}</button>`).join(''); }
function reviewList() {
  const reviews = productSelection.reviews;
  return reviews.length ? reviews.map(review => `<article class="review"><div class="review__head"><span>${e(review.display_name)}</span><span class="rating">${icon('star','rating__star')} ${fa(review.rating)}</span></div><p>${e(review.comment)}</p></article>`).join('') : '<p>هنوز نظری ثبت نشده است.</p>';
}
function productReviews() {
  return `<div data-review-list>${reviewList()}</div>${store.getUser() ? `<form class="review-form" data-review-form><h3>نظر شما</h3><label class="field"><span class="field__label">نام نمایشی</span><input class="input" name="displayName" required minlength="1" maxlength="80" value="${e(store.getUser().user_metadata?.full_name || '')}"></label><label class="field"><span class="field__label">امتیاز</span><select class="select" name="rating">${[5,4,3,2,1].map(n=>`<option value="${n}">${fa(n)} از ۵</option>`).join('')}</select></label><label class="field"><span class="field__label">دیدگاه</span><textarea class="textarea" name="comment" required minlength="3" maxlength="1000"></textarea></label><button class="btn btn--primary" type="submit">ثبت نظر</button></form>` : '<p class="review-login">برای ثبت نظر <a href="account.html">وارد حساب کاربری شوید.</a></p>'}`;
}
function productPanel(product) {
  switch(productSelection.tab) {
    case 'specs': return `<div class="spec-list">${Object.entries(product.specs||{}).map(([key,value])=>`<div><span>${e(key)}</span><strong>${e(value)}</strong></div>`).join('')}</div>`;
    case 'care': return '<p>برای حفظ کیفیت، راهنمای شست‌وشو و نگهداری روی محصول را مطالعه کنید. از شوینده ملایم استفاده کنید و محصول را دور از نور مستقیم نگه دارید.</p>';
    case 'shipping': return '<p>روش‌ها و هزینه‌های ارسال در این نسخه نمایشی هستند. خریدهای بالای ۱٬۶۰۰٬۰۰۰ تومان امکان انتخاب ارسال رایگان دارند؛ شرایط بازگشت در نسخه عملیاتی مشخص خواهد شد.</p>';
    case 'reviews': return productReviews();
    default: return `<p>${e(product.description)}</p>`;
  }
}
function addJsonLd(product) {
  document.querySelectorAll('[data-dynamic-jsonld]').forEach(el=>el.remove());
  const schema = { '@context':'https://schema.org','@type':'Product',name:product.name,image:product.images,description:product.description,sku:`SL-${product.id}`,brand:{'@type':'Brand',name:getBrandName(product.brand)},offers:{'@type':'Offer',priceCurrency:'IRR',price:product.price*10,availability:product.stock?'https://schema.org/InStock':'https://schema.org/OutOfStock',url:location.href} };
  const script=document.createElement('script'); script.type='application/ld+json'; script.dataset.dynamicJsonld='product'; script.textContent=JSON.stringify(schema).replace(/</g,'\\u003c'); document.head.append(script);
  const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'خانه',item:new URL('index.html',location.href).href},{'@type':'ListItem',position:2,name:getCategoryName(product.category),item:new URL(`products.html?category=${product.category}`,location.href).href},{'@type':'ListItem',position:3,name:product.name,item:location.href}]};
  const crumbScript=document.createElement('script'); crumbScript.type='application/ld+json'; crumbScript.dataset.dynamicJsonld='breadcrumbs'; crumbScript.textContent=JSON.stringify(crumbs).replace(/</g,'\\u003c'); document.head.append(crumbScript);
  document.title = `${product.name} | استایلند`;
}
function readViewed() { try { return JSON.parse(localStorage.getItem('styleland:viewed')||'[]'); } catch { return []; } }
function saveViewed(id) { try { localStorage.setItem('styleland:viewed',JSON.stringify([id,...readViewed().filter(x=>x!==id)].slice(0,8))); } catch { /* optional */ } }
async function renderProduct() {
  const product=selectedProduct();
  if (!product) { main.innerHTML=`<div class="container">${breadcrumb([{label:'محصول'}])}${emptyState('این محصول پیدا نشد','ممکن است نشانی محصول تغییر کرده باشد.','بازگشت به فروشگاه','products.html','search')}</div>`; return; }
  const first=product.variants?.find(v=>v.stock>0);
  productSelection={ color:first?.color || product.colors[0]?.name, size:first?.size || product.sizes[0], quantity:1,tab:'description',gallery:0,reviews:[] };
  const recent=readViewed().filter(id=>id!==product.id).map(getProduct).filter(Boolean).slice(0,6); saveViewed(product.id);
  const similar=getCatalog().products.filter(p=>p.category===product.category && p.id!==product.id).slice(0,6);
  addJsonLd(product);
  main.innerHTML=`<div class="container">${breadcrumb([{label:getCategoryName(product.category),href:`products.html?category=${encodeURIComponent(product.category)}`},{label:product.name}])}<section class="product-detail"><div class="gallery"><div class="gallery__thumbs">${product.images.map((url,index)=>`<button class="gallery__thumb ${index===0?'is-selected':''}" type="button" data-gallery="${index}" aria-label="تصویر ${fa(index+1)} محصول" aria-pressed="${index===0}">${image(url,product.localImages?.[index],`${product.name}، تصویر ${fa(index+1)}`)}</button>`).join('')}</div><div class="gallery__main" data-gallery-main>${image(product.images[0],product.localImages?.[0],product.name,'','loading="eager" fetchpriority="high"')}</div></div>
    <div class="product-info"><p class="product-info__brand">${e(getBrandName(product.brand))}</p><h1>${e(product.name)}</h1><div class="product-info__meta"><span class="rating">${icon('star','rating__star')} ${fa(product.rating)} <span>(${fa(product.reviewsCount)} نظر)</span></span><span>کد محصول: ${fa(product.id+1000)}</span></div><div class="product-info__price"><strong>${fa(product.price)} <small>تومان</small></strong>${product.oldPrice?`<del>${fa(product.oldPrice)}</del><span class="badge badge--discount">٪${fa(product.discountPercent)} تخفیف</span>`:''}</div>
    <div class="product-info__choice"><div class="product-info__choice-head"><span>رنگ: <span data-product-color-label>${e(productSelection.color)}</span></span></div><div class="product-info__choices" data-product-colors>${product.colors.map(c=>`<button class="color-chip ${c.name===productSelection.color?'is-selected':''}" type="button" data-color="${e(c.name)}" data-product-color="${e(c.name)}" aria-label="رنگ ${e(c.name)}" aria-pressed="${c.name===productSelection.color}" ${product.sizes.some(size=>available(product,c.name,size))?'':'disabled'}></button>`).join('')}</div></div>
    <div class="product-info__choice"><div class="product-info__choice-head"><span>سایز: <span data-product-size-label>${e(productSelection.size)}</span></span><button class="btn btn--ghost" type="button" data-size-guide>راهنمای سایز</button></div><div class="product-info__choices" data-product-sizes>${productSizes(product)}</div></div>
    <div class="product-info__actions"><div class="quantity"><button type="button" data-product-quantity="minus" aria-label="کاهش تعداد">−</button><span data-product-quantity-value>۱</span><button type="button" data-product-quantity="plus" aria-label="افزایش تعداد">+</button></div><button type="button" class="btn btn--primary add-main" data-add-product ${!product.stock?'disabled':''}>افزودن به سبد خرید ${icon('bag','icon--sm')}</button><button class="icon-button icon-button--white ${store.isWishlisted(product.id)?'is-active':''}" type="button" data-wishlist="${product.id}" aria-label="افزودن به علاقه‌مندی‌ها" aria-pressed="${store.isWishlisted(product.id)}">${icon('heart')}</button></div>
    <div class="product-info__trust"><span>${icon('truck')} ارسال رایگان مشروط</span><span>${icon('shield')} تضمین اصالت</span><span>${icon('refresh')} ۷ روز بازگشت</span></div></div></section>
    <section class="section product-tabs"><div class="tabs" role="tablist" aria-label="اطلاعات محصول">${[['description','توضیحات'],['specs','مشخصات'],['care','نگهداری'],['shipping','ارسال و بازگشت'],['reviews','نظرات کاربران']].map(([id,title])=>`<button type="button" class="tab" role="tab" data-product-tab="${id}" aria-selected="${id==='description'}">${title}</button>`).join('')}</div><div class="product-tabs__panel" role="tabpanel" data-product-panel>${productPanel(product)}</div></section>
    ${similar.length?`<section class="section">${sectionHeading('محصولات مشابه','انتخاب‌هایی نزدیک به سلیقه شما','products.html?category='+encodeURIComponent(product.category))}<div class="product-grid">${similar.map(productCard).join('')}</div></section>`:''}${recent.length?`<section class="section">${sectionHeading('اخیراً مشاهده‌شده','نگاهی دوباره به انتخاب‌های قبلی')}<div class="product-grid">${recent.map(productCard).join('')}</div></section>`:''}</div>
    <div class="mobile-add"><span><strong>${fa(product.price)}</strong> <small>تومان</small></span><button class="btn btn--primary" type="button" data-add-product ${!product.stock?'disabled':''}>افزودن به سبد خرید</button></div>`;
  let x=0; const gallery=document.querySelector('[data-gallery-main]');
  gallery.addEventListener('touchstart',event=>{x=event.touches[0].clientX;},{passive:true});
  gallery.addEventListener('touchend',event=>{const delta=event.changedTouches[0].clientX-x;if(Math.abs(delta)>50) changeGallery(product,(productSelection.gallery+(delta<0?1:-1)+product.images.length)%product.images.length);},{passive:true});
  productSelection.reviews=await getReviews(product.id);
  if (productSelection.tab==='reviews') { const list=document.querySelector('[data-review-list]'); if(list) list.innerHTML=reviewList(); }
}
function changeGallery(product,index) {
  productSelection.gallery=index;
  document.querySelector('[data-gallery-main]').innerHTML=image(product.images[index],product.localImages?.[index],`${product.name}، تصویر ${fa(index+1)}`);
  document.querySelectorAll('[data-gallery]').forEach(btn=>{const active=Number(btn.dataset.gallery)===index;btn.classList.toggle('is-selected',active);btn.setAttribute('aria-pressed',String(active));});
}
function updateProductPanel(product) {
  document.querySelectorAll('[data-product-tab]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.productTab===productSelection.tab)));
  const panel=document.querySelector('[data-product-panel]'); if(panel) panel.innerHTML=productPanel(product);
}
function renderCart() {
  const items=store.cartDetails();
  if (!items.length) { main.innerHTML=`<div class="container">${breadcrumb([{label:'سبد خرید'}])}<div class="page-heading"><h1>سبد خرید</h1></div>${emptyState('سبد خریدت هنوز خالیه','وقتشه از بین محصولات دوست‌داشتنی، انتخاب خودت رو پیدا کنی.','رفتن به فروشگاه','products.html','bag')}<section class="section">${sectionHeading('شاید این‌ها را دوست داشته باشی','','products.html')}<div class="product-grid">${getCatalog().products.slice(0,6).map(productCard).join('')}</div></section></div>`; return; }
  const sum=store.totals('post');
  main.innerHTML=`<div class="container">${breadcrumb([{label:'سبد خرید'}])}<div class="page-heading"><div><h1>سبد خرید شما</h1><p>${fa(store.cartCount())} کالا در سبد خرید</p></div></div><div class="cart-layout"><div>${shippingProgress()}<div class="cart-list">${items.map(item=>`<article class="cart-item">${image(item.product.images[0],item.product.localImages?.[0],item.product.name,'cart-item__image')}<div class="cart-item__content"><p>${e(getBrandName(item.product.brand))}</p><h3><a href="product.html?id=${item.productId}">${e(item.product.name)}</a></h3><p>رنگ: ${e(item.color)} · سایز: ${e(item.size)}</p><span class="cart-item__price">${price(item.product.price)}</span></div><div class="cart-item__actions"><button class="icon-button cart-item__remove" type="button" data-remove-cart data-id="${item.productId}" data-color="${e(item.color)}" data-size="${e(item.size)}" aria-label="حذف ${e(item.product.name)}">${icon('trash')}</button>${quantityControl(item)}</div></article>`).join('')}</div></div>
    <aside class="summary-card"><h2>خلاصه سفارش</h2><div class="summary-card__line"><span>جمع محصولات (${fa(store.cartCount())})</span><strong>${price(sum.subtotal)}</strong></div><div class="summary-card__line"><span>تخفیف کد</span><strong>${sum.discount?`− ${price(sum.discount)}`:'—'}</strong></div><div class="summary-card__line"><span>ارسال پیشتاز (تخمینی)</span><strong>${price(sum.shipping)}</strong></div><form class="coupon-form" data-coupon-form><label class="visually-hidden" for="coupon-code">کد تخفیف</label><input class="input ltr" id="coupon-code" name="coupon" placeholder="کد تخفیف" value="${e(store.getState().coupon?.code||'')}" maxlength="30"><button class="btn btn--secondary btn--small" type="submit" ${couponChecking?'disabled':''}>اعمال</button></form>${store.getState().coupon?`<p class="coupon-applied">کد ${e(store.getState().coupon.code)} اعمال شد. <button type="button" data-remove-coupon>حذف</button></p>`:''}<div class="summary-card__line summary-card__line--total"><span>مبلغ قابل پرداخت</span><strong>${price(sum.total)}</strong></div><a class="btn btn--primary btn--block" href="checkout.html">ادامه و ثبت سفارش ${icon('arrow','icon--sm')}</a><p class="summary-card__note">هزینه نهایی با انتخاب روش ارسال مشخص می‌شود. ثبت و پرداخت در این نسخه آزمایشی است.</p></aside></div></div>`;
}
function renderCartPreservingInput() {
  const input = document.querySelector('#coupon-code');
  const value = input?.value;
  const focused = input === document.activeElement;
  const start = focused ? input.selectionStart : null, end = focused ? input.selectionEnd : null;
  renderCart();
  const replacement = document.querySelector('#coupon-code');
  if (replacement && value !== undefined) {
    replacement.value = value;
    if (focused) { replacement.focus({ preventScroll:true }); replacement.setSelectionRange(start, end); }
  }
}
function renderWishlist() {
  const products=store.getState().wishlist.map(getProduct).filter(Boolean);
  main.innerHTML=`<div class="container">${breadcrumb([{label:'علاقه‌مندی‌ها'}])}<div class="page-heading"><div><h1>علاقه‌مندی‌های من</h1><p>${fa(products.length)} محصول ذخیره‌شده</p></div></div>${products.length?`<div class="product-grid">${products.map(productCard).join('')}</div>`:emptyState('هنوز چیزی به علاقه‌مندی‌ها اضافه نکردی','محصولات مورد علاقه‌ات را با قلب ذخیره کن تا بعداً راحت پیدایشان کنی.','کشف محصولات','products.html','heart')}</div>`;
}
function authForm() {
  const signup=authTab==='signup';
  const phase=getBackendPhase();
  const status=phase==='connecting'?'در حال برقراری اتصال به حساب کاربری هستیم؛ می‌توانید اطلاعاتتان را وارد کنید.':!isOnline()?'اتصال به حساب کاربری در حال حاضر برقرار نیست. سبد و علاقه‌مندی‌ها روی همین دستگاه می‌مانند.':'';
  return `<div class="account-card account-auth"><div class="tabs" role="tablist" aria-label="ورود یا ثبت‌نام"><button class="tab" type="button" role="tab" data-auth-tab="login" aria-selected="${!signup}">ورود</button><button class="tab" type="button" role="tab" data-auth-tab="signup" aria-selected="${signup}">ثبت‌نام</button></div><h1>${signup?'به استایلند خوش اومدی':'خوش برگشتی'}</h1><p class="account-auth__intro">${signup?'برای ساخت حساب، اطلاعات زیر را وارد کن.':'با ایمیل و رمز عبورت وارد حساب شو.'}</p><p class="checkout-login-note" data-auth-status role="status" ${status?'':'hidden'}>${status}</p><form data-auth-form>${signup?'<label class="field"><span class="field__label">نام و نام خانوادگی</span><input class="input" name="fullName" autocomplete="name" minlength="3" maxlength="100" required></label>':''}<label class="field"><span class="field__label">ایمیل</span><input class="input ltr" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label class="field"><span class="field__label">رمز عبور</span><input class="input ltr" name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" required minlength="8" maxlength="128" placeholder="حداقل ۸ کاراکتر"></label><button class="btn btn--primary btn--block" type="submit" ${phase==='connecting'||!isOnline()?'disabled':''}>${signup?'ساخت حساب کاربری':'ورود به حساب'}</button><p class="text-muted text-small">${signup?'تأیید ایمیل برای فعال‌سازی حساب لازم است.':'ورود با ایمیل و رمز عبور انجام می‌شود.'}</p><p class="field__error" data-auth-error role="alert"></p></form><button class="btn btn--secondary btn--block account-otp" type="button" data-open-otp>ورود با موبایل (نمایشی)</button></div>`;
}
function accountPanel() {
  const profile=accountData.profile || {};
  if(accountTab==='orders') return `<h2>سفارش‌های من</h2><p class="account-panel__intro">سفارش‌های آزمایشی ثبت‌شده در حساب شما</p>${accountData.orders.length?accountData.orders.map(order=>`<article class="order-row"><div><strong class="ltr">${e(order.tracking_code)}</strong><p class="text-muted">${toFaDate(order.created_at)} · ${e(order.order_items?.map(x=>x.product_name).join('، ')||'سفارش')}</p></div><div><strong>${price(order.total)}</strong><p class="text-muted">آزمایشی، پرداخت‌نشده</p></div></article>`).join(''):emptyState('هنوز سفارشی ثبت نکردی','اولین انتخاب خود را در فروشگاه پیدا کن.','مشاهده محصولات','products.html','bag')}`;
  if(accountTab==='addresses') return `<h2>آدرس‌های من</h2><p class="account-panel__intro">آدرس‌ها به حساب شما متصل هستند.</p>${(profile.addresses||[]).map((address,index)=>`<div class="address-row"><p>${e(address)}</p><button class="btn btn--ghost" type="button" data-delete-address="${index}">حذف</button></div>`).join('') || '<p class="text-muted text-small">هنوز آدرسی ذخیره نشده است.</p>'}<form class="account-edit-form" data-address-form><label class="field"><span class="field__label">افزودن آدرس</span><textarea class="textarea" name="address" required minlength="10" maxlength="500" placeholder="استان، شهر و آدرس کامل"></textarea></label><button class="btn btn--secondary" type="submit">ذخیره آدرس</button></form>`;
  return `<h2>اطلاعات حساب</h2><p class="account-panel__intro">ایمیل: <span class="ltr">${e(store.getUser()?.email||'')}</span></p><form class="account-edit-form" data-profile-form><label class="field"><span class="field__label">نام و نام خانوادگی</span><input class="input" name="fullName" value="${e(profile.full_name||'')}" maxlength="100"></label><label class="field"><span class="field__label">شماره موبایل (اختیاری)</span><input class="input ltr" name="phone" value="${e(profile.phone||'')}" inputmode="numeric" maxlength="11" placeholder="09xxxxxxxxx"></label><button class="btn btn--primary" type="submit">ذخیره تغییرات</button></form>`;
}
function renderAccount() {
  const user=store.getUser();
  main.innerHTML=`<div class="container">${breadcrumb([{label:'حساب کاربری'}])}${!user?authForm():`<div class="page-heading"><div><h1>حساب کاربری</h1><p>سلام ${e(accountData.profile?.full_name || user.user_metadata?.full_name || 'دوست استایلندی')}، خوش اومدی.</p></div></div><div class="account-layout"><aside class="account-card account-menu" aria-label="منوی حساب"><button type="button" data-account-tab="orders" class="${accountTab==='orders'?'is-active':''}">سفارش‌های من</button><button type="button" data-account-tab="addresses" class="${accountTab==='addresses'?'is-active':''}">آدرس‌های من</button><button type="button" data-account-tab="profile" class="${accountTab==='profile'?'is-active':''}">اطلاعات حساب</button><button type="button" data-signout>خروج از حساب</button></aside><section class="account-card account-panel">${accountPanel()}</section></div>`}</div>`;
}
async function loadAccount() {
  if (!store.getUser()) { accountData={ orders:[],profile:null }; renderAccount(); return; }
  try { const [orders,profile]=await Promise.all([getOrders(),getProfile(store.getUser())]); accountData={orders,profile}; }
  catch { toast('دریافت اطلاعات حساب انجام نشد.','error'); accountData={orders:[],profile:null}; }
  renderAccount();
}
function renderBlog() {
  const {posts}=getCatalog(); const slug=new URLSearchParams(location.search).get('slug');
  if(slug) {
    const post=posts.find(p=>p.slug===slug);
    if(!post){main.innerHTML=`<div class="container">${breadcrumb([{label:'مجله',href:'blog.html'},{label:'مطلب پیدا نشد'}])}${emptyState('این مطلب پیدا نشد','به مجله برگرد و مطالب دیگر را بخوان.','رفتن به مجله','blog.html','search')}</div>`;return;}
    document.title=`${post.title} | مجله استایلند`;
    main.innerHTML=`<div class="container">${breadcrumb([{label:'مجله استایلند',href:'blog.html'},{label:post.title}])}<article class="article-detail"><header class="article-detail__header"><span class="badge badge--discount">${e(post.category)}</span><h1>${e(post.title)}</h1><p class="text-muted text-small">${toFaDate(post.publishedAt)} · ${fa(post.readTime)} دقیقه مطالعه</p></header>${image(post.image,post.localImage,post.title,'article-detail__image')}<div class="article-detail__body">${post.body.map(paragraph=>`<p>${e(paragraph)}</p>`).join('')}</div></article><section class="section">${sectionHeading('مطالب بیشتر','','blog.html')}<div class="article-grid">${posts.filter(p=>p.slug!==slug).slice(0,3).map(articleCard).join('')}</div></section></div>`;return;
  }
  const categories=['همه',...new Set(posts.map(p=>p.category))];
  main.innerHTML=`<div class="container">${breadcrumb([{label:'مجله استایلند'}])}<div class="page-heading"><div><p class="section__eyebrow">THE STYLE JOURNAL</p><h1>مجله استایلند</h1><p>ایده‌ها، داستان‌ها و راهنمایی‌هایی برای استایل تو</p></div></div><div class="blog-filters"><div class="tabs" role="tablist" aria-label="دسته‌های مجله">${categories.map(c=>`<button type="button" class="tab" role="tab" data-blog-category="${e(c)}" aria-selected="${blogCategory===c}">${e(c)}</button>`).join('')}</div><label class="visually-hidden" for="blog-search">جستجوی مطالب</label><input class="input" id="blog-search" data-blog-search type="search" value="${e(blogQuery)}" placeholder="جستجو در مجله..."></div><div data-blog-results></div></div>`;
  renderBlogResults();
}
function renderBlogResults() {
  const results=getCatalog().posts.filter(p=>(blogCategory==='همه'||p.category===blogCategory)&&`${p.title} ${p.excerpt}`.includes(blogQuery.trim()));
  const el=document.querySelector('[data-blog-results]'); if(el) patchArea(el,results.length?`<div class="article-grid">${results.map(articleCard).join('')}</div>`:emptyState('مطلبی پیدا نشد','عبارت دیگری را جستجو کن.','همه مطالب','blog.html','search'));
  document.querySelectorAll('[data-blog-category]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.blogCategory===blogCategory)));
}
function renderBrands() {
  const brands=getCatalog().brands; const letters=['همه',...new Set(brands.map(b=>b.name[0].toUpperCase()))].sort((a,b)=>a==='همه'?-1:b==='همه'?1:a.localeCompare(b));
  const visible=brandLetter==='همه'?brands:brands.filter(b=>b.name[0].toUpperCase()===brandLetter);
  main.innerHTML=`<div class="container">${breadcrumb([{label:'برندها'}])}<div class="page-heading"><div><p class="section__eyebrow">BRANDS WE LOVE</p><h1>برندهای منتخب</h1><p>برند محبوبت را پیدا کن و مجموعه‌اش را ببین.</p></div></div><div class="brand-filter" aria-label="فیلتر الفبایی برند">${letters.map(letter=>`<button type="button" class="chip ${letter===brandLetter?'is-selected':''}" data-brand-letter="${e(letter)}" aria-pressed="${letter===brandLetter}">${e(letter)}</button>`).join('')}</div><div class="brand-grid">${visible.map(b=>`<a class="brand-card" href="products.html?brand=${encodeURIComponent(b.slug)}" dir="ltr">${e(b.name)}</a>`).join('')}</div></div>`;
}
function render404() { main.innerHTML=`<div class="container"><div class="error-page"><p class="error-page__number">404</p><h1>این صفحه رو پیدا نکردیم!</h1><p>شاید نشانی تغییر کرده یا صفحه دیگری را دنبال می‌کردی.</p><a class="btn btn--primary" href="index.html">بازگشت به صفحه اصلی ${icon('arrow','icon--sm')}</a></div></div>`; }
function renderPage() {
  switch(page) { case 'home':return renderHome();case 'products':return initFilters();case 'product':return renderProduct();case 'cart':return renderCart();case 'checkout':return initCheckout();case 'wishlist':return renderWishlist();case 'account':return loadAccount();case 'blog':return renderBlog();case 'brands':return renderBrands();default:return render404(); }
}
function bindPageEvents() {
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button'); if(!button)return;
    if(button.matches('[data-home-tab]')) {
      const tab=button.dataset.homeTab; document.querySelectorAll('[data-home-tab]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));
      const products=[...getCatalog().products].sort(tab==='new'?(a,b)=>new Date(b.createdAt)-new Date(a.createdAt):(a,b)=>a.id-b.id);
      document.querySelector('[data-home-products]').innerHTML=products.slice(0,6).map(productCard).join(''); return;
    }
    if(page==='product') {
      const product=selectedProduct(); if(!product)return;
      if(button.matches('[data-gallery]')) { changeGallery(product,Number(button.dataset.gallery)); return; }
      if(button.matches('[data-product-color]')) {
        productSelection.color=button.dataset.productColor;
        if(!available(product,productSelection.color,productSelection.size))productSelection.size=product.sizes.find(size=>available(product,productSelection.color,size))||'';
        productSelection.quantity=1;
        document.querySelector('[data-product-color-label]').textContent=productSelection.color;
        document.querySelector('[data-product-size-label]').textContent=productSelection.size;
        document.querySelector('[data-product-quantity-value]').textContent=fa(1);
        document.querySelectorAll('[data-product-color]').forEach(b=>{const selected=b===button;b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));});
        document.querySelector('[data-product-sizes]').innerHTML=productSizes(product);
        document.querySelectorAll('[data-add-product]').forEach(b=>{b.disabled=!available(product,productSelection.color,productSelection.size);}); return;
      }
      if(button.matches('[data-product-size]')) {
        productSelection.size=button.dataset.productSize; productSelection.quantity=1;
        document.querySelector('[data-product-size-label]').textContent=productSelection.size; document.querySelector('[data-product-quantity-value]').textContent=fa(1);
        document.querySelector('[data-product-sizes]').innerHTML=productSizes(product);
        document.querySelectorAll('[data-add-product]').forEach(b=>{b.disabled=!available(product,productSelection.color,productSelection.size);}); return;
      }
      if(button.matches('[data-product-quantity]')) {
        const variant=product.variants?.find(v=>v.color===productSelection.color&&v.size===productSelection.size);
        productSelection.quantity=Math.max(1,Math.min(10,variant?.stock??10,productSelection.quantity+(button.dataset.productQuantity==='plus'?1:-1)));
        document.querySelector('[data-product-quantity-value]').textContent=fa(productSelection.quantity); return;
      }
      if(button.matches('[data-add-product]')) { const ok=store.addToCart(product.id,productSelection.color,productSelection.size,productSelection.quantity); toast(ok?'محصول به سبد خرید اضافه شد.':'این محصول یا سایز در حال حاضر موجود نیست.',ok?'success':'error'); return; }
      if(button.matches('[data-product-tab]')) { productSelection.tab=button.dataset.productTab; updateProductPanel(product); return; }
      if(button.matches('[data-size-guide]')) { showOverlay(modal('راهنمای انتخاب سایز',`<p class="text-muted text-small">اندازه‌ها نمونه هستند؛ پیش از خرید واقعی راهنمای هر محصول را بررسی کنید.</p><div class="size-guide"><div><strong>سایز</strong><strong>دور سینه (سانتی‌متر)</strong></div><div><span>S</span><span>۸۶–۹۲</span></div><div><span>M</span><span>۹۳–۹۹</span></div><div><span>L</span><span>۱۰۰–۱۰۶</span></div><div><span>XL</span><span>۱۰۷–۱۱۳</span></div><div><span>XXL</span><span>۱۱۴–۱۲۰</span></div></div>`)); return; }
    }
    if(button.matches('[data-remove-coupon]')) { const input=document.querySelector('#coupon-code'); if(input)input.value=''; store.setCoupon(null); toast('کد تخفیف حذف شد.'); return; }
    if(button.matches('[data-open-otp]')) { showOverlay(modal('شبیه‌سازی کد موبایل', `<p class="text-muted text-small">این بخش فقط نمایش رابط است؛ پیامکی ارسال و ورود واقعی انجام نمی‌شود.</p><form class="account-edit-form" data-otp-form="phone"><label class="field"><span class="field__label">شماره موبایل</span><input class="input ltr" type="text" name="phone" inputmode="numeric" maxlength="11" required placeholder="09xxxxxxxxx"></label><button class="btn btn--primary" type="submit">دریافت کد نمایشی</button></form>`)); return; }
    if(button.matches('[data-auth-tab]')) { authTab=button.dataset.authTab; renderAccount(); return; }
    if(button.matches('[data-account-tab]')) { accountTab=button.dataset.accountTab; renderAccount(); return; }
    if(button.matches('[data-signout]')) {
      button.disabled=true;
      try { await signOut(); await store.setUser(null); accountTab='orders'; accountData={orders:[],profile:null}; renderAccount(); toast('از حساب خارج شدی.'); }
      catch { button.disabled=false; toast('خروج از حساب انجام نشد.','error'); } return;
    }
    if(button.matches('[data-delete-address]')) {
      const profile=accountData.profile, user=store.getUser(); if(!profile||!user)return;
      const addresses=(Array.isArray(profile.addresses)?profile.addresses:[]).filter((_,index)=>index!==Number(button.dataset.deleteAddress));
      try { await updateProfile(user,{addresses}); accountData.profile={...profile,addresses}; renderAccount(); toast('آدرس حذف شد.','success'); }
      catch { toast('حذف آدرس انجام نشد.','error'); } return;
    }
    if(button.matches('[data-blog-category]')) { blogCategory=button.dataset.blogCategory; renderBlogResults(); return; }
    if(button.matches('[data-brand-letter]')) { brandLetter=button.dataset.brandLetter; renderBrands(); }
  });
  document.addEventListener('input',event=>{if(event.target.matches('[data-blog-search]')){blogQuery=event.target.value;renderBlogResults();}});
  document.addEventListener('submit',async event=>{
    const form=event.target;
    if(form.matches('[data-otp-form]')) {
      event.preventDefault();
      if(form.dataset.otpForm==='phone') {
        const phone=latinDigits(form.elements.phone.value.trim());
        if(!/^09\d{9}$/.test(phone)){toast('شماره موبایل معتبر وارد کنید.','error');form.elements.phone.focus();return;}
        const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);simulatedOtp=String(100000+(bytes[0]%900000));
        showOverlay(modal('کد تأیید نمایشی', `<p class="text-muted text-small">هیچ پیامکی ارسال نشده است. کد آزمایشی برای این نمایش: <strong class="ltr">${fa(simulatedOtp)}</strong></p><form class="account-edit-form" data-otp-form="code"><label class="field"><span class="field__label">کد نمایشی</span><input class="input ltr" name="code" inputmode="numeric" maxlength="6" required></label><button class="btn btn--primary" type="submit">بررسی کد</button></form>`));
      } else if(latinDigits(form.elements.code.value.trim())===simulatedOtp) { closeOverlay(); simulatedOtp=''; toast('کد نمایشی درست بود؛ ورود واقعی انجام نشد.'); }
      else toast('کد نمایشی درست نیست.','error');
      return;
    }
    if(form.matches('[data-coupon-form]')) {
      event.preventDefault(); const value=form.elements.coupon.value.trim(); if(!value){toast('کد تخفیف را وارد کنید.','error');return;}
      if(couponChecking)return;
      couponChecking=true; form.querySelector('button').disabled=true;
      try { const coupon=await checkCoupon(value); if(!coupon){toast('کد تخفیف معتبر نیست.','error');return;} store.setCoupon(coupon);toast(coupon.offline?'کد نمونه به‌صورت آفلاین اعمال شد.':'کد تخفیف با موفقیت اعمال شد.','success'); }
      catch { toast('بررسی کد تخفیف انجام نشد.','error'); }
      finally { couponChecking=false; const button=document.querySelector('[data-coupon-form] button'); if(button)button.disabled=false; } return;
    }
    if(form.matches('[data-review-form]')) {
      event.preventDefault();if(!form.reportValidity())return;const user=store.getUser(),product=selectedProduct();if(!user||!product)return;
      const button=form.querySelector('button[type=submit]');button.disabled=true;
      try { await addReview(product.id,user,form.elements.displayName.value.trim(),Number(form.elements.rating.value),form.elements.comment.value.trim());productSelection.reviews=await getReviews(product.id);updateProductPanel(product);toast('نظر شما ثبت شد.','success'); }
      catch {button.disabled=false;toast('ثبت نظر انجام نشد؛ اتصال را بررسی کنید.','error');}return;
    }
    if(form.matches('[data-auth-form]')) {
      event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]'),errorEl=form.querySelector('[data-auth-error]');button.disabled=true;errorEl.textContent='';
      try {
        const email=form.elements.email.value.trim(),password=form.elements.password.value;
        const result=authTab==='signup'?await signUp(email,password,form.elements.fullName.value.trim()):await signIn(email,password);
        if(result.session?.user||result.user&&authTab==='login') {
          await store.setUser(result.session?.user||result.user); toast('با موفقیت وارد شدی.','success');
          if(new URLSearchParams(location.search).get('return')==='checkout'){location.href='checkout.html';return;}
          await loadAccount();
        } else { errorEl.textContent='حساب ساخته شد؛ برای فعال‌سازی، ایمیل تأیید را بررسی کنید.'; errorEl.classList.add('form-success');button.disabled=false; }
      } catch(error) {
        const message=String(error.message||'');
        errorEl.textContent=/Invalid login|invalid_credentials/i.test(message)?'ایمیل یا رمز عبور درست نیست.':/Email not confirmed/i.test(message)?'ابتدا ایمیل خود را تأیید کنید.':/already registered|already been registered/i.test(message)?'این ایمیل قبلاً ثبت شده است.':/rate limit|email.*send/i.test(message)?'ارسال ایمیل تأیید ممکن نشد؛ تنظیمات ایمیل فروشگاه را بررسی کنید.':'ورود یا ثبت‌نام انجام نشد؛ اتصال و اطلاعات را بررسی کنید.';
        button.disabled=false;
      }return;
    }
    if(form.matches('[data-profile-form]')) {
      event.preventDefault();const phone=latinDigits(form.elements.phone.value.trim());
      if(phone&&!/^09\d{9}$/.test(phone)){toast('شماره موبایل معتبر وارد کنید.','error');form.elements.phone.focus();return;}
      const user=store.getUser();if(!user)return;
      try {const values={full_name:form.elements.fullName.value.trim(),phone};await updateProfile(user,values);accountData.profile={...(accountData.profile||{}),...values};renderAccount();toast('اطلاعات حساب ذخیره شد.','success');}
      catch {toast('ذخیره اطلاعات انجام نشد.','error');}return;
    }
    if(form.matches('[data-address-form]')) {
      event.preventDefault();if(!form.reportValidity())return;const user=store.getUser();if(!user)return;
      const addresses=[...(Array.isArray(accountData.profile?.addresses)?accountData.profile.addresses:[]),form.elements.address.value.trim()].slice(-20);
      try {await updateProfile(user,{addresses});accountData.profile={...(accountData.profile||{}),addresses};renderAccount();toast('آدرس ذخیره شد.','success');}
      catch {toast('ذخیره آدرس انجام نشد.','error');}
    }
  });
  window.addEventListener('styleland:store',()=>{if(page==='cart')renderCartPreservingInput();if(page==='wishlist')renderWishlist();observeMotion();});
}
// Background catalog refreshes update only the relevant regions. A focused
// control, an open overlay, or an in-progress form is never replaced.
const pendingAreas = new Map();
const pendingViews = new Map();
function patchArea(element, html) {
  if (!element) return;
  if (element.contains(document.activeElement)) { pendingAreas.set(element, html); return; }
  pendingAreas.delete(element);
  element.innerHTML = typeof html === 'function' ? html() : html;
  observeMotion();
}
function scheduleMainRefresh(name, callback) {
  if (document.querySelector('[data-overlay]') || (document.activeElement !== main && main.contains(document.activeElement))) {
    pendingViews.set(name, callback);
    return;
  }
  pendingViews.delete(name);
  callback();
  observeMotion();
}
function flushBackgroundUpdates() {
  for (const [element, html] of pendingAreas) {
    if (!element.isConnected) pendingAreas.delete(element);
    else if (!element.contains(document.activeElement)) patchArea(element, html);
  }
  if (!document.querySelector('[data-overlay]') && (document.activeElement === main || !main.contains(document.activeElement))) {
    for (const [name, callback] of [...pendingViews]) scheduleMainRefresh(name, callback);
  }
}
function refreshHome(changed) {
  const { products, categories, brands, posts } = getCatalog();
  if (changed.includes('categories')) patchArea(document.querySelector('[data-home-categories]'), categories.map(c => `<a class="category-card" href="products.html?category=${encodeURIComponent(c.slug)}">${image(c.image,c.localImage,c.name,'category-card__image')}<div class="category-card__body"><h3>${e(c.name)}</h3>${icon('arrow','icon--sm category-card__arrow')}</div></a>`).join(''));
  if (changed.includes('products') || changed.includes('brands')) {
    patchArea(document.querySelector('[data-home-featured]'), () => getCatalog().products.slice(0,6).map(productCard).join(''));
    patchArea(document.querySelector('[data-home-products]'), () => {
      const tab = document.querySelector('[data-home-tab][aria-selected="true"]')?.dataset.homeTab || 'new';
      const sorted = [...getCatalog().products].sort(tab==='new' ? (a,b)=>new Date(b.createdAt)-new Date(a.createdAt) : (a,b)=>a.id-b.id);
      return sorted.slice(0,6).map(productCard).join('');
    });
  }
  if (changed.includes('brands')) patchArea(document.querySelector('[data-home-brands]'), brands.map(b=>`<a href="products.html?brand=${encodeURIComponent(b.slug)}" dir="ltr">${e(b.name)}</a>`).join(''));
  if (changed.includes('posts')) patchArea(document.querySelector('[data-home-posts]'), posts.slice(0,3).map(articleCard).join(''));
}
function refreshProductDetails() {
  const product = selectedProduct();
  const detail = document.querySelector('.product-detail');
  if (!product) {
    if (detail) {
      document.querySelectorAll('[data-add-product]').forEach(button => { button.disabled = true; });
      let note = detail.querySelector('[data-product-unavailable]');
      if (!note) { note=document.createElement('p'); note.dataset.productUnavailable=''; note.className='checkout-login-note'; detail.querySelector('.product-info')?.prepend(note); }
      note.textContent='این محصول دیگر در کاتالوگ فروشگاه موجود نیست.';
    }
    return;
  }
  if (!detail) { renderProduct(); return; }
  detail.querySelector('[data-product-unavailable]')?.remove();
  detail.querySelector('.product-info__brand').textContent = getBrandName(product.brand);
  detail.querySelector('.product-info h1').textContent = product.name;
  detail.querySelector('.product-info__meta').innerHTML = `<span class="rating">${icon('star','rating__star')} ${fa(product.rating)} <span>(${fa(product.reviewsCount)} نظر)</span></span><span>کد محصول: ${fa(product.id+1000)}</span>`;
  detail.querySelector('.product-info__price').innerHTML = `<strong>${fa(product.price)} <small>تومان</small></strong>${product.oldPrice?`<del>${fa(product.oldPrice)}</del><span class="badge badge--discount">٪${fa(product.discountPercent)} تخفیف</span>`:''}`;
  const mobilePrice = document.querySelector('.mobile-add span');
  if (mobilePrice) mobilePrice.innerHTML = `<strong>${fa(product.price)}</strong> <small>تومان</small>`;
  patchArea(document.querySelector('[data-product-colors]'), () => product.colors.map(c=>`<button class="color-chip ${c.name===productSelection.color?'is-selected':''}" type="button" data-color="${e(c.name)}" data-product-color="${e(c.name)}" aria-label="رنگ ${e(c.name)}" aria-pressed="${c.name===productSelection.color}" ${product.sizes.some(size=>available(product,c.name,size))?'':'disabled'}></button>`).join(''));
  patchArea(document.querySelector('[data-product-sizes]'), () => productSizes(product));
  const variant=product.variants?.find(v=>v.color===productSelection.color && v.size===productSelection.size);
  if (variant?.stock > 0) productSelection.quantity=Math.min(productSelection.quantity,variant.stock);
  const quantity=document.querySelector('[data-product-quantity-value]'); if(quantity) quantity.textContent=fa(productSelection.quantity);
  document.querySelectorAll('[data-add-product]').forEach(button => { button.disabled = !available(product,productSelection.color,productSelection.size); });
  const index=Math.min(productSelection.gallery,Math.max(0,product.images.length-1));
  productSelection.gallery=index;
  patchArea(document.querySelector('[data-gallery-main]'), image(product.images[index],product.localImages?.[index],`${product.name}، تصویر ${fa(index+1)}`,'','loading="eager" fetchpriority="high"'));
  patchArea(document.querySelector('.gallery__thumbs'), () => product.images.map((url,i)=>`<button class="gallery__thumb ${i===productSelection.gallery?'is-selected':''}" type="button" data-gallery="${i}" aria-label="تصویر ${fa(i+1)} محصول" aria-pressed="${i===productSelection.gallery}">${image(url,product.localImages?.[i],`${product.name}، تصویر ${fa(i+1)}`)}</button>`).join(''));
  if (productSelection.tab !== 'reviews') patchArea(document.querySelector('[data-product-panel]'), productPanel(product));
  else if (store.getUser() && document.querySelector('.review-login')) patchArea(document.querySelector('[data-product-panel]'), productReviews());
  addJsonLd(product);
}
function refreshReviews() {
  const product=selectedProduct();
  if (!product || !isOnline()) return;
  getReviews(product.id).then(reviews => {
    if (String(selectedProduct()?.id) !== String(product.id)) return;
    productSelection.reviews=reviews;
    if (productSelection.tab==='reviews') {
      if (store.getUser() && document.querySelector('.review-login')) patchArea(document.querySelector('[data-product-panel]'), productReviews());
      else patchArea(document.querySelector('[data-review-list]'), reviewList());
    }
  }).catch(error => console.warn('Styleland reviews:',error.message));
}
function refreshCatalogViews(changed) {
  refreshLiveSearch();
  if (page==='home') refreshHome(changed);
  if (page==='products') refreshFilters();
  if (page==='product') { refreshProductDetails(); if (changed.includes('products')) refreshReviews(); }
  if (page==='cart') renderCartPreservingInput();
  if (page==='checkout') refreshCheckout();
  if (page==='wishlist') scheduleMainRefresh('wishlist',renderWishlist);
  if (page==='brands' && changed.includes('brands')) scheduleMainRefresh('brands',renderBrands);
  if (page==='blog' && changed.includes('posts')) {
    if (new URLSearchParams(location.search).has('slug')) scheduleMainRefresh('blog',renderBlog);
    else {
      const categories=['همه',...new Set(getCatalog().posts.map(p=>p.category))];
      patchArea(document.querySelector('.blog-filters .tabs'), categories.map(c=>`<button type="button" class="tab" role="tab" data-blog-category="${e(c)}" aria-selected="${blogCategory===c}">${e(c)}</button>`).join(''));
      renderBlogResults();
    }
  }
  updateHeaderState();
}
function updateAuthAvailability() {
  const status=document.querySelector('[data-auth-status]');
  const button=document.querySelector('[data-auth-form] button[type="submit"]');
  if (!status || !button) return;
  const phase=getBackendPhase();
  status.textContent=phase==='connecting'?'در حال برقراری اتصال به حساب کاربری هستیم؛ می‌توانید اطلاعاتتان را وارد کنید.':!isOnline()?'اتصال به حساب کاربری در حال حاضر برقرار نیست. سبد و علاقه‌مندی‌ها روی همین دستگاه می‌مانند.':'';
  status.hidden=!status.textContent;
  button.disabled=phase==='connecting'||!isOnline();
}

function watchBreadcrumbs() {
  let previous = '';
  const update = () => {
    const nav=main.querySelector('.breadcrumb');
    const signature=nav?.outerHTML || '';
    if(!nav || signature===previous)return;
    previous=signature;
    const pieces=[...nav.querySelectorAll('a,[aria-current="page"]')];
    const itemListElement=pieces.map((piece,index)=>({ '@type':'ListItem',position:index+1,name:piece.textContent.trim(),item:piece.href || location.href }));
    document.querySelector('[data-dynamic-jsonld="breadcrumbs"]')?.remove();
    const script=document.createElement('script');script.type='application/ld+json';script.dataset.dynamicJsonld='breadcrumbs';
    script.textContent=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement}).replace(/</g,'\\u003c');document.head.append(script);
  };
  new MutationObserver(update).observe(main,{childList:true,subtree:true});update();
}
async function start() {
  bindUI(); bindPageEvents(); watchBreadcrumbs();
  window.addEventListener('styleland:catalog', event => refreshCatalogViews(event.detail || []));
  document.addEventListener('focusout', () => setTimeout(flushBackgroundUpdates,0));
  window.addEventListener('styleland:overlayclosed', () => setTimeout(flushBackgroundUpdates,0));
  // Paint the local storefront immediately; network, account restoration and
  // server data continue in parallel instead of blocking the first screen.
  const backend = initBackend();
  renderHeader(); renderFooter();
  const pageRender = renderPage();
  initMotion();
  Promise.resolve(pageRender).then(() => observeMotion()).catch(error => console.error('Styleland page:',error));
  const online=await backend;
  if(online) {
    try {const session=await getSession();if(session?.user)await store.setUser(session.user);}
    catch {toast('دریافت اطلاعات حساب انجام نشد.','error');}
    getClient()?.auth.onAuthStateChange((event,session)=>{
      if(!['SIGNED_IN','SIGNED_OUT','INITIAL_SESSION'].includes(event))return;
      setTimeout(async()=>{
        const previous=store.getUser()?.id || null;
        await store.setUser(session?.user||null);
        updateHeaderState();
        const current=store.getUser()?.id || null;
        if(page==='account' && previous!==current && getBackendPhase()!=='connecting' && !document.querySelector('[data-auth-form] button:disabled')) await loadAccount();
        if(page==='checkout') refreshCheckout();
        if(page==='product' && previous!==current) { refreshProductDetails(); refreshReviews(); }
      },0);
    });
  } else toast('اتصال به فروشگاه برقرار نشد؛ داده‌های نمایشی محلی نمایش داده می‌شوند.');
  finishBackendInitialization();
  updateHeaderState();
  if(page==='account') { if(store.getUser()) await loadAccount(); else updateAuthAvailability(); }
  if(page==='checkout') refreshCheckout();
  if(page==='product') { refreshProductDetails(); refreshReviews(); }
}
start().catch(error=>{
  console.error('Styleland initialization:',error);
  finishBackendInitialization();
  if(main.querySelector('.skeleton')) main.innerHTML=`<div class="container">${emptyState('بارگذاری صفحه انجام نشد','لطفاً صفحه را دوباره باز کنید.','بازگشت به خانه','index.html','refresh')}</div>`;
  else toast('اتصال یا دریافت اطلاعات کامل نشد؛ لطفاً دوباره تلاش کنید.','error');
  if(page==='account') updateAuthAvailability();
  if(page==='checkout') refreshCheckout();
});
