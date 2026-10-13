// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Public Products API
// GET /api/products
// Returns live active products directly from Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({ success: true, products: [] });
    }

    const supabase = createClient(url, anonKey);

    // 1. Try relational query first
    let rawProducts: any[] = [];
    const richRes = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .order('created_at', { ascending: false });

    if (!richRes.error && Array.isArray(richRes.data)) {
      rawProducts = richRes.data;
    } else {
      // 2. Fallback to flat select * for simpler schema (id, name, slug, description, price, image_url, category, stock, is_active)
      const flatRes = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (flatRes.error) {
        console.error('Error querying Supabase products:', flatRes.error);
        return NextResponse.json({ success: false, error: flatRes.error.message, products: [] });
      }
      rawProducts = flatRes.data || [];
    }

    // Filter out inactive or draft products
    const activeProducts = rawProducts.filter((p: any) => {
      if (p.is_active === false) return false;
      if (p.status === 'draft') return false;
      return true;
    });

    const products = activeProducts.map((p: any) => {
      // Handle prices (supports base_price or price)
      const basePrice = Number(p.base_price ?? p.price ?? 0);
      const salePrice = p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : null;

      // Handle images (supports product_images relation, image_url, og_image_url)
      let images = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        images = p.images.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      } else if (p.image_url) {
        images = [{ id: `img-${p.id}`, url: p.image_url, alt_text: p.name, sort_order: 0, is_video: false }];
      } else if (p.og_image_url) {
        images = [{ id: `img-${p.id}`, url: p.og_image_url, alt_text: p.name, sort_order: 0, is_video: false }];
      } else {
        images = [{ id: `img-${p.id}`, url: '/serum-bottle.jpeg', alt_text: p.name, sort_order: 0, is_video: false }];
      }

      // Handle variants & inventory (supports product_variants or stock column)
      let variants = [];
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        variants = p.variants.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      } else {
        variants = [{
          id: `v-${p.id}`,
          product_id: p.id,
          name: 'Standard',
          sku: p.sku || `SKU-${String(p.id).slice(0, 8)}`,
          price: salePrice || basePrice,
          sale_price: null,
          inventory: Number(p.stock ?? 50),
          is_active: p.is_active !== false,
          sort_order: 0,
        }];
      }

      // Handle category (supports categories object or text string)
      let categoryObj = null;
      if (p.category && typeof p.category === 'object' && p.category.name) {
        categoryObj = p.category;
      } else if (typeof p.category === 'string' && p.category.trim()) {
        const catName = p.category.trim();
        categoryObj = {
          id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}`,
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          image_url: '',
          sort_order: 0,
          is_active: true,
        };
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline || p.description || '',
        description: p.description || '',
        base_price: basePrice,
        sale_price: salePrice,
        rating_avg: Number(p.rating_avg || 5.0),
        rating_count: Number(p.rating_count || 0),
        status: p.status || (p.is_active === false ? 'draft' : 'active'),
        is_bestseller: Boolean(p.is_bestseller),
        skin_types: p.skin_types || ['all'],
        skin_concerns: p.skin_concerns || [],
        category: categoryObj,
        variants,
        images,
      };
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error('Public products API error:', err);
    return NextResponse.json({ success: false, error: err.message, products: [] });
  }
}
