import { getClient, getProduct, isOnline } from './supabase.js';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COSTS } from './config.js';

const PREFIX = 'styleland:v1:';
const empty = () => ({ cart: [], wishlist: [], coupon: null });
const read = key => { try { return { ...empty(), ...JSON.parse(localStorage.getItem(PREFIX + key) || '{}') }; } catch { return empty(); } };
const save = (key, data) => { try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch { window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'فضای ذخیره‌سازی مرورگر در دسترس نیست.' })); } };
const itemKey = item => `${item.productId}|${item.color}|${item.size}`;
let user = null;
let state = read('guest');
let queue = Promise.resolve();
let generation = 0;
let pendingLogin = null;
const key = () => user ? `user:${user.id}` : 'guest';

function changed() {
  save(key(), state);
  window.dispatchEvent(new CustomEvent('styleland:store'));
}
function sync(task) {
  const owner = user;
  const atGeneration = generation;
  if (!owner || !getClient() || !isOnline()) return;
  queue = queue.then(async () => {
    if (atGeneration !== generation || user?.id !== owner.id) return;
    const result = await task(getClient(), owner);
    if (result?.error) throw result.error;
  }).catch(error => {
    console.warn('Styleland sync:', error.message);
    window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'همگام‌سازی انجام نشد؛ تغییرات در همین دستگاه نگه داشته شد.' }));
  });
}
const cartRow = (item, owner) => ({ user_id: owner.id, product_id: item.productId, color: item.color, size: item.size, quantity: item.quantity });
function syncCartItem(item) {
  sync((db, owner) => db.from('cart_items').upsert(cartRow(item, owner), { onConflict: 'user_id,product_id,color,size' }));
}
function deleteCartItem(item) {
  sync((db, owner) => db.from('cart_items').delete().eq('user_id', owner.id).eq('product_id', item.productId).eq('color', item.color).eq('size', item.size));
}

export function getState() { return state; }
export function getUser() { return user; }
export function isWishlisted(id) { return state.wishlist.some(value => String(value) === String(id)); }
export function cartCount() { return state.cart.reduce((sum, item) => sum + item.quantity, 0); }
export function cartDetails() { return state.cart.map(item => ({ ...item, product: getProduct(item.productId) })).filter(item => item.product); }
export function totals(shippingMethod = 'post') {
  const subtotal = cartDetails().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.floor(subtotal * (state.coupon?.discount_percent || 0) / 100);
  const shipping = subtotal ? (SHIPPING_COSTS[shippingMethod] ?? SHIPPING_COSTS.post) : 0;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping, eligibleFree: subtotal >= FREE_SHIPPING_THRESHOLD };
}
export function addToCart(productId, color, size, quantity = 1) {
  const product = getProduct(productId);
  if (!product || !product.colors.some(c => c.name === color) || !product.sizes.includes(size)) return false;
  const variant = product.variants?.find(v => v.color === color && v.size === size);
  if (product.variants?.length && (!variant || variant.stock < 1)) return false;
  const existing = state.cart.find(item => itemKey(item) === itemKey({ productId, color, size }));
  if (existing) existing.quantity = Math.min(10, variant?.stock ?? 10, existing.quantity + quantity);
  else state.cart.push({ productId: Number(productId), color, size, quantity: Math.min(10, variant?.stock ?? 10, Math.max(1, quantity)) });
  const item = existing || state.cart[state.cart.length - 1];
  changed(); syncCartItem({ ...item });
  return true;
}
export function setQuantity(productId, color, size, quantity) {
  const item = state.cart.find(value => itemKey(value) === itemKey({ productId, color, size }));
  if (!item) return;
  if (quantity <= 0) return removeFromCart(productId, color, size);
  const product = getProduct(productId);
  const variant = product?.variants?.find(v => v.color === color && v.size === size);
  if (variant && variant.stock < 1) { window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'موجودی این سایز تمام شده است.' })); return; }
  item.quantity = Math.min(10, variant?.stock ?? 10, Math.max(1, quantity));
  changed(); syncCartItem({ ...item });
}
export function removeFromCart(productId, color, size) {
  const item = state.cart.find(value => itemKey(value) === itemKey({ productId, color, size }));
  if (!item) return;
  state.cart = state.cart.filter(value => value !== item);
  changed(); deleteCartItem(item);
}
export function toggleWishlist(id) {
  id = Number(id);
  const exists = isWishlisted(id);
  state.wishlist = exists ? state.wishlist.filter(value => value !== id) : [...state.wishlist, id];
  changed();
  if (exists) sync((db, owner) => db.from('wishlists').delete().eq('user_id', owner.id).eq('product_id', id));
  else sync((db, owner) => db.from('wishlists').upsert({ user_id: owner.id, product_id: id }, { onConflict: 'user_id,product_id' }));
  return !exists;
}
export function setCoupon(coupon) { state.coupon = coupon; changed(); }
export function clearCart() {
  const old = [...state.cart];
  state.cart = []; state.coupon = null; changed();
  old.forEach(deleteCartItem);
}

