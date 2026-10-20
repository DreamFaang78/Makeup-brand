// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Order Creation API (Shopify Admin Synced & Direct Checkout Guard)
// POST /api/orders
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getShopifyConfig } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (!customer?.name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    if (customer?.phone) {
      const cleanPhone = String(customer.phone).replace(/\D/g, '');
      if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
      }
    }

    if (!shipping_address?.line1 || !shipping_address?.city || !shipping_address?.pincode) {
      return NextResponse.json({ error: 'Complete shipping address is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    const { domain, isConfigured, apiVersion } = getShopifyConfig();

    // Check for explicit Shopify Admin Access Token
    // CRITICAL: Storefront tokens cannot create Admin orders (returns 403 Forbidden).
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!adminToken) {
      console.warn('[Orders API] Direct order creation blocked: SHOPIFY_ADMIN_ACCESS_TOKEN is not configured.');
      return NextResponse.json(
        {
          success: false,
          requiresShopifyCheckout: true,
          error:
            "Direct server-side order creation requires a dedicated Shopify Admin API App with 'write_orders' permission (SHOPIFY_ADMIN_ACCESS_TOKEN). The Storefront API token cannot create Admin orders. Please route checkout through Shopify-hosted checkout (checkoutUrl) so orders appear in Shopify Admin.",
        },
        { status: 403 }
      );
    }

    // Attempt to create a real Shopify order via Shopify Admin REST API
    const lineItems = items.map((item: any) => {
      const match = String(item.variant_id || item.product_id || '').match(/\d+/g);
      const variantId = match && match.length > 0 ? Number(match[match.length - 1]) : null;
      return {
        variant_id: variantId,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Number(item.unit_price || item.price || 0),
        title: item.product_name,
      };
    });

    const [firstName, ...lastNameParts] = (customer.name || '').trim().split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const formattedPhone = customer.phone
      ? (customer.phone.startsWith('+') ? customer.phone : `+91${customer.phone.replace(/\D/g, '')}`)
      : undefined;

    const shopifyOrderPayload = {
      order: {
        line_items: lineItems,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: customer.email || undefined,
          phone: formattedPhone,
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: shipping_address.line1,
          address2: shipping_address.line2 || undefined,
          city: shipping_address.city,
          province: shipping_address.state || 'Uttar Pradesh',
          zip: shipping_address.pincode,
          country: 'India',
          phone: formattedPhone,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address1: billing_address?.line1 || shipping_address.line1,
          address2: billing_address?.line2 || shipping_address.line2 || undefined,
          city: billing_address?.city || shipping_address.city,
          province: billing_address?.state || shipping_address.state || 'Uttar Pradesh',
          zip: billing_address?.pincode || shipping_address.pincode,
          country: 'India',
          phone: formattedPhone,
        },
        financial_status: payment_method === 'cod' ? 'pending' : 'authorized',
        gateway: payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment',
        tags: 'LANAN-Headless, COD',
        note: `Placed via LANAN custom headless checkout. Delivery: ${delivery_method}`,
      },
    };

    const shopifyAdminUrl = `https://${domain}/admin/api/${apiVersion}/orders.json`;
    const shopifyRes = await fetch(shopifyAdminUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(shopifyOrderPayload),
    });

    const shopifyData = await shopifyRes.json();

    if (!shopifyRes.ok || !shopifyData.order) {
      console.error('[Orders API] Shopify Admin order creation failed:', shopifyData);
      return NextResponse.json(
        {
          success: false,
          error:
            shopifyData.errors
              ? typeof shopifyData.errors === 'string'
                ? shopifyData.errors
                : JSON.stringify(shopifyData.errors)
              : 'Failed to create order in Shopify Admin.',
        },
        { status: shopifyRes.status || 500 }
      );
    }

    const realShopifyOrder = shopifyData.order;
    const order_number = realShopifyOrder.name || `LAN-${realShopifyOrder.id}`;

    // Optionally mirror into Supabase as secondary record
    try {
      const supabase = createAdminClient();
      await supabase.from('orders').insert({
        order_number,
        guest_phone: customer.phone,
        guest_email: customer.email || null,
        shipping_address: shipping_address,
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
        notes: `Shopify Admin Order ID: ${realShopifyOrder.id}`,
      });
    } catch (dbErr) {
      console.warn('[Orders API] Supabase order mirror failed (non-fatal):', dbErr);
    }

    console.log(`[Orders API] Real Shopify order created: ${order_number} (ID: ${realShopifyOrder.id})`);

    return NextResponse.json({
      success: true,
      order_id: String(realShopifyOrder.id),
      order_number,
      total_amount: realShopifyOrder.total_price,
      shopify_order_id: realShopifyOrder.id,
      shopify_synced: true,
    });
  } catch (error: any) {
    console.error('[Orders API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}
