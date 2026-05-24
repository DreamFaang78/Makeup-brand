// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Razorpay: Create Order (Server-side)
// POST /api/razorpay/create-order
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', notes = {} } = body;

    // Validate amount server-side
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Minimum order value: ₹1
    if (amount < 100) { // amount is in paise
      return NextResponse.json({ error: 'Amount too small' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    // Create Razorpay order via REST API (avoids Node SDK issues in Edge)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,          // in paise
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
