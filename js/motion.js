const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const REVEAL_TARGETS = [
  '#main-content .section__heading',
  '#main-content .style-edit__heading',
  '#main-content .style-story',
  '#main-content .benefit',
  '#main-content .category-card',
  '#main-content .product-card',
  '#main-content .deal-banner',
  '#main-content .collection',
  '#main-content .brand-strip',
  '#main-content .brand-strip a',
  '#main-content .brand-card',
  '#main-content .article-card',
  '#main-content .newsletter',
  '#main-content .page-heading',
  '#main-content .product-detail',
  '#main-content .cart-item',
  '#main-content .summary-card',
  '#main-content .checkout-card',
  '#main-content .checkout-step',
  '#main-content .account-card',
  '#main-content .article-detail__header',
  '#main-content .article-detail__image',
  '#main-content .article-detail__body',
  '#main-content .brand-filter',
  '#main-content .blog-filters',
  '#main-content .error-page',
  '#site-footer .footer__top',
  '#site-footer .footer__licenses',
  '#site-footer .footer__bottom'
].join(',');
const STAGGER_TARGETS = '.benefit,.style-story,.category-card,.product-card,.collection,.article-card,.brand-strip a,.brand-card,.checkout-step,.cart-item';
const TILT_TARGETS = '.style-story, .product-card';
const RIPPLE_TARGETS = '.btn, .icon-button, .hero__dot, .chip, .tab, .brand-card, .quantity button';

let revealObserver;
let initialized = false;
let scrollFrame = 0;
let bodyResizeObserver;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia(MOTION_QUERY).matches;
}

function onRevealAnimationEnd(event) {
  if (event.animationName !== 'styleland-reveal' || event.target !== this) return;
  this.classList.remove('motion-target', 'is-revealing');
  this.style.removeProperty('--motion-delay');
  this.removeEventListener('animationend', onRevealAnimationEnd);
}

export function observeMotion() {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion-ready');
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        revealObserver.unobserve(element);
        element.addEventListener('animationend', onRevealAnimationEnd);
        element.classList.add('is-revealing');
      }
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0.08 });
  }

  document.querySelectorAll(REVEAL_TARGETS).forEach(element => {
    if (element.dataset.motionObserved) return;
    element.dataset.motionObserved = 'true';
    element.classList.add('motion-target');
    if (element.matches(STAGGER_TARGETS)) {
      const siblings = [...element.parentElement.children].filter(sibling => sibling.matches(STAGGER_TARGETS));
      const index = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--motion-delay', `${Math.min(index, 6) * 75}ms`);
    }
    revealObserver.observe(element);
  });
}

function updateScrollProgress() {
  const root = document.documentElement;
  const scrollableDistance = Math.max(0, root.scrollHeight - window.innerHeight);
  const progress = scrollableDistance ? Math.min(1, window.scrollY / scrollableDistance) : 0;
  root.style.setProperty('--scroll-progress', progress.toFixed(4));
  root.classList.toggle('has-scrolled', window.scrollY > 14);
}

function scheduleScrollProgress() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollProgress();
  });
}

function initScrollProgress() {
  window.addEventListener('scroll', scheduleScrollProgress, { passive: true });
  window.addEventListener('resize', scheduleScrollProgress, { passive: true });
  window.addEventListener('pageshow', scheduleScrollProgress);
  document.addEventListener('load', scheduleScrollProgress, true);
  updateScrollProgress();

  if ('ResizeObserver' in window && document.body) {
    bodyResizeObserver = new ResizeObserver(scheduleScrollProgress);
    bodyResizeObserver.observe(document.body);
  }
}

function initPointerTilt() {
  if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const main = document.getElementById('main-content');
  if (!main) return;
  let activeCard = null;

  const reset = card => {
    if (!card) return;
    card.dataset.tiltActive = 'false';
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--pointer-x');
    card.style.removeProperty('--pointer-y');
    if (activeCard === card) activeCard = null;
  };

  main.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !(event.target instanceof Element)) return;
    const card = event.target.closest(TILT_TARGETS);
    if (!card) {
      if (activeCard) reset(activeCard);
      return;
    }
    if (activeCard && activeCard !== card) reset(activeCard);
    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    card.dataset.tiltActive = 'true';
    card.style.setProperty('--tilt-x', `${((0.5 - y) * 3.2).toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${((x - 0.5) * 3.8).toFixed(2)}deg`);
    card.style.setProperty('--pointer-x', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--pointer-y', `${(y * 100).toFixed(1)}%`);
    activeCard = card;
  }, { passive: true });

  main.addEventListener('pointerout', event => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(TILT_TARGETS);
    if (card && !card.contains(event.relatedTarget)) reset(card);
  }, { passive: true });
  main.addEventListener('pointerleave', () => reset(activeCard), { passive: true });
}

function initRipples() {
  if (prefersReducedMotion()) return;
  document.addEventListener('pointerdown', event => {
    if (!(event.target instanceof Element) || (event.button !== undefined && event.button !== 0)) return;
    const control = event.target.closest(RIPPLE_TARGETS);
    if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;
    const bounds = control.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    control.style.setProperty('--ripple-x', `${event.clientX - bounds.left}px`);
    control.style.setProperty('--ripple-y', `${event.clientY - bounds.top}px`);
    control.classList.remove('is-rippling');
    requestAnimationFrame(() => {
      if (control.isConnected) control.classList.add('is-rippling');
    });
  }, { passive: true });

  document.addEventListener('animationend', event => {
    if (event.animationName === 'motion-ripple' && event.pseudoElement === '::after') {
      event.target.classList.remove('is-rippling');
    }
  });
}

export function initMotion() {
  if (initialized) return;
  initialized = true;
  initScrollProgress();
  observeMotion();
  initPointerTilt();
  initRipples();
}
