// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Order Creation API (Cash on Delivery & Direct Checkout)
// POST /api/orders
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LAN${year}${month}${day}${randomStr}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      shipping_address,
      billing_address,
      items,
      subtotal,
      discount_amt = 0,
      shipping_charge = 0,
      gst_amount = 0,
      total_amount,
      coupon_code = null,
      delivery_method = 'standard',
      payment_method = 'cod',
    } = body;

    // Basic validation
    if (!customer?.phone || !customer?.name) {
      return NextResponse.json({ error: 'Customer name and phone number are required' }, { status: 400 });
    }

    if (!shipping_address?.line1 || !shipping_address?.city || !shipping_address?.pincode) {
      return NextResponse.json({ error: 'Complete shipping address is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const order_number = generateOrderNumber();

    // 1. Sync or create customer profile
    let customer_id: string | null = null;
    try {
      const sanitizedPhone = customer.phone.replace(/\D/g, '').slice(-10);
      
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, full_name, order_count, total_spend')
        .or(`phone.ilike.%${sanitizedPhone}%,email.eq.${customer.email || 'non_existent_placeholder@lanan.in'}`)
        .limit(1)
        .maybeSingle();

      if (existingCustomer) {
        customer_id = existingCustomer.id;
      } else {
        const { data: newCustomer, error: newCustErr } = await supabase
          .from('customers')
          .insert({
            phone: `+91${sanitizedPhone}`,
            email: customer.email || null,
            full_name: customer.name,
            segment: 'new',
            total_spend: 0,
            order_count: 0,
          })
          .select('id')
          .single();

        if (!newCustErr && newCustomer) {
          customer_id = newCustomer.id;
        }
      }
    } catch (custErr) {
      console.warn('[Orders API] Customer sync error (non-fatal):', custErr);
    }

    // 2. Fetch valid product IDs from DB to ensure FK constraints don't fail
    const productUuidsToCheck = items
      .map((i: any) => i.product_id)
      .filter((id: any) => typeof id === 'string' && UUID_REGEX.test(id));

    const validProductMap = new Set<string>();
    if (productUuidsToCheck.length > 0) {
      try {
        const { data: foundProds } = await supabase
          .from('products')
          .select('id')
          .in('id', productUuidsToCheck);
        (foundProds || []).forEach((p) => validProductMap.add(p.id));
      } catch (err) {
        console.warn('[Orders API] Could not verify products:', err);
      }
    }

    // 3. Insert order record
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        customer_id,
        guest_phone: customer.phone,
        guest_email: customer.email || null,
        shipping_address: {
          full_name: customer.name,
          phone: customer.phone,
          line1: shipping_address.line1,
          line2: shipping_address.line2 || '',
          city: shipping_address.city,
          state: shipping_address.state || 'Uttar Pradesh',
          pincode: shipping_address.pincode,
          landmark: shipping_address.landmark || '',
        },
        billing_address: billing_address || shipping_address,
        subtotal: Number(subtotal) || 0,
        discount_amt: Number(discount_amt) || 0,
        shipping_charge: Number(shipping_charge) || 0,
        gst_amount: Number(gst_amount) || 0,
        total_amount: Number(total_amount) || 0,
        coupon_code: coupon_code || null,
        payment_method: payment_method || 'cod',
        payment_status: payment_method === 'cod' ? 'cod_pending' : 'payment_pending',
        fulfillment_status: 'pending',
        delivery_method: delivery_method || 'standard',
        notes: payment_method === 'cod' ? 'Cash on Delivery order' : 'Website order',
      })
      .select('*')
      .single();

    if (orderError || !newOrder) {
      console.error('[Orders API] Failed to create order:', orderError);
      return NextResponse.json(
        { error: orderError?.message || 'Failed to place order in database' },
        { status: 500 }
      );
    }

    // 4. Insert order items
    const orderItemsToInsert = items.map((item: any) => {
      const isValidUuid = typeof item.product_id === 'string' && validProductMap.has(item.product_id);
      const unitPrice = Number(item.unit_price || item.price || 0);
      const qty = Number(item.quantity || 1);
      const totalPrice = Number(item.total_price || unitPrice * qty);

      return {
        order_id: newOrder.id,
        product_id: isValidUuid ? item.product_id : null,
        variant_id: null,
        product_name: item.product_name || 'LANAN Formulation',
        variant_name: item.variant_name || null,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        gst_rate: Number(item.gst_rate || 18),
        image_url: item.image_url || null,
      };
    });

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsErr) {
      console.error('[Orders API] Order items insert error:', itemsErr.message);
    }

    // 5. Update customer stats if customer exists
    if (customer_id) {
      try {
        const { data: curCust } = await supabase
          .from('customers')
          .select('order_count, total_spend')
          .eq('id', customer_id)
          .single();

        if (curCust) {
          await supabase
            .from('customers')
            .update({
              order_count: (curCust.order_count || 0) + 1,
              total_spend: (curCust.total_spend || 0) + Number(total_amount || 0),
              updated_at: new Date().toISOString(),
            })
            .eq('id', customer_id);
        }
      } catch (statsErr) {
        console.warn('[Orders API] Could not update customer stats:', statsErr);
      }
    }

    console.log(`[Orders API] COD order placed successfully: ${order_number} (${newOrder.id})`);

    return NextResponse.json({
      success: true,
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      total_amount: newOrder.total_amount,
    });

  } catch (error: any) {
    console.error('[Orders API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}
