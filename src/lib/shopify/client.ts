// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Storefront API Client (Server-Side Only)
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, any>;
  cache?: RequestCache;
  revalidate?: number;
}

export function getShopifyConfig() {
  if (typeof window !== 'undefined') {
    return {
      domain: '',
      storefrontAccessToken: '',
      apiVersion: '2026-10',
      isConfigured: false,
    };
  }

  // Exact hosting variable names
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-10';

  const isConfigured = Boolean(
    domain &&
    storefrontAccessToken &&
    !domain.includes('your-shop-name') &&
    domain.trim() !== '' &&
    storefrontAccessToken.trim() !== ''
  );

  return {
    domain: domain ? domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
    storefrontAccessToken: storefrontAccessToken || '',
    apiVersion,
    isConfigured,
  };
}

export async function shopifyFetch<T = any>({
  query,
  variables = {},
  cache = 'no-store',
  revalidate,
}: ShopifyFetchOptions): Promise<{ data?: T; errors?: any[] } | null> {
  // Prevent any client-side execution
  if (typeof window !== 'undefined') {
    console.error('[Shopify Security]: shopifyFetch must only be invoked from server-side code.');
    return null;
  }

  const { domain, storefrontAccessToken, apiVersion, isConfigured } = getShopifyConfig();

  if (!isConfigured || !domain || !storefrontAccessToken) {
    return null;
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Private Storefront Access Token header for server-to-server calls
        'Shopify-Storefront-Private-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      ...(revalidate !== undefined
        ? { next: { revalidate } }
        : { cache }),
    });

    if (!response.ok) {
      const errText = await response.text();
      // Mask token and log safe diagnostic message
      console.error(`[Shopify API Error] HTTP ${response.status}: ${errText.slice(0, 300)}`);
      return { errors: [{ message: `HTTP ${response.status}: ${errText.slice(0, 300)}` }] };
    }

    const result = await response.json();
    if (result.errors) {
      console.error('[Shopify GraphQL Errors]:', result.errors);
    }
    return result;
  } catch (err: any) {
    console.error('[Shopify Fetch Exception]:', err.message);
    return { errors: [{ message: err.message }] };
  }
}
