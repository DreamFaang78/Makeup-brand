// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Razorpay: Verify Payment (Server-side HMAC SHA256)
// POST /api/razorpay/verify-payment
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LAN${timestamp}${randomStr}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,   // cart items, customer info, address
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    if (!orderData) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // ── HMAC SHA256 Verification ──
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      console.error('Payment signature verification failed');
      return NextResponse.json({ error: 'Payment verification failed', verified: false }, { status: 400 });
    }

    // ── Payment is verified: Create order in database ──
    const supabase = createAdminClient();
    const order_number = generateOrderNumber();

    // Sync customer if customer_id provided
    let customer_id = orderData.customer_id || null;
    if (orderData.phone || orderData.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .or(`phone.eq.${orderData.phone},email.eq.${orderData.email}`)
        .single();

      if (existingCustomer) {
        customer_id = existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: custError } = await supabase
          .from('customers')
          .insert({
            phone: orderData.phone || null,
            email: orderData.email || null,
            full_name: orderData.full_name || 'Lanan Customer',
            segment: 'new',
            total_spend: 0,
            order_count: 0,
          })
          .select('id')
          .single();

        if (!custError && newCustomer) {
          customer_id = newCustomer.id;
        }
      }
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        customer_id,
        guest_phone: orderData.guest_phone || orderData.phone || null,
        guest_email: orderData.guest_email || orderData.email || null,
        shipping_address: orderData.shipping_address || {},
        billing_address: orderData.billing_address || null,
        subtotal: orderData.subtotal || 0,
        discount_amt: orderData.discount_amt || 0,
        shipping_charge: orderData.shipping_charge || 0,
        gst_amount: orderData.gst_amount || 0,
        total_amount: orderData.total_amount || 0,
        coupon_code: orderData.coupon_code || null,
        payment_method: 'razorpay',
        payment_status: 'payment_captured',
        fulfillment_status: 'pending',
        delivery_method: orderData.delivery_method || 'standard',
        razorpay_order_id,
        notes: `Razorpay Payment ID: ${razorpay_payment_id}`,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError.message);
      return NextResponse.json({ error: 'Failed to create order', verified: true }, { status: 500 });
    }

    // Create order items
    if (orderData.items && order) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        product_name: item.product_name,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        total_price: item.total_price || (item.quantity * (item.unit_price || item.price)),
        gst_rate: item.gst_rate || 18,
        image_url: item.image_url || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError.message);
      }
    }

    // Update customer stats if customer exists
    if (customer_id && order) {
      const { data: currentCustomer } = await supabase
        .from('customers')
        .select('order_count, total_spend')
        .eq('id', customer_id)
        .single();

      if (currentCustomer) {
        await supabase
          .from('customers')
          .update({
            order_count: (currentCustomer.order_count || 0) + 1,
            total_spend: (currentCustomer.total_spend || 0) + (orderData.total_amount || 0),
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer_id);
      }
    }

    console.log('Order created successfully:', order?.id, order_number);

    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      order_number: order?.id ? order_number : undefined,
      db_order_id: order?.id,
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
