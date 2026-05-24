// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin: Get All Customers
// GET /api/admin/customers
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

    // Fetch all customers with admin access (bypasses RLS)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error.message, error.details);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, customers: data || [] });
  } catch (err: any) {
    console.error('Admin customers route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
