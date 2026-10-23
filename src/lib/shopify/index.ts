// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Storefront Integration Service
// Connects Next.js to Shopify Storefront API with graceful local fallback
// ─────────────────────────────────────────────────────────────────────────────

import { shopifyFetch, getShopifyConfig } from './client';
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  CREATE_CART_MUTATION,
  ADD_CART_LINES_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  REMOVE_CART_LINES_MUTATION,
  GET_CART_QUERY,
} from './queries';
import {
  type ShopifyProduct,
  type ShopifyCart,
  normalizeShopifyProduct,
} from './types';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import type { ProductCardData } from '@/types/product';

export * from './types';
export * from './client';
export * from './queries';

/**
 * Fetch all products from Shopify, fallback to canonical LANAN catalog if not configured
 */
export async function getShopifyProducts(options?: {
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<{ products: ProductCardData[]; isLiveShopify: boolean }> {
  const { isConfigured } = getShopifyConfig();

  if (isConfigured) {
    try {
      const res = await shopifyFetch<{
        products: { edges: Array<{ node: ShopifyProduct }> };
      }>({
        query: GET_PRODUCTS_QUERY,
        variables: {
          first: 50,
          query: options?.query || null,
          sortKey: options?.sortKey || null,
          reverse: options?.reverse || false,
        },
        revalidate: 60,
      });

      if (res?.data?.products?.edges && res.data.products.edges.length > 0) {
        const normalized = res.data.products.edges.map((e) =>
          normalizeShopifyProduct(e.node)
        );
        return { products: normalized, isLiveShopify: true };
      }
    } catch (e: any) {
      console.warn('[Shopify] Failed to fetch live products, falling back:', e.message);
    }
  }

  // Graceful fallback to verified canonical LANAN catalog
  return { products: DEMO_PRODUCTS, isLiveShopify: false };
}

/**
 * Fetch a single product by its handle/slug
 */
export async function getShopifyProductByHandle(
  handle: string
): Promise<{ product: ProductCardData | null; isLiveShopify: boolean }> {
  const { isConfigured } = getShopifyConfig();

  if (isConfigured) {
    try {
      const aliasMap: Record<string, string> = {
        'lanan-glutathione-face-toner-100-ml': 'lanan-glutathione-face-toner-100-ml-1',
        'lanan-glutathione-face-toner': 'lanan-glutathione-face-toner-100-ml-1',
      };
      const queryHandle = aliasMap[handle] || handle;

      const res = await shopifyFetch<{ product: ShopifyProduct | null }>({
        query: GET_PRODUCT_BY_HANDLE_QUERY,
        variables: { handle: queryHandle },
        revalidate: 60,
      });

      if (res?.data?.product) {
        return {
          product: normalizeShopifyProduct(res.data.product),
          isLiveShopify: true,
        };
      }
    } catch (e: any) {
      console.warn(`[Shopify] Failed to fetch product ${handle}:`, e.message);
    }
  }

  const fallback = DEMO_PRODUCTS.find((p) => p.slug === handle || p.id === handle) || null;
  return { product: fallback, isLiveShopify: false };
}

/**
 * Fetch collections
 */
export async function getShopifyCollections() {
  const { isConfigured } = getShopifyConfig();

  if (isConfigured) {
    try {
      const res = await shopifyFetch<{
        collections: { edges: Array<{ node: any }> };
      }>({
        query: GET_COLLECTIONS_QUERY,
        variables: { first: 10 },
        revalidate: 300,
      });

      if (res?.data?.collections?.edges) {
        return res.data.collections.edges.map((e) => ({
          id: e.node.id,
          handle: e.node.handle,
          title: e.node.title,
          description: e.node.description,
          image: e.node.image?.url || null,
          products: (e.node.products?.edges || []).map((pe: any) =>
            normalizeShopifyProduct(pe.node)
          ),
        }));
      }
    } catch (e: any) {
      console.warn('[Shopify] Collections fetch failed:', e.message);
    }
  }

  return [];
}

// Canonical mapping for all LANAN formulation variants in Shopify
const CANONICAL_VARIANT_MAP: Record<string, string> = {
  // Face Wash
  'lanan-face-wash': '50448951148682',
  'lanan-face-wash-100-ml': '50448951148682',
  'v-lfw-100': '50448951148682',
  '9381378949258': '50448951148682',
  '50448951148682': '50448951148682',

  // Face Moisturizer
  'lanan-face-moisturizer': '50448974676106',
  'lanan-face-moisturizer-50-g': '50448974676106',
  'v-lfm-50': '50448974676106',
  '9381387600010': '50448974676106',
  '50448974676106': '50448974676106',

  // Face Serum
  'lanan-glutathione-face-serum': '50448901963914',
  'lanan-glutathione-face-serum-30-ml': '50448901963914',
  'v-gfs-30': '50448901963914',
  '9381357715594': '50448901963914',
  '50448901963914': '50448901963914',

  // Face Toner
  'lanan-glutathione-face-toner': '50449226399882',
  'lanan-glutathione-face-toner-100-ml': '50449226399882',
  'lanan-glutathione-face-toner-100-ml-1': '50449226399882',
  'v-gft-100': '50449226399882',
  '9381479252106': '50449226399882',
  '50449226399882': '50449226399882',
  '50448994795658': '50449226399882',

  // Sunscreen
  'lanan-sunscreen-spf-50': '50448837443722',
  'lanan-sunscreen-spf-50-pa-50-g': '50448837443722',
  'v-ls-50': '50448837443722',
  '9381328617610': '50448837443722',
  '50448837443722': '50448837443722',
};

/**
 * Resolves any product slug, demo ID, or GID to a verified 14-digit Shopify variant ID
 */
export function resolveShopifyVariantId(rawId: string | null | undefined): string {
  if (!rawId) return '50448837443722';

  const clean = String(rawId).trim();

  // 1. Direct match in canonical map
  if (CANONICAL_VARIANT_MAP[clean]) {
    return CANONICAL_VARIANT_MAP[clean];
  }

  // 2. Check if clean contains a 14-digit number (Shopify variant ID pattern)
  const fourteenDigits = clean.match(/\b\d{14}\b/);
  if (fourteenDigits) {
    return fourteenDigits[0];
  }

  // 3. Keyword matching for resilience
  const lower = clean.toLowerCase();
  if (lower.includes('wash') || lower.includes('cleanse')) return '50448951148682';
  if (lower.includes('moistur')) return '50448974676106';
  if (lower.includes('serum')) return '50448901963914';
  if (lower.includes('toner')) return '50449226399882';
  if (lower.includes('sunscreen') || lower.includes('spf')) return '50448837443722';

  // 4. Default fallback
  return '50448837443722';
}

/**
 * Build a robust Shopify Cart Permalink that routes customers directly to Shopify Checkout
 * e.g. https://domain/cart/{variant_id}:{qty},{variant_id}:{qty}?discount={coupon}
 */
export function buildShopifyCartPermalink(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  discountCode?: string | null
): string | null {
  const { domain } = getShopifyConfig();
  if (!domain || domain.includes('your-shop-name')) return null;

  const validItems: string[] = [];

  for (const item of lines) {
    if (!item?.merchandiseId && item?.merchandiseId !== '') continue;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const variantId = resolveShopifyVariantId(item.merchandiseId);
    validItems.push(`${variantId}:${qty}`);
  }

  if (validItems.length === 0) return null;

  let url = `https://${domain}/cart/${validItems.join(',')}`;
  const effectiveDiscount = discountCode && discountCode.trim();
  if (effectiveDiscount) {
    url += `?discount=${encodeURIComponent(effectiveDiscount)}`;
  }
  return url;
}

/**
 * Create a new Shopify cart and return its ID and checkout URL
 */
export async function createShopifyCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  discountCode?: string | null
): Promise<ShopifyCart | null> {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) return null;

  // Generate universal permalink as primary checkout URL
  const permalinkUrl = buildShopifyCartPermalink(lines, discountCode);

  try {
    // Format lines with verified Shopify variant GIDs
    const formattedLines = (Array.isArray(lines) ? lines : []).map((l) => ({
      merchandiseId: `gid://shopify/ProductVariant/${resolveShopifyVariantId(l.merchandiseId)}`,
      quantity: Math.max(1, Number(l.quantity) || 1),
    }));

    const appliedDiscount = discountCode && discountCode.trim();

    if (formattedLines.length > 0) {
      const res = await shopifyFetch<{
        cartCreate: {
          cart: ShopifyCart | null;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: CREATE_CART_MUTATION,
        variables: {
          lines: formattedLines,
          discountCodes: appliedDiscount ? [appliedDiscount] : [],
        },
      });

      if (res?.data?.cartCreate?.cart) {
        const cart = res.data.cartCreate.cart;
        return {
          ...cart,
          checkoutUrl: permalinkUrl || cart.checkoutUrl,
        };
      }
      if (res?.data?.cartCreate?.userErrors?.length) {
        console.warn('[Shopify Cart Warning]:', res.data.cartCreate.userErrors);
      }
    }
  } catch (err: any) {
    console.warn('[Shopify createCart Error]:', err.message);
  }

  // Always return verified permalink checkout cart
  if (permalinkUrl) {
    return {
      id: `cart-permalink-${Date.now()}`,
      checkoutUrl: permalinkUrl,
      totalQuantity: lines.reduce((acc, l) => acc + (Number(l.quantity) || 1), 0),
      cost: {
        subtotalAmount: { amount: '0', currencyCode: 'INR' },
        totalAmount: { amount: '0', currencyCode: 'INR' },
        totalTaxAmount: null,
      },
      lines: { edges: [] },
      discountCodes: discountCode ? [{ code: discountCode, applicable: true }] : [],
    };
  }

  return null;
}

