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

// Merge guest data once after login. User-specific cache is never shared on sign-out.
export async function setUser(nextUser) {
  if (nextUser?.id === user?.id) return;
  const previousUser = user;
  const guest = previousUser ? empty() : read('guest');
  generation += 1;
  user = nextUser || null;
  state = read(key());
  changed();
  if (!user || !getClient() || !isOnline()) return;
  const currentGeneration = generation;
  try {
    const [cartResult, wishResult] = await Promise.all([
      getClient().from('cart_items').select('product_id,color,size,quantity').eq('user_id', user.id),
      getClient().from('wishlists').select('product_id').eq('user_id', user.id)
    ]);
    if (cartResult.error || wishResult.error) throw cartResult.error || wishResult.error;
    if (currentGeneration !== generation) return;
    const remote = cartResult.data.map(row => ({ productId: row.product_id, color: row.color, size: row.size, quantity: row.quantity }));
    // Cached and remote copies represent the same cart; use max rather than counting twice.
    for (const item of state.cart) {
      const match = remote.find(value => itemKey(value) === itemKey(item));
      if (match) match.quantity = Math.max(match.quantity, item.quantity);
      else remote.push({ ...item });
    }
    // A failed remote write leaves the guest snapshot in place. Only merge the
    // delta on a retry, so a reconnect never counts the same guest item twice.
    const previousGuest = state.pendingGuest || empty();
    for (const item of guest.cart) {
      const previouslyMerged = previousGuest.cart.find(value => itemKey(value) === itemKey(item))?.quantity || 0;
      const delta = Math.max(0, item.quantity - previouslyMerged);
      const match = remote.find(value => itemKey(value) === itemKey(item));
      if (match) match.quantity = Math.min(10, match.quantity + delta);
      else if (delta) remote.push({ ...item, quantity: delta });
    }
    state.cart = remote.filter(item => getProduct(item.productId));
    state.wishlist = [...new Set([...wishResult.data.map(row => Number(row.product_id)), ...state.wishlist, ...guest.wishlist].map(Number))].filter(id => getProduct(id));
    state.pendingGuest = { cart: guest.cart.map(item => ({ ...item })), wishlist: [...guest.wishlist] };
    if (!state.coupon && guest.coupon) state.coupon = guest.coupon;
    changed();
    const owner = user;
    const writes = [];
    if (state.cart.length) writes.push(getClient().from('cart_items').upsert(state.cart.map(item => cartRow(item, owner)), { onConflict: 'user_id,product_id,color,size' }));
    if (state.wishlist.length) writes.push(getClient().from('wishlists').upsert(state.wishlist.map(product_id => ({ user_id: owner.id, product_id })), { onConflict: 'user_id,product_id' }));
    const results = await Promise.all(writes);
    if (results.some(result => result.error)) throw results.find(result => result.error).error;
    if (currentGeneration === generation) { save('guest', empty()); delete state.pendingGuest; changed(); }
  } catch (error) {
    console.warn('Styleland merge:', error.message);
    // Keep guest data for a later retry if the remote merge fails.
    window.dispatchEvent(new CustomEvent('styleland:error', { detail: 'همگام‌سازی حساب کامل نشد؛ داده‌های مهمان روی دستگاه باقی ماند.' }));
  }
}
