// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Razorpay Webhook Handler
// POST /api/razorpay/webhook
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // ── Verify webhook signature ──
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const supabase = createAdminClient();

    console.log('Razorpay webhook received:', eventType);

    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        console.log('Payment captured:', payment.id, 'Order:', payment.order_id);
        
        // Update order status to payment_captured
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'payment_captured',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id);

        if (updateError) {
          console.error('Error updating order status:', updateError.message);
        }
        // TODO: Trigger confirmation email via Resend
        // TODO: Deduct inventory
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log('Payment failed:', payment.id, 'Error:', payment.error_description);
        
        // Update order status to payment_failed
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'payment_failed',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id);

        if (updateError) {
          console.error('Error updating order status:', updateError.message);
        }
        // TODO: Notify customer
        break;
      }

      case 'order.paid': {
        const order = event.payload.order.entity;
        console.log('Order paid:', order.id);
        
        // Final order confirmation
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'payment_captured',
            fulfillment_status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', order.id);

        if (updateError) {
          console.error('Error updating order status:', updateError.message);
        }
        break;
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity;
        console.log('Refund processed:', refund.id, 'Amount:', refund.amount / 100);
        
        // Update order status to payment_refunded
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'payment_refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', refund.order_id);

        if (updateError) {
          console.error('Error updating order status:', updateError.message);
        }
        // TODO: Notify customer of refund
        break;
      }

      case 'payment.authorized': {
        const payment = event.payload.payment.entity;
        console.log('Payment authorized:', payment.id);
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'payment_authorized',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id);

        if (updateError) {
          console.error('Error updating order status:', updateError.message);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