/**
 * Add items to an existing Shopify cart
 */
export async function addLinesToShopifyCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart | null> {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) return null;

  try {
    const formattedLines = (Array.isArray(lines) ? lines : [])
      .filter((l) => l && typeof l.merchandiseId === 'string' && l.merchandiseId.includes('gid://shopify/ProductVariant/'))
      .map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: Math.max(1, Number(l.quantity) || 1),
      }));

    if (formattedLines.length === 0) return null;

    const res = await shopifyFetch<{
      cartLinesAdd: {
        cart: ShopifyCart | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: ADD_CART_LINES_MUTATION,
      variables: {
        cartId,
        lines: formattedLines,
      },
    });
    return res?.data?.cartLinesAdd?.cart || null;
  } catch (err: any) {
    console.error('[Shopify addLines Error]:', err.message);
    return null;
  }
}

/**
 * Update quantity in Shopify cart
 */
export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) return null;

  try {
    const res = await shopifyFetch<{
      cartLinesUpdate: {
        cart: ShopifyCart | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: UPDATE_CART_LINES_MUTATION,
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
    });
    return res?.data?.cartLinesUpdate?.cart || null;
  } catch (err: any) {
    console.error('[Shopify updateLine Error]:', err.message);
    return null;
  }
}

/**
 * Remove line from Shopify cart
 */
