import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  try {
    const { id, phone, email, full_name } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Securely upsert the user record into public.customers bypassing client RLS
    const { data, error } = await supabase
      .from('customers')
      .upsert(
        {
          id,
          phone: phone || null,
          email: email || null,
          full_name: full_name || 'Lanan Customer',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Database write error syncing user:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (err: any) {
    console.error('Unexpected error in sync-user route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
