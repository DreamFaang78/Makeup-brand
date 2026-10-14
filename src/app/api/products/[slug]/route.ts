// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Detail API
// GET /api/products/[slug]
// Fetches a single product by handle/slug from Shopify Storefront API
// with fallback to database/canonical catalog
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import { getShopifyProductByHandle, getShopifyConfig } from '@/lib/shopify';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const { isConfigured } = getShopifyConfig();

    if (isConfigured) {
      const { product, isLiveShopify } = await getShopifyProductByHandle(slug);
      if (product) {
        return NextResponse.json({
          success: true,
          source: isLiveShopify ? 'shopify' : 'fallback',
          product,
        });
      }
    }

    // Fallback to canonical catalog
    const fallback = DEMO_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
    if (fallback) {
      return NextResponse.json({
        success: true,
        source: 'canonical',
        product: fallback,
      });
    }

    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  } catch (err: any) {
    console.error('[API /api/products/[slug] Error]:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
