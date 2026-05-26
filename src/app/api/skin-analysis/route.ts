import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Mock Profiles (in case GEMINI_API_KEY is not configured)
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using mock fallback analysis.');
      
      // Artificial delay to simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockProfiles = [
        {
          skinType: 'Combination',
          skinTypeDescription: 'Your skin exhibits characteristics of both oily and dry types. The T-zone (forehead, nose, and chin) shows active sebaceous glands with mild shine, while the cheeks and outer face are relatively dry or normal. This is typical for Indian weather.',
          concerns: [
            { name: 'Pigmentation', severityPercent: 65, details: 'Mild hyperpigmentation around the mouth and forehead, likely caused by UV exposure.' },
            { name: 'Pores', severityPercent: 48, details: 'Enlarged pores around the nose and T-zone areas.' },
            { name: 'Hydration', severityPercent: 35, details: 'Cheeks are slightly dehydrated and could benefit from lightweight moisture.' }
          ],
          routineExplanation: 'To balance your combination skin, we recommend a routine that controls oil in the T-zone while maintaining hydration on the cheeks. A clarifying toner followed by a radiance serum and a lightweight sunscreen is ideal.',
          recommendedProductSlugs: ['petal-soft-cleansing-foam', 'niacinamide-clarity-toner', 'radiance-revival-serum', 'rose-dew-spf40-sunscreen']
        },
        {
          skinType: 'Dry & Sensitive',
          skinTypeDescription: 'Your skin has a compromised moisture barrier, showing low sebum production and susceptibility to irritation. You have dry patches on the cheeks and slight flakiness around the nose. Sensitive reactions like mild redness are visible.',
          concerns: [
            { name: 'Hydration', severityPercent: 82, details: 'Significant moisture deficit with signs of tight skin and fine dry lines.' },
            { name: 'Sensitivity', severityPercent: 70, details: 'Slight redness and hyper-reactivity on the cheeks.' },
            { name: 'Dark Circles', severityPercent: 55, details: 'Puffiness and dark shadows under the eyes.' }
          ],
          routineExplanation: 'Your dry, sensitive skin requires barrier-repairing products that hydrate deeply without causing irritation. Avoid harsh scrubs and focus on soothing, rich moisturisers and specialized eye care.',
          recommendedProductSlugs: ['petal-soft-cleansing-foam', 'velvet-hydra-moisturiser', 'golden-hour-eye-cream', 'saffron-glow-face-mask']
        },
        {
          skinType: 'Oily & Acne-Prone',
          skinTypeDescription: 'Your skin shows overactive sebaceous glands with high sebum levels across the entire face. This oil buildup traps dead skin cells, leading to clogged pores, whiteheads, and occasional inflammatory acne lesions.',
          concerns: [
            { name: 'Acne', severityPercent: 75, details: 'Active breakouts and post-inflammatory acne marks (PIE) on the cheeks.' },
            { name: 'Pores', severityPercent: 80, details: 'Clogged and enlarged pores visible in the T-zone and cheeks.' },
            { name: 'Pigmentation', severityPercent: 40, details: 'Post-acne blemishes and uneven skin spots.' }
          ],
          routineExplanation: 'For oily and acne-prone skin, cleansing is key to removing excess sebum. Combine this with Niacinamide to regulate oil production and refine pores, and finish with a non-comedogenic sunscreen.',
          recommendedProductSlugs: ['petal-soft-cleansing-foam', 'niacinamide-clarity-toner', 'radiance-revival-serum', 'rose-dew-spf40-sunscreen']
        }
      ];

      // Return a random mock profile
      const randomIndex = Math.floor(Math.random() * mockProfiles.length);
      return NextResponse.json({ ...mockProfiles[randomIndex], isMock: true });
    }

    // ─── Real Gemini API Call ───
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Map base64 images to Gemini format
    const imageParts = images.map((base64Str: string) => {
      // Remove data:image/...;base64, prefix if present
      const cleanBase64 = base64Str.includes('base64,') 
        ? base64Str.split('base64,')[1] 
        : base64Str;
      
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      };
    });

    const promptText = `
You are a professional skincare expert AI. Analyze the face in these photos representing different angles of their face (e.g. Front, Forehead, Left Profile, Right Profile) and determine their overall skin type (one of: Dry, Oily, Combination, Normal, Sensitive) and their primary skin concerns (e.g. Acne, Pigmentation, Dark Circles, Hydration, Pores, or Sensitivity). Provide a rating from 0-100% for each concern.
Then recommend a tailored skincare routine and select suitable product slugs from our product catalog:
- 'radiance-revival-serum' (for pigmentation, brightening, uneven-tone)
- 'velvet-hydra-moisturiser' (for dry skin, hydration, sensitivity)
- 'petal-soft-cleansing-foam' (for oily/combination skin, acne, pores)
- 'golden-hour-eye-cream' (for dark circles, puffiness)
- 'saffron-glow-face-mask' (for dullness, brightening, weekly ritual)
- 'rose-dew-spf40-sunscreen' (daily protection for all/oily/combination skin)
- 'niacinamide-clarity-toner' (for oily skin, pores, acne)
- 'midnight-repair-night-cream' (for anti-aging, intensive dry skin recovery)

Your output must be strict JSON matching this structure:
{
  "skinType": "Combination | Oily | Dry | Sensitive | Normal",
  "skinTypeDescription": "Detailed analysis of the skin type and skin characteristics visible.",
  "concerns": [
    {
      "name": "Acne | Pigmentation | Pores | Hydration | Sensitivity | Dark Circles",
      "severityPercent": 65,
      "details": "Brief analysis of this specific concern."
    }
  ],
  "routineExplanation": "Brief explanation of how the recommended products address their skin issues.",
  "recommendedProductSlugs": ["slug-1", "slug-2"]
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            ...imageParts,
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const resData = await response.json();
    const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parsedData = JSON.parse(candidateText.trim());
    return NextResponse.json({ ...parsedData, isMock: false });

  } catch (error: any) {
    console.error('AI Skin Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
