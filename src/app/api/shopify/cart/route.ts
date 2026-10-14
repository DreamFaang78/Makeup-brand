// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Cart API Route
// POST /api/shopify/cart
// Handles cart creation, item additions, and generates checkoutUrl
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';
import {
  createShopifyCart,
  addLinesToShopifyCart,
  getShopifyCart,
  getShopifyConfig,
} from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const { isConfigured } = getShopifyConfig();
    const body = await request.json();
    const { action, cartId, lines } = body;

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        message: 'Shopify Storefront API credentials are not yet configured in .env.local.',
      });
    }

    if (action === 'create' || !cartId) {
      const cart = await createShopifyCart(lines || []);
      if (!cart) {
        return NextResponse.json({ success: false, error: 'Failed to create Shopify cart' }, { status: 500 });
      }
      return NextResponse.json({ success: true, cart });
    }

    if (action === 'add') {
      const cart = await addLinesToShopifyCart(cartId, lines || []);
      return NextResponse.json({ success: true, cart });
    }

    if (action === 'get') {
      const cart = await getShopifyCart(cartId);
      return NextResponse.json({ success: true, cart });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/shopify/cart Error]:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
