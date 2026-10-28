const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright-core');
const {pathToFileURL} = require('node:url');
const base=process.env.BASE_URL || 'http://127.0.0.1:8000/';
const root=path.resolve(__dirname,'..');
const cdnFile=path.join(path.dirname(require.resolve('@supabase/supabase-js/package.json')),'dist/umd/supabase.js');
const gate=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const within=(promise,label,ms=8000)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} timed out`)),ms);})]).finally(()=>clearTimeout(timer));};
const json=(route,data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data),headers:{'access-control-allow-origin':'*'}});
const uid='11663939-6688-4ae2-bcc7-49174ccaa001';
const user={id:uid,aud:'authenticated',role:'authenticated',email:'test@example.com',user_metadata:{full_name:'کاربر آزمایشی'},app_metadata:{provider:'email'}};
const enc=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const session={access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:uid,exp:Math.floor(Date.now()/1000)+3600})}.sig`,refresh_token:'refresh-for-test',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};

(async()=>{
 const data=await import(pathToFileURL(path.join(root,'js/data.js')).href);
 const products=data.products.map(p=>({...p,price:p.id===1?999000:p.price,old_price:p.oldPrice,discount_percent:p.discountPercent,local_images:p.localImages,reviews_count:p.reviewsCount,created_at:p.createdAt,product_variants:p.colors.flatMap((c,ci)=>p.sizes.map((size,si)=>({id:p.id*100+ci*10+si,color:c.name,color_hex:c.hex,size,stock:12})))}));
 const categories=data.categories.map(c=>({...c,local_image:c.localImage}));
 const posts=data.posts.map(p=>({...p,local_image:p.localImage,read_time:p.readTime,published_at:p.publishedAt}));
 const browser=await chromium.launch({args:['--no-sandbox'],executablePath:process.env.CHROME_BIN || undefined,headless:true});
 async function setup({withSession=false,remoteCart=[],remoteWish=[],blockCart=false,blockBulk=false,blockCDN=false,productsOverride=null,viewport={width:1440,height:900}}={}){
  const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const productGate=gate(),cartGate=gate(),bulkGate=gate(),cartStarted=gate(),bulkStarted=gate(),syncDone=gate(),cdnGate=gate();
  let cart=remoteCart.map(x=>({...x})),wishlist=[...remoteWish],bulkCalls=0;
  let profile={full_name:'کاربر آزمایشی',phone:'',addresses:[]};
  let reviews=[{display_name:'تست',rating:5,comment:'نظر آزمایشی'}], subscribers=[];
  if(withSession)await page.addInitScript(s=>localStorage.setItem('sb-tpueescgcimeesxrmpgj-auth-token',JSON.stringify(s)),session);
  await page.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url()),method=request.method();
   if(request.url().startsWith(base))return route.continue();
   if(url.hostname==='cdn.jsdelivr.net'){if(blockCDN==='stall'){await cdnGate.promise;return route.abort().catch(()=>{});}return blockCDN ? route.abort() : route.fulfill({path:cdnFile,contentType:'application/javascript'});}
   if(url.hostname!=='tpueescgcimeesxrmpgj.supabase.co')return route.abort();
   if(method==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
   const endpoint=url.pathname.split('/').pop();
   if(endpoint==='products'){await productGate.promise;return json(route,productsOverride || products);}
   if(endpoint==='categories')return json(route,categories);
   if(endpoint==='brands')return json(route,data.brands);
   if(endpoint==='blog_posts')return json(route,posts);
   if(endpoint==='reviews'&&method==='POST'){reviews.unshift(JSON.parse(request.postData()));return json(route,[],201);}
   if(endpoint==='reviews')return json(route,reviews);
   if(endpoint==='cart_items'&&method==='GET'){cartStarted.resolve();if(blockCart)await cartGate.promise;return json(route,cart);}
   if(endpoint==='wishlists'&&method==='GET'){if(blockCart)await cartGate.promise;return json(route,wishlist.map(product_id=>({product_id})));}
   if(endpoint==='cart_items'&&method==='POST'){
     bulkCalls++; if(blockBulk&&bulkCalls===1){bulkStarted.resolve();await bulkGate.promise;}
     const body=JSON.parse(request.postData());for(const item of Array.isArray(body)?body:[body]){const idx=cart.findIndex(x=>x.product_id===item.product_id&&x.color===item.color&&x.size===item.size);if(idx>=0)cart[idx]={...item};else cart.push({...item});if(item.quantity===6)syncDone.resolve();}return json(route,[],201);
   }
   if(endpoint==='wishlists'&&method==='POST'){const body=JSON.parse(request.postData());for(const item of Array.isArray(body)?body:[body])if(!wishlist.includes(item.product_id))wishlist.push(item.product_id);return json(route,[],201);}
   if(endpoint==='cart_items'&&method==='DELETE'){cart=cart.filter(item=>!(url.searchParams.get('product_id')===`eq.${item.product_id}`&&url.searchParams.get('color')===`eq.${item.color}`&&url.searchParams.get('size')===`eq.${item.size}`));return json(route,[]);}
   if(endpoint==='wishlists'&&method==='DELETE'){const id=Number(url.searchParams.get('product_id')?.replace('eq.',''));wishlist=wishlist.filter(x=>x!==id);return json(route,[]);}
   if(endpoint==='coupons')return json(route,{code:'STYLE10',discount_percent:10});
   if(endpoint==='place_order')return json(route,{trackingCode:'TEST-MOCK-123'});
   if(endpoint==='profiles'&&method==='PATCH'){profile={...profile,...JSON.parse(request.postData())};return json(route,[]);}
   if(endpoint==='profiles')return json(route,profile);
   if(endpoint==='newsletter_subscribers'&&method==='POST'){subscribers.push(JSON.parse(request.postData()).email);return json(route,[],201);}
   if(url.pathname==='/auth/v1/token')return json(route,session);
   if(url.pathname==='/auth/v1/signup')return json(route,user);
   if(url.pathname==='/auth/v1/logout')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
   if(endpoint==='orders')return json(route,[]);
   if(url.pathname==='/auth/v1/user')return json(route,user);
   console.log('UNHANDLED',method,url.href);return json(route,[]);
  });
  return {page,context,errors,productGate,cartGate,bulkGate,cartStarted,bulkStarted,syncDone,cdnGate,getCart:()=>cart,getWishlist:()=>wishlist,getSubscribers:()=>subscribers,getProfile:()=>profile};
 }
 // First paint is independent of an indefinitely slow CDN; font/logo are local.
 {
  const context=await browser.newContext({viewport:{width:1440,height:900}}), page=await context.newPage(), slow=gate(), external=[];
  await page.route('**/*',async route=>{const url=route.request().url();if(url.startsWith(base))return route.continue();external.push(url);if(url.includes('cdn.jsdelivr.net')){await slow.promise;return route.abort().catch(()=>{});}return route.abort();});
  const started=Date.now();await page.goto(base+'index.html',{waitUntil:'commit'});await page.waitForSelector('.hero',{timeout:2000});
  const ms=Date.now()-started;assert.ok(ms<2000,`first screen took ${ms}ms with a stalled CDN`);
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.fonts.check('400 16px Style')),true);
  assert.match(await page.locator('.hero__slide.is-active img').getAttribute('src'),/\.webp$/);assert.equal(await page.locator('.style-story').count(),3);
  assert.ok(await page.locator('.logo__mark img').first().evaluate(img=>img.complete&&img.naturalWidth>0));assert.equal(await page.locator('.license-placeholder').count(),2);
  await page.locator('[data-license-info="اینماد"]').click();assert.match(await page.locator('[role=dialog]').innerText(),/نمایشی/);await page.locator('[role=dialog] [data-close-overlay]').first().click();
  assert.ok(!external.some(url=>url.includes('fonts.googleapis.com')));slow.resolve();await context.close();console.log(`fast first screen, local font/logo and license placeholders: ${ms}ms`);
 }
 // A blocked CDN should fall back to the pinned local SDK, not disable login.
 {
  const t=await setup({blockCDN:true});t.productGate.resolve();await t.page.goto(base+'account.html',{waitUntil:'domcontentloaded'});
  await t.page.waitForFunction(()=>!document.querySelector('[data-auth-form] [type=submit]').disabled);
  assert.ok(await t.page.locator('script[src*="vendor/supabase"]').count());assert.deepEqual(t.errors,[]);await t.context.close();console.log('local SDK fallback: passed');
 }
 // A stalled CDN times out and the local SDK still connects to the API.
 {
  const t=await setup({blockCDN:'stall'});t.productGate.resolve();await t.page.goto(base+'account.html',{waitUntil:'domcontentloaded'});
  await t.page.waitForFunction(()=>!document.querySelector('[data-auth-form] [type=submit]').disabled,null,{timeout:6000});
  assert.ok(await t.page.locator('script[src*="vendor/supabase"]').count());t.cdnGate.resolve();assert.deepEqual(t.errors,[]);await t.context.close();console.log('slow CDN timeout and local SDK fallback: passed');
 }
 // Reduced-motion users get a stationary slideshow and keyboard-reachable photo stories.
 {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});await page.waitForSelector('.hero');
  await page.waitForTimeout(5200);assert.equal(await page.locator('.hero__slide.is-active').getAttribute('data-slide'),'0');assert.equal(await page.locator('[data-slider-toggle]').isHidden(),true);
  await page.locator('[data-slide-to="1"]').click();assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-hidden'),'true');assert.equal(await page.locator('[data-slide="1"]').getAttribute('aria-hidden'),'false');
  const boxes=await page.locator('.style-edit__grid').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));assert.ok(boxes.scroll>boxes.width);await page.locator('.style-story--details').focus();assert.equal(await page.locator('.style-story--details').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await context.close();console.log('reduced motion, slider accessibility and mobile stories: passed');
 }
 // Input typed during delayed startup stays intact; account is not falsely called offline.
 {
  const t=await setup();await t.page.goto(base+'account.html',{waitUntil:'domcontentloaded'});await t.page.locator('[name=email]').fill('waiting@example.com');await t.page.locator('[name=password]').fill('password123');
  assert.match(await t.page.locator('[data-auth-status]').innerText(),/در حال برقراری/);assert.equal(await t.page.locator('[data-auth-form] [type=submit]').isDisabled(),true);
  t.productGate.resolve();await t.page.waitForFunction(()=>!document.querySelector('[data-auth-form] [type=submit]').disabled);
  assert.equal(await t.page.locator('[name=email]').inputValue(),'waiting@example.com');assert.equal(await t.page.locator('[name=password]').inputValue(),'password123');assert.deepEqual(t.errors,[]);await t.context.close();console.log('account during delayed connection: passed');
 }
 // Product selections, tab, and quantity survive server updates; live price is refreshed.
 {
  const t=await setup();await t.page.goto(base+'product.html?id=1',{waitUntil:'domcontentloaded'});await t.page.locator('[data-product-color="مشکی"]').click();await t.page.locator('[data-product-size="M"]').click();await t.page.locator('[data-product-quantity="plus"]').click();await t.page.locator('[data-product-tab="specs"]').click();
  t.productGate.resolve();await t.page.waitForFunction(()=>document.querySelector('.product-info__price')?.textContent.includes('۹۹۹٬۰۰۰'));
  assert.equal(await t.page.locator('[data-product-color-label]').innerText(),'مشکی');assert.equal(await t.page.locator('[data-product-size-label]').innerText(),'M');assert.equal(await t.page.locator('[data-product-quantity-value]').innerText(),'۲');assert.equal(await t.page.locator('[data-product-tab="specs"]').getAttribute('aria-selected'),'true');assert.deepEqual(t.errors,[]);await t.context.close();console.log('product selection and live price: passed');
 }
 // A server-side stock change can disable the old choice but selecting an available size re-enables purchase.
 {
  const custom=structuredClone(products);
  custom[0].product_variants.find(v=>v.color==='کرم'&&v.size==='S').stock=0;
  const t=await setup({productsOverride:custom});await t.page.goto(base+'product.html?id=1',{waitUntil:'domcontentloaded'});
  t.productGate.resolve();await t.page.waitForFunction(()=>document.querySelector('.add-main')?.disabled);
  await t.page.locator('[data-product-size="M"]').click();assert.equal(await t.page.locator('.add-main').isEnabled(),true);
  await t.page.locator('.add-main').click();assert.equal(await t.page.locator('[data-cart-count]').first().innerText(),'۱');assert.deepEqual(t.errors,[]);await t.context.close();console.log('stock changes and selecting an available size: passed');
 }
 // Background catalog updates preserve active filters, brand search and coupon input.
 {
  const t=await setup();await t.page.goto(base+'products.html',{waitUntil:'domcontentloaded'});await t.page.locator('aside [data-filter-toggle="size"][data-value="M"]').click();
  await t.page.locator('aside [data-brand-search]').fill('NI');t.productGate.resolve();
  await t.page.waitForFunction(async()=> (await import('./js/supabase.js')).getBackendPhase()==='online');
  assert.equal(await t.page.locator('aside [data-brand-search]').inputValue(),'NI');assert.match(t.page.url(),/size=M/);
  await t.page.locator('aside [data-brand-search]').blur();await t.page.waitForFunction(()=>document.querySelector('[data-product-card="1"]')?.textContent.includes('۹۹۹٬۰۰۰'));assert.deepEqual(t.errors,[]);await t.context.close();console.log('filter and focused brand search survive refresh: passed');
 }
 {
  const t=await setup();await t.page.addInitScript(()=>localStorage.setItem('styleland:v1:guest',JSON.stringify({cart:[{productId:1,color:'کرم',size:'M',quantity:1}],wishlist:[],coupon:null})));
  await t.page.goto(base+'cart.html',{waitUntil:'domcontentloaded'});await t.page.locator('#coupon-code').fill('MY-PARTIAL-CODE');t.productGate.resolve();
  await t.page.waitForFunction(async()=> (await import('./js/supabase.js')).getBackendPhase()==='online');
  assert.equal(await t.page.locator('#coupon-code').inputValue(),'MY-PARTIAL-CODE');assert.equal(await t.page.evaluate(()=>document.activeElement.id),'coupon-code');assert.deepEqual(t.errors,[]);await t.context.close();console.log('cart coupon input survives refresh: passed');
 }
 // Newsletters, account forms, profile/address editing, reviews and sign-out.
 {
  const t=await setup();t.productGate.resolve();await t.page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
  await t.page.locator('#newsletter-email').fill('reader@example.com');await t.page.locator('[data-newsletter] button').click();await t.page.waitForFunction(()=>document.getElementById('toast-region').textContent.includes('عضویت شما'));
  assert.deepEqual(t.getSubscribers(),['reader@example.com']);assert.equal(await t.page.locator('#newsletter-email').inputValue(),'');
  await t.page.goto(base+'account.html',{waitUntil:'domcontentloaded'});await t.page.waitForFunction(()=>!document.querySelector('[data-auth-form] [type=submit]').disabled);
  await t.page.locator('[data-auth-tab="signup"]').click();await t.page.locator('[name=fullName]').fill('کاربر آزمایشی');await t.page.locator('[name=email]').fill('new@example.com');await t.page.locator('[name=password]').fill('password123');await t.page.locator('[data-auth-form] [type=submit]').click();await t.page.waitForFunction(()=>document.querySelector('[data-auth-error]').textContent.includes('ایمیل تأیید'));
  await t.page.locator('[data-auth-tab="login"]').click();await t.page.locator('[name=email]').fill('test@example.com');await t.page.locator('[name=password]').fill('password123');await t.page.locator('[data-auth-form] [type=submit]').click();await t.page.waitForSelector('.account-menu');
  await t.page.locator('[data-account-tab="profile"]').click();await t.page.locator('[data-profile-form] [name=fullName]').fill('نام تازه');await t.page.locator('[data-profile-form] [name=phone]').fill('09123456789');await t.page.locator('[data-profile-form] button').click();await t.page.waitForFunction(()=>document.getElementById('toast-region').textContent.includes('اطلاعات حساب ذخیره شد'));
  assert.equal(t.getProfile().full_name,'نام تازه');assert.equal(t.getProfile().phone,'09123456789');
  await t.page.locator('[data-account-tab="addresses"]').click();await t.page.locator('[data-address-form] textarea').fill('تهران، خیابان آزمایشی پلاک دوازده');await t.page.locator('[data-address-form] button').click();await t.page.waitForSelector('[data-delete-address]');assert.equal(t.getProfile().addresses.length,1);
  await t.page.locator('[data-delete-address]').click();await t.page.waitForFunction(()=>document.getElementById('toast-region').textContent.includes('آدرس حذف شد'));assert.equal(t.getProfile().addresses.length,0);
  await t.page.goto(base+'product.html?id=1',{waitUntil:'domcontentloaded'});await t.page.locator('[data-product-tab="reviews"]').click();await t.page.waitForSelector('[data-review-form]');
  await t.page.locator('[data-review-form] textarea').fill('کیفیت خوبی داشت و خوش‌دوخت بود');await t.page.evaluate(()=>window.dispatchEvent(new CustomEvent('styleland:catalog',{detail:['products']})));
  assert.equal(await t.page.locator('[data-review-form] textarea').inputValue(),'کیفیت خوبی داشت و خوش‌دوخت بود');await t.page.locator('[data-review-form] button').click();await t.page.waitForFunction(()=>document.getElementById('toast-region').textContent.includes('نظر شما ثبت شد'));
  assert.match(await t.page.locator('[data-review-list]').innerText(),/کیفیت خوبی داشت/);
  await t.page.goto(base+'account.html',{waitUntil:'domcontentloaded'});await t.page.waitForSelector('[data-signout]');await t.page.locator('[data-signout]').click();await t.page.waitForSelector('[data-auth-form]');assert.deepEqual(t.errors,[]);await t.context.close();console.log('newsletter, signup, login, account, review and logout: passed');
 }
 // A pending connection must not offer the offline order path; preserve all form state.
 {
  const t=await setup();await t.page.addInitScript(()=>localStorage.setItem('styleland:v1:guest',JSON.stringify({cart:[{productId:1,color:'کرم',size:'M',quantity:1}],wishlist:[],coupon:null})));
  await t.page.goto(base+'checkout.html',{waitUntil:'domcontentloaded'});await t.page.locator('#checkout-fullName').fill('کاربر آزمایشی');await t.page.locator('#checkout-phone').fill('09123456789');await t.page.locator('#checkout-province').selectOption('تهران');await t.page.locator('#checkout-city').fill('تهران');await t.page.locator('#checkout-address').fill('خیابان آزمایشی پلاک دوازده');await t.page.locator('#checkout-postalCode').fill('1234567890');await t.page.locator('[data-checkout-form="1"] [type=submit]').click();await t.page.locator('[data-checkout-form="2"] [type=submit]').click();await t.page.locator('[name=payment][value=cod]').check();await t.page.locator('[name=terms]').check();
  assert.equal(await t.page.locator('[data-order-submit]').isDisabled(),true);assert.match(await t.page.locator('[data-checkout-connection]').innerText(),/در حال بررسی/);
  t.productGate.resolve();await t.page.waitForFunction(()=>!document.querySelector('[data-order-submit]').disabled);assert.equal(await t.page.locator('[name=payment][value=cod]').isChecked(),true);assert.equal(await t.page.locator('[name=terms]').isChecked(),true);assert.match(await t.page.locator('[data-order-submit]').innerText(),/ورود و ثبت سفارش/);assert.match(await t.page.locator('.review-order').innerText(),/کاربر آزمایشی/);assert.deepEqual(t.errors,[]);await t.context.close();console.log('checkout connection gating and draft: passed');
 }
 // A user can add products while session/cart restoration and bulk sync are slow.
 {
  const t=await setup({withSession:true,blockCart:true,blockBulk:true,remoteCart:[{product_id:1,color:'کرم',size:'M',quantity:3}],remoteWish:[2]});
  await t.page.goto(base+'product.html?id=1',{waitUntil:'domcontentloaded'});await t.page.locator('[data-product-size="M"]').click();await t.page.locator('.add-main').click();
  t.productGate.resolve();await within(t.cartStarted.promise,'cart load');
  await t.page.locator('.add-main').click();await t.page.locator('.product-info [data-wishlist]').click();t.cartGate.resolve();await within(t.bulkStarted.promise,'bulk merge');
  await t.page.locator('.add-main').click();t.bulkGate.resolve();
  await t.page.waitForFunction(id=>{const s=JSON.parse(localStorage.getItem('styleland:v1:user:'+id)||'{}');return s.cart?.[0]?.quantity===6 && s.wishlist?.includes(1)&&s.wishlist?.includes(2);},uid,{timeout:12000});
  await t.page.waitForFunction(()=>!document.querySelector('[data-cart-count]').hidden&&document.querySelector('[data-cart-count]').textContent==='۶');
  await within(t.syncDone.promise,'queued sync');assert.equal(t.getCart().find(x=>x.product_id===1)?.quantity,6);assert.ok(t.getWishlist().includes(1)&&t.getWishlist().includes(2));assert.deepEqual(t.errors,[]);
  await t.page.goto(base+'checkout.html',{waitUntil:'domcontentloaded'});await t.page.locator('#checkout-fullName').fill('کاربر آزمایشی');await t.page.locator('#checkout-phone').fill('09123456789');await t.page.locator('#checkout-province').selectOption('تهران');await t.page.locator('#checkout-city').fill('تهران');await t.page.locator('#checkout-address').fill('خیابان آزمایشی پلاک دوازده');await t.page.locator('#checkout-postalCode').fill('1234567890');await t.page.locator('[data-checkout-form="1"] [type=submit]').click();await t.page.locator('[data-checkout-form="2"] [type=submit]').click();await t.page.locator('[name=terms]').check();await t.page.waitForFunction(()=>!document.querySelector('[data-order-submit]').disabled);await t.page.locator('[data-order-submit]').click();await t.page.waitForSelector('.checkout-success');assert.match(await t.page.locator('.checkout-success').innerText(),/TEST-MOCK-123/);assert.deepEqual(t.errors,[]);await t.context.close();console.log('slow session merge, queued edits, and online checkout: passed');
 }
 await browser.close();console.log('Fast-start regression suite passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
