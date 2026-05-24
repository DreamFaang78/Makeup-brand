import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Phone or email is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user exists in customers table
    if (phone) {
      const { data: existingPhone, error: phoneError } = await supabase
        .from('customers')
        .select('id, full_name, segment')
        .eq('phone', `+91${phone}`)
        .single();

      if (existingPhone) {
        return NextResponse.json({
          exists: true,
          type: 'phone',
          user: existingPhone,
          message: 'User found',
        });
      }

      // Phone doesn't exist - this is a new customer
      if (phoneError?.code !== 'PGRST116') {
        // PGRST116 means "no rows returned" which is expected
        console.error('Phone check error:', phoneError);
      }
    }

    if (email) {
      const { data: existingEmail, error: emailError } = await supabase
        .from('customers')
        .select('id, full_name, segment')
        .eq('email', email)
        .single();

      if (existingEmail) {
        return NextResponse.json({
          exists: true,
          type: 'email',
          user: existingEmail,
          message: 'User found',
        });
      }

      if (emailError?.code !== 'PGRST116') {
        console.error('Email check error:', emailError);
      }
    }

    // User doesn't exist
    return NextResponse.json({
      exists: false,
      message: 'New user - please register',
    });
  } catch (error: any) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check user' },
      { status: 500 }
    );
  }
}
