// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Public Products API
// GET /api/products
// Returns active products from Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({ success: true, products: DEMO_PRODUCTS });
    }

    const supabase = createClient(url, anonKey);

    const { data: rawProducts, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error || !rawProducts || rawProducts.length === 0) {
      return NextResponse.json({ success: true, products: DEMO_PRODUCTS });
    }

    const products = rawProducts.map((p: any) => {
      const sortedVariants = (p.variants || []).sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      const sortedImages = (p.images || []).sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline || '',
        description: p.description || '',
        base_price: Number(p.base_price),
        sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
        rating_avg: Number(p.rating_avg || 5.0),
        rating_count: Number(p.rating_count || 0),
        status: p.status || 'active',
        is_bestseller: Boolean(p.is_bestseller),
        skin_types: p.skin_types || ['all'],
        skin_concerns: p.skin_concerns || [],
        category: p.category || null,
        variants: sortedVariants.length > 0 ? sortedVariants : [
          {
            id: `v-${p.id}`,
            product_id: p.id,
            name: 'Standard',
            sku: p.sku || 'N/A',
            price: Number(p.sale_price || p.base_price),
            sale_price: null,
            inventory: 50,
            is_active: true,
            sort_order: 0,
          }
        ],
        images: sortedImages.length > 0 ? sortedImages : [
          {
            id: `img-${p.id}`,
            product_id: p.id,
            url: p.og_image_url || '/Serum Bottle.jpeg',
            alt_text: p.name,
            sort_order: 0,
            is_video: false,
          }
        ],
      };
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error('Public products API error:', err);
    return NextResponse.json({ success: true, products: DEMO_PRODUCTS });
  }
}
