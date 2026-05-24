// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin: Update Order Fulfillment
// PUT /api/admin/orders/{orderId}/fulfillment
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const body = await req.json();
    const { fulfillmentStatus, courierName, trackingId } = body;
    const { orderId } = await params;

    if (!orderId || !fulfillmentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabase
      .from('orders')
      .update({
        fulfillment_status: fulfillmentStatus,
        courier_name: courierName || null,
        tracking_id: trackingId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating fulfillment:', error.message, error.details);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    console.error('Update fulfillment error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