// Merge guest data once after login. Keep the guest state active while remote
// data is loading so interactions during a slow session restore are not lost.
export function setUser(nextUser) {
  if (!nextUser) {
    if (pendingLogin) { generation += 1; pendingLogin = null; }
    if (!user) return Promise.resolve();
    generation += 1;
    user = null;
    state = read('guest');
    changed();
    return Promise.resolve();
  }
  if (pendingLogin?.id === nextUser.id) return pendingLogin.promise;
  if (nextUser.id === user?.id) return Promise.resolve();

  const atGeneration = ++generation;
  const mergeGuest = !user;
  const ownerKey = `user:${nextUser.id}`;
  const mergeLocal = (base, guest) => {
    const previous = base.pendingGuest || empty();
    for (const item of guest.cart) {
      const already = previous.cart?.find(value => itemKey(value) === itemKey(item))?.quantity || 0;
      const delta = Math.max(0, item.quantity - already);
      const match = base.cart.find(value => itemKey(value) === itemKey(item));
      if (match) match.quantity = Math.min(10, match.quantity + delta);
      else if (delta) base.cart.push({ ...item, quantity: delta });
    }
    base.wishlist = [...new Set([...base.wishlist, ...guest.wishlist].map(Number))];
    if (!base.coupon && guest.coupon) base.coupon = guest.coupon;
    base.pendingGuest = { cart: guest.cart.map(item => ({ ...item })), wishlist: [...guest.wishlist] };
    return base;
  };

  const promise = (async () => {
    try {
      if (!getClient() || !isOnline()) throw new Error('OFFLINE');
      const [cartResult, wishResult] = await Promise.all([
        getClient().from('cart_items').select('product_id,color,size,quantity').eq('user_id', nextUser.id),
        getClient().from('wishlists').select('product_id').eq('user_id', nextUser.id)
      ]);
      if (cartResult.error || wishResult.error) throw cartResult.error || wishResult.error;
      if (atGeneration !== generation) return;

      const cached = read(ownerKey);
      const guest = mergeGuest ? read('guest') : empty();
      const remote = (cartResult.data || []).map(row => ({ productId: row.product_id, color: row.color, size: row.size, quantity: row.quantity }));
      // Cached and server copies describe the same account cart, not two carts.
      for (const item of cached.cart) {
        const match = remote.find(value => itemKey(value) === itemKey(item));
        if (match) match.quantity = Math.max(match.quantity, item.quantity);
        else remote.push({ ...item });
      }
      cached.cart = remote;
      cached.wishlist = [...new Set([...(wishResult.data || []).map(row => Number(row.product_id)), ...cached.wishlist].map(Number))];
      state = mergeLocal(cached, guest);
      state.cart = state.cart.filter(item => getProduct(item.productId));
      state.wishlist = state.wishlist.filter(id => getProduct(id));
      user = nextUser;

      // Queue the initial merge before later user edits, so an older bulk write
      // cannot overwrite a more recent quantity or removal.
      const cartSnapshot = state.cart.map(item => ({ ...item }));
      const wishSnapshot = [...state.wishlist];
      const bulk = queue.then(async () => {
        if (atGeneration !== generation || user?.id !== nextUser.id) return false;
        const writes = [];
        if (cartSnapshot.length) writes.push(getClient().from('cart_items').upsert(cartSnapshot.map(item => cartRow(item, nextUser)), { onConflict: 'user_id,product_id,color,size' }));
        if (wishSnapshot.length) writes.push(getClient().from('wishlists').upsert(wishSnapshot.map(product_id => ({ user_id: nextUser.id, product_id })), { onConflict: 'user_id,product_id' }));
        const results = await Promise.all(writes);
        if (results.some(result => result.error)) throw results.find(result => result.error).error;
        return true;
      });
      queue = bulk.catch(error => {
        if (atGeneration === generation) {
          console.warn('Styleland merge:', error.message);
          window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'همگام‌سازی حساب کامل نشد؛ داده‌های مهمان روی دستگاه باقی ماند.' }));
        }
        return false;
      });
      changed();
      const saved = await bulk.catch(() => false);
      if (saved && atGeneration === generation) {
        if (mergeGuest) save('guest', empty());
        delete state.pendingGuest;
        changed();
      }
    } catch (error) {
      if (atGeneration !== generation) return;
      const guest = mergeGuest ? read('guest') : empty();
      state = mergeLocal(read(ownerKey), guest);
      user = nextUser;
      changed();
      // Keep the guest snapshot and pendingGuest for a safe retry on next load.
      console.warn('Styleland merge:', error.message);
      window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'همگام‌سازی حساب کامل نشد؛ داده‌های مهمان روی دستگاه باقی ماند.' }));
    }
  })();
  pendingLogin = { id: nextUser.id, promise };
  promise.finally(() => { if (pendingLogin?.promise === promise) pendingLogin = null; });
  return promise;
}
