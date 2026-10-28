import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CDN } from './config.js';
import * as fallback from './data.js';

let client = null;
let online = false;
// Distinguish an unfinished connection/session restore from a confirmed outage.
let backendPhase = 'connecting';
let catalog = { products: fallback.products, categories: fallback.categories, brands: fallback.brands, posts: fallback.posts };
let initPromise;

const timedFetch = (input, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  if (options.signal) options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  return fetch(input, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

function loadScript(src, timeout) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    let settled = false;
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) { script.remove(); reject(error); } else resolve();
    };
    const timer = setTimeout(() => finish(new Error('SCRIPT_TIMEOUT')), timeout);
    script.onload = () => window.supabase?.createClient ? finish() : finish(new Error('INVALID_LIBRARY'));
    script.onerror = () => finish(new Error('SCRIPT_UNAVAILABLE'));
    document.head.append(script);
  });
}
async function loadLibrary() {
  if (window.supabase?.createClient) return;
  // The pinned CDN remains the primary source. If it is blocked or slow,
  // load the identical local copy so account and ordering can still work.
  try { await loadScript(SUPABASE_CDN, 1500); }
  catch { await loadScript('assets/vendor/supabase-2.118.0.min.js', 3000); }
}

export async function initBackend() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await loadLibrary();
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { fetch: timedFetch },
        db: { retry: false },
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      // Non-critical collections do not hold up account and checkout readiness.
      // Each collection can fall back independently if only one request fails.
      const productsRequest = Promise.resolve(client.from('products').select('*, product_variants(id,color,color_hex,size,stock)').order('id'));
      Promise.allSettled([
        client.from('categories').select('*'),
        client.from('brands').select('*'),
        client.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false })
      ]).then(results => {
        const changed = [];
        const value = index => results[index].status === 'fulfilled' && !results[index].value.error ? results[index].value.data : null;
        const categories = value(0), brands = value(1), posts = value(2);
        if (categories) {
          catalog.categories = categories.map(c => ({ ...c, localImage: c.local_image }));
          catalog.categories.sort((a, b) => fallback.categories.findIndex(x => x.slug === a.slug) - fallback.categories.findIndex(x => x.slug === b.slug));
          changed.push('categories');
        }
        if (brands) { catalog.brands = brands; changed.push('brands'); }
        if (posts) {
          catalog.posts = posts.map(p => ({ ...p, localImage: p.local_image, readTime: p.read_time, publishedAt: p.published_at }));
          changed.push('posts');
        }
        if (changed.length) window.dispatchEvent(new CustomEvent('styleland:catalog', { detail: changed }));
      }).catch(error => console.warn('Styleland: optional catalog data', error.message));
      const result = await productsRequest;
      if (result.error) throw result.error;
      if (!result.data?.length) throw new Error('EMPTY_CATALOG');
      // نگاشت نام فیلدهای Postgres به قرارداد یکسان در همهٔ نماها.
      catalog.products = result.data.map(p => ({
        ...p, oldPrice: p.old_price, discountPercent: p.discount_percent, localImages: p.local_images,
        reviewsCount: p.reviews_count, createdAt: p.created_at,
        variants: (p.product_variants || []).map(v => ({ ...v, colorHex: v.color_hex }))
      }));
      online = true;
      window.dispatchEvent(new CustomEvent('styleland:catalog', { detail: ['products'] }));
      return true;
    } catch (error) {
      console.warn('Styleland: using local catalog', error.message);
      online = false;
      return false;
    }
  })();
  return initPromise;
}

export const getClient = () => client;
export const isOnline = () => online;
export const getBackendPhase = () => backendPhase;
// The app calls this after restoring the session and merging the cart as well.
export function finishBackendInitialization() { backendPhase = online ? 'online' : 'offline'; }
export const getCatalog = () => catalog;
export const getProduct = id => catalog.products.find(p => String(p.id) === String(id));
export const getBrandName = slug => catalog.brands.find(b => b.slug === slug)?.name || slug;
export const getCategoryName = slug => catalog.categories.find(c => c.slug === slug)?.name || slug;

export async function getSession() {
  if (!client || !online) return null;
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}
export async function signIn(email, password) {
  if (!client || !online) throw new Error('OFFLINE');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signUp(email, password, fullName) {
  if (!client || !online) throw new Error('OFFLINE');
  const { data, error } = await client.auth.signUp({
    email, password, options: { data: { full_name: fullName }, emailRedirectTo: new URL('account.html', window.location.href).href }
  });
  if (error) throw error;
  return data;
}
export async function signOut() {
  if (client && online) {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }
}
export async function getReviews(productId) {
  if (client && online) {
    const { data, error } = await client.from('reviews').select('id,display_name,rating,comment,created_at').eq('product_id', productId).order('created_at', { ascending: false });
    if (!error) return data;
  }
  return [
    { display_name: 'سارا', rating: 5, comment: 'کیفیت و جزئیاتش خیلی خوب بود، ممنون از استایلند.' },
    { display_name: 'علی', rating: 5, comment: 'دقیقاً مطابق توضیحات بود و با خیال راحت انتخاب کردم.' },
    { display_name: 'مریم', rating: 4, comment: 'خوش‌دوخت و کاربردی؛ از انتخابم راضی‌ام.' }
  ];
}
export async function addReview(productId, user, displayName, rating, comment) {
  if (!client || !online) throw new Error('OFFLINE');
  const { error } = await client.from('reviews').insert({ product_id: productId, user_id: user.id, display_name: displayName, rating, comment });
  if (error) throw error;
}
export async function checkCoupon(code) {
  const normalized = code.trim().toUpperCase();
  if (backendPhase === 'connecting') await initBackend();
  if (!client || !online) return normalized === 'STYLE10' ? { code: normalized, discount_percent: 10, offline: true } : null;
  const { data, error } = await client.from('coupons').select('code,discount_percent').eq('code', normalized).maybeSingle();
  if (error) throw error;
  return data;
}
export async function subscribe(email) {
  if (backendPhase === 'connecting') await initBackend();
  if (!client || !online) throw new Error('OFFLINE');
  const { error } = await client.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
  if (error) throw error;
}
export async function placeOrder(items, customer, shippingMethod, paymentMethod, coupon) {
  if (!client || !online) throw new Error('OFFLINE');
  const { data, error } = await client.rpc('place_order', {
    p_items: items.map(({ productId, color, size, quantity }) => ({ productId, color, size, quantity })),
    p_customer: customer, p_shipping_method: shippingMethod, p_payment_method: paymentMethod, p_coupon: coupon || null
  });
  if (error) throw error;
  return data;
}
export async function getOrders() {
  if (!client || !online) return [];
  const { data, error } = await client.from('orders').select('id,tracking_code,total,status,payment_status,created_at,order_items(product_name,quantity)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getProfile(user) {
  if (!client || !online || !user) return null;
  const { data, error } = await client.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data;
}
export async function updateProfile(user, values) {
  if (!client || !online) throw new Error('OFFLINE');
  const { error } = await client.from('profiles').update({ ...values, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  if (error) throw error;
}
