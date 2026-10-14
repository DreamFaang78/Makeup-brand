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
    const { images, consentGiven } = body;

    // ─── Validate consent ─────────────────────────────────────────────────────
    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Explicit user consent is required for AI cosmetic skin analysis.' },
        { status: 400 }
      );
    }

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
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockProfiles = [
        {
          skinType: 'Combination',
          skinTypeDescription:
            'Your skin shows characteristics of both oily and dry types. The T-zone (forehead, nose, and chin) has active sebaceous glands with mild shine, while the cheeks remain relatively balanced. Common in Indian climate zones with humidity variation.',
          concerns: [
            { name: 'Pigmentation', severityPercent: 65, details: 'Mild hyperpigmentation around the forehead and mouth corners, likely caused by UV exposure and environmental stress.' },
            { name: 'Enlarged Pores', severityPercent: 48, details: 'Visible enlarged pores in the nose and T-zone region due to excess sebum accumulation.' },
            { name: 'Hydration', severityPercent: 35, details: 'Cheeks show slight dehydration signs that benefit from lightweight humectant layering.' },
          ],
          routineExplanation:
            'Your combination skin thrives on balanced clarity and hydration. Cleanse with LANAN Face Wash to control excess oil and clear pores without stripping. Follow with LANAN Glutathione Face Toner to rebalance and prep. Layer LANAN Glutathione Face Serum for brightening, and seal with LANAN Sunscreen SPF 50 PA++++ for broad-spectrum protection.',
          amRoutine: [
            'Step 1: Cleanse with LANAN Face Wash using lukewarm water',
            'Step 2: Mist or pat LANAN Glutathione Face Toner onto damp skin',
            'Step 3: Apply 3-4 drops of LANAN Glutathione Face Serum',
            'Step 4: Shield with two fingers of LANAN Sunscreen SPF 50 PA++++',
          ],
          pmRoutine: [
            'Step 1: Cleanse away pollution and SPF with LANAN Face Wash',
            'Step 2: Hydrate with LANAN Glutathione Face Toner',
            'Step 3: Nourish barrier overnight with LANAN Face Moisturizer',
          ],
          recommendedProductSlugs: [
            'lanan-face-wash',
            'lanan-glutathione-face-toner',
            'lanan-glutathione-face-serum',
            'lanan-sunscreen-spf-50',
          ],
          disclaimer:
            'Cosmetic Guidance Only: This assessment is an automated visual analysis intended for beauty and skincare education. It does not replace medical consultation with a dermatologist.',
        },
        {
          skinType: 'Dry & Sensitive',
          skinTypeDescription:
            'Your skin has a delicate moisture barrier that requires gentle care. The skin reacts sensitively to environmental triggers — typical for dry weather and indoor air-conditioned environments.',
          concerns: [
            { name: 'Hydration Deficit', severityPercent: 82, details: 'Significant moisture deficit with tight skin texture and early fine dehydration lines.' },
            { name: 'Sensitivity & Redness', severityPercent: 70, details: 'Mild sensitivity and reactive redness, suggesting a weakened barrier.' },
            { name: 'Dullness', severityPercent: 55, details: 'Lack of radiant glow due to moisture depletion.' },
          ],
          routineExplanation:
            'Your dry, sensitive skin needs gentle antioxidant care and high UV protection. Use LANAN Glutathione Face Toner to immediately infuse moisture. Apply LANAN Glutathione Face Serum with Hyaluronic Acid and Ceramide NP to replenish the barrier. Always shield with LANAN Sunscreen SPF 50 PA++++ against daily UV rays.',
          amRoutine: [
            'Step 1: Gentle splash or light cleanse with LANAN Face Wash',
            'Step 2: Pat 2 layers of LANAN Glutathione Face Toner',
            'Step 3: Apply LANAN Glutathione Face Serum on damp skin',
            'Step 4: Broad-spectrum defense with LANAN Sunscreen SPF 50 PA++++',
          ],
          pmRoutine: [
            'Step 1: Gentle cleanse with LANAN Face Wash',
            'Step 2: Deep hydration with LANAN Glutathione Face Toner',
            'Step 3: Barrier sealing with LANAN Face Moisturizer',
          ],
          recommendedProductSlugs: [
            'lanan-glutathione-face-toner',
            'lanan-glutathione-face-serum',
            'lanan-sunscreen-spf-50',
          ],
          disclaimer:
            'Cosmetic Guidance Only: This assessment is an automated visual analysis intended for beauty and skincare education. It does not replace medical consultation with a dermatologist.',
        },
        {
          skinType: 'Oily & Acne-Prone',
          skinTypeDescription:
            'Your skin has active sebaceous glands producing excess sebum across the T-zone and cheeks. This excess oil can trap dead skin cells and impurities, leading to congestion and occasional breakouts.',
          concerns: [
            { name: 'Excess Sebum', severityPercent: 75, details: 'Visible shine and excess oiliness across the forehead, nose, and chin.' },
            { name: 'Enlarged Pores', severityPercent: 80, details: 'Congested and noticeable pores throughout the T-zone.' },
            { name: 'Blemishes', severityPercent: 45, details: 'Uneven skin texture and post-blemish spots.' },
          ],
          routineExplanation:
            'Your oily, breakout-prone skin benefits from active clarifying ingredients. Cleanse twice daily with LANAN Face Wash formulated with 2% Salicylic Acid and 1% Niacinamide to clarify pores. Refine with LANAN Glutathione Face Toner, and protect daily with lightweight LANAN Sunscreen SPF 50 PA++++.',
          amRoutine: [
            'Step 1: Deep pore cleanse with LANAN Face Wash (Salicylic Acid 2%)',
            'Step 2: Clarify and minimize pores with LANAN Glutathione Face Toner',
            'Step 3: Lightweight non-comedogenic protection with LANAN Sunscreen SPF 50',
          ],
          pmRoutine: [
            'Step 1: Thorough evening cleanse with LANAN Face Wash',
            'Step 2: Gentle balancing with LANAN Glutathione Face Toner',
            'Step 3: Lightweight hydration with LANAN Face Moisturizer',
          ],
          recommendedProductSlugs: [
            'lanan-face-wash',
            'lanan-glutathione-face-toner',
            'lanan-sunscreen-spf-50',
          ],
          disclaimer:
            'Cosmetic Guidance Only: This assessment is an automated visual analysis intended for beauty and skincare education. It does not replace medical consultation with a dermatologist.',
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
   - 'lanan-face-wash' → targets: oily/combination/acne-prone skin, deep pore cleanse, sebum control
   - 'lanan-glutathione-face-toner' → targets: refreshing, hydrating, evening tone, prep
   - 'lanan-glutathione-face-serum' → targets: brightening, deep hydration, radiant glow, dullness
   - 'lanan-sunscreen-spf-50' → targets: daily UV protection, all skin types, broad-spectrum SPF 50 PA++++


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
        },
        amRoutine: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Step-by-step AM skincare routine steps"
        },
        pmRoutine: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Step-by-step PM skincare routine steps"
        },
        disclaimer: {
          type: "STRING",
          description: "Clear cosmetic guidance disclaimer statement"
        }
      },
      required: ["skinType", "skinTypeDescription", "concerns", "routineExplanation", "recommendedProductSlugs", "amRoutine", "pmRoutine", "disclaimer"]
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
