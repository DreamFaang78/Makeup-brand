// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin: Get All Orders
// GET /api/admin/orders
// Uses admin client to bypass RLS policies
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Fetch all orders with order items and customer details (admin access)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message, error.details);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    // Fetch customer details for each order
    const ordersWithCustomers = await Promise.all((data || []).map(async (order) => {
      let customer = null;
      if (order.customer_id) {
        const { data: custData } = await supabase
          .from('customers')
          .select('full_name, phone, email')
          .eq('id', order.customer_id)
          .single();
        customer = custData;
      }
      
      return {
        ...order,
        items: order.order_items || [],
        customer: customer || undefined,
      };
    }));

    return NextResponse.json({ success: true, orders: ordersWithCustomers });
  } catch (err: any) {
    console.error('Admin orders route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
