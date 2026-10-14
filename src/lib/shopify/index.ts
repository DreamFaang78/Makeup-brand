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
      const res = await shopifyFetch<{ product: ShopifyProduct | null }>({
        query: GET_PRODUCT_BY_HANDLE_QUERY,
        variables: { handle },
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

/**
 * Build a robust Shopify Cart Permalink that routes customers directly to Shopify Checkout
 * e.g. https://domain/cart/{variant_id}:{qty},{variant_id}:{qty}?discount={coupon}
 */
export function buildShopifyCartPermalink(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  discountCode?: string | null
): string | null {
  const { domain, isConfigured } = getShopifyConfig();
  if (!isConfigured || !domain) return null;

  const validItems: string[] = [];

  for (const item of lines) {
    if (!item?.merchandiseId) continue;
    const qty = Math.max(1, Number(item.quantity) || 1);

    // Extract digits from variant GID or numeric ID string
    const match = String(item.merchandiseId).match(/\d+/g);
    if (match && match.length > 0) {
      const variantId = match[match.length - 1];
      validItems.push(`${variantId}:${qty}`);
    }
  }

  if (validItems.length === 0) return null;

  let url = `https://${domain}/cart/${validItems.join(',')}`;
  if (discountCode && discountCode.trim()) {
    url += `?discount=${encodeURIComponent(discountCode.trim())}`;
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
  const { isConfigured, domain } = getShopifyConfig();
  if (!isConfigured) return null;

  // Generate universal permalink as primary or backup checkout URL
  const permalinkUrl = buildShopifyCartPermalink(lines, discountCode);

  try {
    // Ensure only valid Shopify variant GIDs are sent to cartCreate
    const formattedLines = (Array.isArray(lines) ? lines : [])
      .filter((l) => l && typeof l.merchandiseId === 'string' && l.merchandiseId.includes('gid://shopify/ProductVariant/'))
      .map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: Math.max(1, Number(l.quantity) || 1),
      }));

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
        },
      });

      if (res?.data?.cartCreate?.cart) {
        const cart = res.data.cartCreate.cart;
        // If permalink is available, prefer it because trial/headless stores may not route /cart/c/
        return {
          ...cart,
          checkoutUrl: permalinkUrl || cart.checkoutUrl,
        };
      }
      if (res?.data?.cartCreate?.userErrors?.length) {
        console.error('[Shopify Cart Error]:', res.data.cartCreate.userErrors);
      }
    }
  } catch (err: any) {
    console.error('[Shopify createCart Error]:', err.message);
  }

  // If GraphQL cart creation had issues or lines weren't full GIDs, return synthesized cart with permalink
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
