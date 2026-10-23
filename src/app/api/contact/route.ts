// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Customer Support & Concierge Inquiry API
// Handles and validates customer contact, cancellation, and return requests
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { isValidIndianMobile } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, orderNumber, subject, message } = body;

    // 1. Full Name Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your full name (minimum 2 characters).', field: 'name' },
        { status: 400 }
      );
    }

    // 2. Email Address Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.', field: 'email' },
        { status: 400 }
      );
    }

    // 3. Compulsory Phone Number Validation (Indian Mobile Format)
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number is mandatory. Please provide a valid 10-digit Indian mobile number.',
          field: 'phone',
        },
        { status: 400 }
      );
    }

    if (!isValidIndianMobile(phone)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid mobile format. Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. +91 92351 70198 or 9876543210).',
          field: 'phone',
        },
        { status: 400 }
      );
    }

    // 4. Category Validation
    const validCategories = ['general', 'returns', 'cancellation', 'order', 'consultation', 'press'];
    const chosenCategory = validCategories.includes(subject) ? subject : 'general';

    // 5. Order ID Validation for Returns and Cancellations
    if ((chosenCategory === 'returns' || chosenCategory === 'cancellation') && (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim().length < 3)) {
      return NextResponse.json(
        {
          success: false,
          error: `Please provide your valid Order ID (e.g. LAN2610...) for ${chosenCategory === 'returns' ? 'return/replacement claims' : 'order cancellation requests'}.`,
          field: 'orderNumber',
        },
        { status: 400 }
      );
    }

    // 6. Message Validation
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please enter your message (minimum 5 characters).', field: 'message' },
        { status: 400 }
      );
    }

    // In a production environment with email credentials, send email via Resend or log to database
    console.log('[Contact Inquiry Submitted]:', {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      category: chosenCategory,
      orderNumber: orderNumber ? orderNumber.trim() : null,
      messagePreview: message.trim().slice(0, 100),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been successfully submitted to LANAN customer care.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while submitting your request. Please try again or reach out to support@lanan.in directly.',
      },
      { status: 500 }
    );
  }
}
