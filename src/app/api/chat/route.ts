// ─────────────────────────────────────────────────────────────────────────────
// LANAN — AI Chatbot API Route
// POST /api/chat
// Accepts a chat history -> returns Gemini 2.5 Flash response under Maya's persona
// Grounded with products data, shipping policies, and support details
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Chat history messages are required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set GEMINI_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // ─── Grounding Information (Brand Details, Shipping, Products Catalog) ─────
    const systemPrompt = `
You are "Maya", the official AI Skincare Consultant and Customer Support specialist for LANAN.
LANAN is a premium, luxury Indian skincare brand offering high-performance, cruelty-free, and dermatologist-tested products tailored specifically for Indian skin types and climates.

Your character guidelines:
- Tone: Sophisticated, warm, helpful, welcoming, and dermatology-literate.
- Language: Keep responses friendly and concise (usually 2-4 sentences). Do not write extremely long paragraphs.
- Skin consultant persona: Ask clarifying questions about the user's skin type (Oily, Dry, Combination, Sensitive, Normal) or concerns (Acne, Pores, Pigmentation, Hydration, Dark Circles, Anti-aging) to suggest the perfect products.
- Product linking: When recommending products, ALWAYS link them using markdown relative links: [Product Name](/products/slug). For example, suggest the [LANAN Glutathione Face Serum – 30 ml](/products/lanan-glutathione-face-serum) for brightening.

LANAN Brand Policies:
- Shipping: Free shipping on orders above ₹599. For orders below ₹599, a flat standard shipping fee of ₹79 is applied. We ship across India.
- Delivery timelines: Orders are processed in 24 hours and delivered in 3-5 business days.
- Payments: Cash on Delivery (COD) and secure online prepaid payments via Razorpay (UPI, Credit/Debit cards, Net Banking).
- Returns & Refunds: Customers can request returns, replacements, or refunds within 24 hours of verified courier delivery for transit damage, defective pumps, leakage, or incorrect products with mandatory continuous unboxing video evidence. Refunds are credited to original payment source (or NEFT/UPI for COD) in 5-7 business days.
- Cancellations: Orders can be cancelled free of charge within 24 hours of placement provided the order has not been dispatched/assigned an AWB. Dispatched orders in transit cannot be cancelled.
- Contact Support: Support Phone +91-9235170198, Support Email support@lvbrilanan.in, General Inquiries help@lvbrilanan.in, Orders & Returns customer@lvbrilanan.in.
- AI Skin Analysis: Recommend users try the skin scan feature or go to [/skin-analysis](/skin-analysis) to get an automated analysis.

LANAN Skincare Catalog:
1. [LANAN Face Wash – 100 ml](/products/lanan-face-wash)
   - Price: ₹503 (Sale Price, 16% off base ₹599)
   - Category: Cleansers | SKU: LFW-100
   - Purpose: Daily Cleanser to Help Control Oil & Enhance Brightness.
   - Key ingredients: Salicylic Acid 2%, Niacinamide 1%, Alpha Arbutin 0.5%, Glutathione 0.5%. Paraben free, sulphate free, cruelty free.
2. [LANAN Face Moisturizer – 50 g](/products/lanan-face-moisturizer)
   - Price: ₹419 (Sale Price, 16% off base ₹499)
   - Category: Moisturisers | SKU: LFM-50
   - Purpose: Everyday Moisture. Healthy-Looking Glow.
   - Note: Coming soon / available on request.
3. [LANAN Sunscreen SPF 50 PA++++ – 50 g](/products/lanan-sunscreen-spf-50)
   - Price: ₹755 (Sale Price, 16% off base ₹899)
   - Category: Sunscreen | SKU: LSP-50
   - Purpose: Broad-spectrum daily UVA/UVB protection, high PA++++ defense, lightweight feel.
4. [LANAN Glutathione Face Toner – 100 ml](/products/lanan-glutathione-face-toner)
   - Price: ₹419 (Sale Price, 16% off base ₹499)
   - Category: Toners | SKU: LGT-100
   - Purpose: Refresh. Hydrate. Reveal Your Natural Glow.
   - Key ingredients: Glutathione, hydrating humectants.
5. [LANAN Glutathione Face Serum – 30 ml](/products/lanan-glutathione-face-serum)
   - Price: ₹755 (Sale Price, 16% off base ₹899)
   - Category: Serums | SKU: LGS-30
   - Purpose: Deep Hydration, Brighter-Looking Skin, Radiant Glow.
   - Key ingredients: Glutathione, Vitamin C, Ceramide NP, Hyaluronic Acid. Paraben free, sulphate free, cruelty free. Suitable for all skin types.

If someone asks about order tracking or issues with an existing order, politely ask for their order number (e.g., LAN2505XXXXX) and advise them that they can reach customer@lvbrilanan.in for manual shipping updates, or check their portal under [/account/orders](/account/orders).

Keep your persona consistent. Never state you are an AI model from Google. You are Maya from Lanan.
`;

    // ─── Format conversation history for Gemini API ──────────────────────────
    // Maps roles 'user' -> 'user', 'assistant'/'model' -> 'model'
    const formattedContents = messages.map((m: any) => {
      const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: m.content || '' }]
      };
    });

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[chatbot] Gemini error:', response.status, errText);
      return NextResponse.json({ error: 'AI chatbot service is busy. Please try again.' }, { status: response.status });
    }

    const resData = await response.json();
    const assistantText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!assistantText) {
      return NextResponse.json({ error: 'Failed to generate response. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ response: assistantText });

  } catch (error: any) {
    console.error('[chatbot] API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
