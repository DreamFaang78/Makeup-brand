// ─────────────────────────────────────────────────────────────────────────────
// LANAN — AI Skin Analysis API Route
// POST /api/skin-analysis
// Accepts up to 4 base64 images → calls Gemini 2.5 Flash → returns JSON report
// Falls back to rich mock profiles if GEMINI_API_KEY is not set
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest, NextResponse } from 'next/server';

// Runtime config — 60s max for Gemini vision call
export const maxDuration = 60;

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per image (base64 ~ 4/3 raw size)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body;

    // ─── Validate input ───────────────────────────────────────────────────────
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 });
    }
    if (images.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed.` }, { status: 400 });
    }
    for (const img of images) {
      if (typeof img !== 'string') {
        return NextResponse.json({ error: 'All images must be base64 strings.' }, { status: 400 });
      }
      if (img.length > MAX_IMAGE_BYTES * 1.4) {
        return NextResponse.json({ error: 'One or more images exceed 8 MB. Please reduce image size.' }, { status: 400 });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // ─── Mock fallback (no API key) ───────────────────────────────────────────
    if (!apiKey) {
      console.warn('[skin-analysis] GEMINI_API_KEY not set — returning mock profile.');
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockProfiles = [
        {
          skinType: 'Combination',
          skinTypeDescription:
            'Your skin shows characteristics of both oily and dry types. The T-zone (forehead, nose, and chin) has active sebaceous glands with mild shine, while the cheeks remain relatively balanced. Common in Indian climate zones with humidity variation.',
          concerns: [
            { name: 'Pigmentation', severityPercent: 65, details: 'Mild hyperpigmentation around the forehead and mouth corners, likely caused by UV exposure and hormonal activity.' },
            { name: 'Enlarged Pores', severityPercent: 48, details: 'Visible enlarged pores in the nose and T-zone region due to excess sebum accumulation.' },
            { name: 'Hydration', severityPercent: 35, details: 'Cheeks show slight dehydration signs. A lightweight, non-comedogenic moisturiser will help.' },
          ],
          routineExplanation:
            'Your combination skin needs a balance-focused routine. Start with the Petal Soft Cleansing Foam to clear excess oil without stripping moisture. Follow with Niacinamide Clarity Toner to regulate sebum and refine pores. Apply Radiance Revival Serum to fade pigmentation, and lock in moisture with the Rose Dew SPF 40 to protect against UV-induced darkening.',
          recommendedProductSlugs: [
            'petal-soft-cleansing-foam',
            'niacinamide-clarity-toner',
            'radiance-revival-serum',
            'rose-dew-spf40-sunscreen',
          ],
        },
        {
          skinType: 'Dry & Sensitive',
          skinTypeDescription:
            'Your skin has a compromised moisture barrier with low sebum production. Visible dry patches appear on the cheeks, and there is mild flakiness around the nose. The skin reacts sensitively to environmental triggers — typical for dry Indian winters and air-conditioned environments.',
          concerns: [
            { name: 'Hydration Deficit', severityPercent: 82, details: 'Significant moisture deficit with tight skin texture and early fine lines around eyes.' },
            { name: 'Sensitivity & Redness', severityPercent: 70, details: 'Mild redness and hyper-reactivity visible on both cheeks, suggesting a weakened skin barrier.' },
            { name: 'Dark Circles', severityPercent: 55, details: 'Hollow puffiness and dark shadows under the eyes, common in dehydrated skin types.' },
          ],
          routineExplanation:
            'Your dry, sensitive skin needs barrier-repairing care above all else. Use the Petal Soft Foam for a gentle, non-stripping cleanse. Apply the Velvet Hydra Moisturiser twice daily to deeply replenish moisture. The Golden Hour Eye Cream tackles dark circles and puffiness. Use the Saffron Glow Mask weekly to brighten and soothe inflamed areas.',
          recommendedProductSlugs: [
            'petal-soft-cleansing-foam',
            'velvet-hydra-moisturiser',
            'golden-hour-eye-cream',
            'saffron-glow-face-mask',
          ],
        },
        {
          skinType: 'Oily & Acne-Prone',
          skinTypeDescription:
            'Your skin has overactive sebaceous glands producing high sebum levels across the full face. This excess oil traps dead skin cells and bacteria, leading to clogged pores, blackheads, and occasional inflammatory acne lesions. Very common in humid Indian climates.',
          concerns: [
            { name: 'Active Acne', severityPercent: 75, details: 'Active breakouts and post-inflammatory hyperpigmentation marks visible on both cheeks and chin.' },
            { name: 'Enlarged Pores', severityPercent: 80, details: 'Heavily clogged and stretched pores throughout the T-zone and cheek area.' },
            { name: 'Pigmentation', severityPercent: 40, details: 'Post-acne blemishes and uneven skin tone in areas of past breakouts.' },
          ],
          routineExplanation:
            'Your oily, acne-prone skin needs a disciplined, oil-control routine. Cleanse twice daily with the Petal Soft Foam to remove sebum and bacteria without over-drying. Apply Niacinamide Clarity Toner to regulate oil and tighten pores. Add the Radiance Revival Serum to fade acne marks. Always seal with Rose Dew SPF 40 — sun protection prevents further darkening of blemishes.',
          recommendedProductSlugs: [
            'petal-soft-cleansing-foam',
            'niacinamide-clarity-toner',
            'radiance-revival-serum',
            'rose-dew-spf40-sunscreen',
          ],
        },
        {
          skinType: 'Normal',
          skinTypeDescription:
            'Your skin is well-balanced with an even distribution of sebum and good hydration. Minimal visible concerns — no significant oiliness or dryness — with a smooth texture and even tone. A small amount of environmental stress (UV, dust) is present but manageable.',
          concerns: [
            { name: 'UV Damage', severityPercent: 30, details: 'Slight tan and early pigmentation on the forehead from daily sun exposure.' },
            { name: 'Hydration', severityPercent: 22, details: 'Skin is well-hydrated but could maintain it better with a daily moisturiser.' },
            { name: 'Dullness', severityPercent: 28, details: 'Mild lack of radiance that a brightening serum can easily correct.' },
          ],
          routineExplanation:
            'Your balanced skin just needs a maintenance routine to stay healthy. A gentle foam cleanser in the morning, the Radiance Revival Serum for a luminous boost, and the Rose Dew SPF 40 for daily UV protection. Add the Saffron Glow Mask once a week for a brightening ritual.',
          recommendedProductSlugs: [
            'radiance-revival-serum',
            'rose-dew-spf40-sunscreen',
            'saffron-glow-face-mask',
            'velvet-hydra-moisturiser',
          ],
        },
      ];
      const profile = mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
      return NextResponse.json({ ...profile, isMock: true });
    }

    // ─── Real Gemini 2.5 Flash API call ──────────────────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Strip data URI prefix and detect MIME type
    const imageParts = images.map((base64Str: string) => {
      let mimeType = 'image/jpeg';
      let cleanBase64 = base64Str;
      if (base64Str.includes('base64,')) {
        const prefix = base64Str.split('base64,')[0];
        if (prefix.includes('image/png')) mimeType = 'image/png';
        else if (prefix.includes('image/webp')) mimeType = 'image/webp';
        else if (prefix.includes('image/heic')) mimeType = 'image/heic';
        cleanBase64 = base64Str.split('base64,')[1];
      }
      return { inlineData: { mimeType, data: cleanBase64 } };
    });

    const promptText = `
You are an expert dermatologist AI specializing in custom Indian skin analysis.
You are given ${images.length} close-up photos of a user's face (Front, Forehead, Left Cheek, Right Cheek).

Analyze the photos with high precision. Avoid generic statements. Focus on:
- Specific visual cues: look for shine, localized oiliness, dry flakes, redness, blemishes, acne spots, pigmentation spots, uneven skin tone, or dark circles under the eyes.
- The user's specific skin shade, tone variations, and visible details in the forehead, cheeks, and nose zones.

Determine:
1. Overall skin type (exactly one of: Dry, Oily, Combination, Normal, Sensitive, Dry & Sensitive, Oily & Acne-Prone)
2. Top 3 skin concerns with 0-100% severity scores based directly on visible indicators.
3. A personalized skincare routine explanation tailored to these findings.
4. 3-4 recommended product slugs from this catalog ONLY:
   - 'radiance-revival-serum' → targets: pigmentation, brightening, uneven tone, dullness
   - 'velvet-hydra-moisturiser' → targets: dry skin, hydration, sensitivity, barrier repair
   - 'petal-soft-cleansing-foam' → targets: oily/combination/acne skin, deep cleanse
   - 'golden-hour-eye-cream' → targets: dark circles, puffiness, eye area concerns
   - 'saffron-glow-face-mask' → targets: brightening, dullness, weekly ritual, all skin types
   - 'rose-dew-spf40-sunscreen' → targets: daily UV protection, all skin types
   - 'niacinamide-clarity-toner' → targets: oily skin, enlarged pores, acne, sebum control
   - 'midnight-repair-night-cream' → targets: anti-aging, intensive dry skin, overnight repair

Instructions for descriptions:
- 'skinTypeDescription': Write 3 detailed sentences explaining the specific visual indicators observed in the photos that led to this skin type classification (e.g. "I notice mild shine and active pores around the nose and T-zone in the forehead photo, while the cheek photos show balanced skin...").
- 'details' for concerns: Write 2 sentences detailing the exact locations and appearance of the concern in the uploaded photos (e.g. "Mild hyperpigmentation is visible as darker patches on the upper cheekbones and forehead", or "A few active inflammatory red spots are present on the left jawline area").
- 'routineExplanation': Explain in 3 detailed sentences exactly how the recommended products will treat these observed skin features.

Respond with ONLY valid JSON matching the specified schema. Do not use unescaped double quotes inside description string values.
`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        skinType: {
          type: "STRING",
          description: "Exactly one of: Dry, Oily, Combination, Normal, Sensitive, Dry & Sensitive, Oily & Acne-Prone"
        },
        skinTypeDescription: {
          type: "STRING",
          description: "2-3 sentence detailed skin analysis"
        },
        concerns: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              severityPercent: { type: "INTEGER" },
              details: { type: "STRING" }
            },
            required: ["name", "severityPercent", "details"]
          }
        },
        routineExplanation: {
          type: "STRING",
          description: "2-3 sentences explaining the recommended routine"
        },
        recommendedProductSlugs: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["skinType", "skinTypeDescription", "concerns", "routineExplanation", "recommendedProductSlugs"]
    };

    const requestBody = {
      contents: [{ parts: [{ text: promptText }, ...imageParts] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      ],
    };

    // 55-second timeout (within the 60s maxDuration)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    let response: Response;
    try {
      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[skin-analysis] Gemini error:', response.status, errText);
      if (response.status === 429) {
        return NextResponse.json({ error: 'AI service is busy. Please try again in 30 seconds.' }, { status: 429 });
      }
      throw new Error(`Gemini API returned ${response.status}.`);
    }

    const resData = await response.json();
    const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    // Parse JSON — handle cases where Gemini wraps in markdown fences
    const jsonText = candidateText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(jsonText);

    // Validate required fields
    if (!parsedData.skinType || !parsedData.concerns || !parsedData.recommendedProductSlugs) {
      throw new Error('AI response was incomplete. Please try again.');
    }

    return NextResponse.json({ ...parsedData, isMock: false });

  } catch (error: any) {
    console.error('[skin-analysis] Error:', error.message);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Analysis timed out. Please try again — this sometimes happens on the first request.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
