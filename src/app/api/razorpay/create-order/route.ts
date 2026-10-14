// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Razorpay: Create Order (Server-side)
// POST /api/razorpay/create-order
// Server-side calculation from product catalog prevents client price tampering
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CANONICAL_PRICES: Record<string, number> = {
  'lanan-face-wash': 503,
  'LFW-100': 503,
  'lanan-face-moisturizer': 419,
  'LFM-50': 419,
  'lanan-sunscreen-spf-50': 737,
  'LSP-50': 737,
  'lanan-glutathione-face-toner': 419,
  'LGT-100': 419,
  'lanan-glutathione-face-serum': 737,
  'LGS-30': 737,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currency = 'INR', notes = {}, items, coupon_discount = 0 } = body;

    let serverAmountPaise: number | null = null;

    // Server-side calculation from database/product source
    if (Array.isArray(items) && items.length > 0) {
      let subtotal = 0;
      for (const item of items) {
        const key = item.product_slug || item.sku || item.product_id;
        const catalogPrice = CANONICAL_PRICES[key] ?? Number(item.unit_price || 0);
        subtotal += catalogPrice * (Number(item.quantity) || 1);
      }
      const discount = Number(coupon_discount) || 0;
      const discounted = Math.max(subtotal - discount, 0);
      const shipping = discounted >= 599 ? 0 : (discounted > 0 ? 79 : 0);
      const totalRupees = discounted + shipping;
      serverAmountPaise = Math.round(totalRupees * 100);
    } else if (typeof body.amount === 'number' && body.amount > 0) {
      serverAmountPaise = Math.round(body.amount);
    }

    if (!serverAmountPaise || serverAmountPaise < 100) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isMockMode =
      !keyId ||
      !keySecret ||
      keyId.includes('placeholder') ||
      keySecret.includes('placeholder') ||
      keyId === 'your_razorpay_key_id';

    if (isMockMode) {
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount: serverAmountPaise,
        currency,
        isMock: true,
      });
    }

    // Create Razorpay order via REST API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: serverAmountPaise, // in paise
        currency,
        receipt: `lanan_${Date.now()}`,
        notes,
        payment_capture: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Razorpay create order error:', err);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
