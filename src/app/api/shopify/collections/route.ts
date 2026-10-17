// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Collections API Route
// GET /api/shopify/collections
// Returns collections directly from Shopify Storefront API
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getShopifyCollections, getShopifyConfig } from '@/lib/shopify';

export const revalidate = 300;

export async function GET() {
  try {
    const { isConfigured } = getShopifyConfig();
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        source: 'unconfigured',
        collections: [],
      });
    }

    const collections = await getShopifyCollections();
    return NextResponse.json(
      {
        success: true,
        source: 'shopify',
        collections,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/shopify/collections Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
