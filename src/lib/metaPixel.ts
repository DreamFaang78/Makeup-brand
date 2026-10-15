// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Meta Ads Pixel Tracking & Consent Utility
// ─────────────────────────────────────────────────────────────────────────────

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export const CONSENT_STORAGE_KEY = 'lanan_cookie_consent';

export type ConsentStatus = 'granted' | 'denied' | 'undecided';

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & {
      queue?: any[];
      loaded?: boolean;
      version?: string;
      callMethod?: (...args: any[]) => void;
    };
    _fbq?: any;
  }
}

/**
 * Returns current marketing consent choice from localStorage
 */
export function getMarketingConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'undecided';
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') return stored;
  } catch {
    // localStorage might be unavailable or restricted
  }
  return 'undecided';
}

/**
 * Checks whether user has explicitly granted marketing consent
 */
export function hasMarketingConsent(): boolean {
  return getMarketingConsent() === 'granted';
}

/**
 * Update marketing consent in localStorage and update Meta Pixel consent state
 */
export function setMarketingConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  const status: ConsentStatus = granted ? 'granted' : 'denied';
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch (e) {
    console.warn('[Meta Pixel] Failed to persist consent to localStorage:', e);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('consent', granted ? 'grant' : 'revoke');
  }

  // Dispatch custom window event so listeners (e.g. banner, consent modals) can update
  window.dispatchEvent(new CustomEvent('lanan_consent_changed', { detail: { status } }));
}

/**
 * Safe wrapper to invoke fbq commands
 */
function callFbq(...args: any[]): void {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    window.fbq(...args);
  } else {
    // If fbq hasn't loaded yet, ensure array queue exists
    window._fbq = window._fbq || [];
    window._fbq.push(args);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Meta Pixel Event]:`, ...args);
  }
}

let lastTrackedPath = '';
let lastTrackedTimestamp = 0;

/**
 * PageView — Initial page load and client-side route changes, without duplicates
 */
export function trackPageView(url?: string): void {
  if (!META_PIXEL_ID) return;

  const currentPath = url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  const now = Date.now();

  // Deduplication safeguard: avoid multiple identical PageView calls within 500ms
  if (currentPath && currentPath === lastTrackedPath && now - lastTrackedTimestamp < 500) {
    return;
  }

  lastTrackedPath = currentPath;
  lastTrackedTimestamp = now;

  callFbq('track', 'PageView');
}

/**
 * ViewContent — Product detail page views with ID, name, price, and currency INR
 */
export function trackViewContent(params: {
  id: string | number;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}): void {
  if (!META_PIXEL_ID) return;

  const price = Number(params.price) || 0;
  const contentId = String(params.id || '');

  callFbq('track', 'ViewContent', {
    content_ids: [contentId],
    content_name: params.name,
    content_type: 'product',
    content_category: params.category || 'Skincare',
    value: price,
    currency: params.currency || 'INR',
  });
}

/**
 * Search — When a customer submits a search
 */
export function trackSearch(query: string): void {
  if (!META_PIXEL_ID || !query || !query.trim()) return;

  callFbq('track', 'Search', {
    search_string: query.trim(),
    content_type: 'product',
  });
}

/**
 * AddToCart — Successful cart additions with product and value details
 */
export function trackAddToCart(params: {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
  variant?: string | null;
}): void {
  if (!META_PIXEL_ID) return;

  const qty = Math.max(1, Number(params.quantity) || 1);
  const unitPrice = Number(params.price) || 0;
  const totalValue = unitPrice * qty;
  const contentId = String(params.id || '');

  callFbq('track', 'AddToCart', {
    content_ids: [contentId],
    content_name: params.name,
    content_type: 'product',
    value: totalValue,
    currency: params.currency || 'INR',
    num_items: qty,
    ...(params.variant ? { content_variant: params.variant } : {}),
  });
}

/**
 * InitiateCheckout — When a customer proceeds to Shopify checkout
 */
export function trackInitiateCheckout(params: {
  items?: Array<{
    id: string | number;
    name?: string;
    price: number;
    quantity?: number;
  }>;
  value: number;
  currency?: string;
  num_items?: number;
}): void {
  if (!META_PIXEL_ID) return;

  const contentIds = (params.items || [])
    .map((item) => String(item.id || ''))
    .filter(Boolean);

  const numItems =
    params.num_items ??
    (params.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  callFbq('track', 'InitiateCheckout', {
    content_ids: contentIds.length > 0 ? contentIds : undefined,
    content_type: 'product',
    value: Number(params.value) || 0,
    currency: params.currency || 'INR',
    num_items: Math.max(1, numItems),
  });
}

/**
 * Custom tracking function for any specific business events
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>): void {
  if (!META_PIXEL_ID) return;
  callFbq('trackCustom', eventName, params);
}