export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart | null> {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) return null;

  try {
    const res = await shopifyFetch<{
      cartLinesRemove: {
        cart: ShopifyCart | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: REMOVE_CART_LINES_MUTATION,
      variables: {
        cartId,
        lineIds,
      },
    });
    return res?.data?.cartLinesRemove?.cart || null;
  } catch (err: any) {
    console.error('[Shopify removeLine Error]:', err.message);
    return null;
  }
}

/**
 * Retrieve Shopify cart by ID
 */
export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const { isConfigured } = getShopifyConfig();
  if (!isConfigured) return null;

  try {
    const res = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: GET_CART_QUERY,
      variables: { cartId },
    });
    return res?.data?.cart || null;
  } catch (err: any) {
    console.error('[Shopify getCart Error]:', err.message);
    return null;
  }
}

/**
 * Validates a discount code using the real Shopify Storefront API
 * Returns authoritative validation status, discount amount, and clear message.
 */
export async function validateShopifyDiscountCode(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  code: string
): Promise<{
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}> {
  const { isConfigured } = getShopifyConfig();
  const trimmed = (code || '').trim();
  if (!trimmed) {
    return { valid: false, code: '', discountAmount: 0, message: 'Please enter a coupon code.' };
  }

  if (!isConfigured) {
    return {
      valid: false,
      code: trimmed,
      discountAmount: 0,
      message: 'Shopify Storefront API credentials are required to validate real coupons.',
    };
  }

  try {
    const formattedLines = (Array.isArray(lines) ? lines : []).map((l) => ({
      merchandiseId: `gid://shopify/ProductVariant/${resolveShopifyVariantId(l.merchandiseId)}`,
      quantity: Math.max(1, Number(l.quantity) || 1),
    }));

    if (formattedLines.length === 0) {
      return { valid: false, code: trimmed, discountAmount: 0, message: 'Please add items to your cart before applying a coupon.' };
    }

    const res = await shopifyFetch<{
      cartCreate: {
        cart: ShopifyCart | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: CREATE_CART_MUTATION,
      variables: {
        lines: formattedLines,
        discountCodes: [trimmed],
      },
    });

    const userErrors = res?.data?.cartCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return {
        valid: false,
        code: trimmed,
        discountAmount: 0,
        message: userErrors[0].message || 'Coupon code is invalid or not applicable.',
      };
    }

    const cart = res?.data?.cartCreate?.cart;
    if (!cart) {
      return { valid: false, code: trimmed, discountAmount: 0, message: 'Unable to connect to Shopify checkout service.' };
    }

    // Inspect discountCodes on the returned cart
    const matched = (cart.discountCodes || []).find(
      (d) => d.code.toUpperCase() === trimmed.toUpperCase()
    );

    if (!matched || !matched.applicable) {
      return {
        valid: false,
        code: trimmed,
        discountAmount: 0,
        message: 'This coupon code is invalid, expired, or does not apply to the items in your cart.',
      };
    }

    const subtotal = parseFloat(cart.cost?.subtotalAmount?.amount || '0');
    const total = parseFloat(cart.cost?.totalAmount?.amount || '0');
    const discountAmount = Math.max(0, Math.round(subtotal - total));

    return {
      valid: true,
      code: trimmed,
      discountAmount,
      message: `Coupon "${trimmed}" applied successfully!`,
    };
  } catch (err: any) {
    console.error('[Shopify validateShopifyDiscountCode Error]:', err.message);
    return {
      valid: false,
      code: trimmed,
      discountAmount: 0,
      message: 'Could not verify coupon code with Shopify. Please try again.',
    };
  }
}

