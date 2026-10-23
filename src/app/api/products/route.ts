// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Public Products API
// GET /api/products
// Returns live active products directly from Shopify Storefront API
// with seamless fallback to Supabase / canonical catalog
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getShopifyProducts, getShopifyConfig } from '@/lib/shopify';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export const revalidate = 60;

export async function GET() {
  try {
    // 1. Try Shopify Storefront API if configured
    const { isConfigured } = getShopifyConfig();
    if (isConfigured) {
      try {
        const { products, isLiveShopify } = await getShopifyProducts();
        if (isLiveShopify && products.length > 0) {
          return NextResponse.json(
            {
              success: true,
              source: 'shopify',
              products,
            },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              },
            }
          );
        }
      } catch (shopifyErr: any) {
        console.warn('[API /api/products] Shopify query fallback:', shopifyErr.message);
      }
    }

    // 2. Try Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isSupabaseConfigured = Boolean(
      url &&
      anonKey &&
      !url.includes('your-project') &&
      url.startsWith('http')
    );

    if (isSupabaseConfigured && url && anonKey) {
      const supabase = createClient(url, anonKey);

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

      if (!richRes.error && Array.isArray(richRes.data) && richRes.data.length > 0) {
        rawProducts = richRes.data;
      } else {
        const flatRes = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!flatRes.error && Array.isArray(flatRes.data) && flatRes.data.length > 0) {
          rawProducts = flatRes.data;
        }
      }

      const activeProducts = rawProducts.filter((p: any) => {
        if (p.is_active === false) return false;
        if (p.status === 'draft') return false;
        return true;
      });

      if (activeProducts.length > 0) {
        const products = activeProducts.map((p: any) => {
          const basePrice = Number(p.base_price ?? p.price ?? 0);
          const salePrice = p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : null;

          let images = [];
          if (Array.isArray(p.images) && p.images.length > 0) {
            images = p.images.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          } else if (p.image_url) {
            images = [{ id: `img-${p.id}`, url: p.image_url, alt_text: p.name, sort_order: 0, is_video: false }];
          } else {
            images = [{ id: `img-${p.id}`, url: '/serum-bottle.jpeg', alt_text: p.name, sort_order: 0, is_video: false }];
          }

          let variants = [];
          if (Array.isArray(p.variants) && p.variants.length > 0) {
            variants = p.variants.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          } else {
            variants = [{
              id: `v-${p.id}`,
              product_id: p.id,
              name: 'Standard',
              sku: p.sku || `SKU-${String(p.id).slice(0, 8)}`,
              price: basePrice,
              sale_price: salePrice,
              inventory: Number(p.stock ?? 50),
              is_active: p.is_active !== false,
              sort_order: 0,
            }];
          }

          let categoryObj = null;
          if (p.category && typeof p.category === 'object' && p.category.name) {
            categoryObj = p.category;
          } else if (typeof p.category === 'string' && p.category.trim()) {
            categoryObj = {
              id: `cat-${p.category.toLowerCase().replace(/\s+/g, '-')}`,
              name: p.category.trim(),
              slug: p.category.toLowerCase().replace(/\s+/g, '-'),
              sort_order: 0,
              is_active: true,
            };
          }

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            tagline: p.tagline || '',
            description: p.description || '',
            ingredients: p.ingredients || '',
            how_to_use: Array.isArray(p.how_to_use) ? p.how_to_use : [],
            base_price: basePrice,
            sale_price: salePrice,
            rating_avg: Number(p.rating_avg ?? 4.8),
            rating_count: Number(p.rating_count ?? 45),
            is_bestseller: Boolean(p.is_bestseller),
            skin_types: Array.isArray(p.skin_types) ? p.skin_types : ['all'],
            skin_concerns: Array.isArray(p.skin_concerns) ? p.skin_concerns : [],
            images,
            variants,
            category: categoryObj,
          };
        });

        return NextResponse.json(
          { success: true, source: 'supabase', products },
          { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
        );
      }
    }

    // 3. Guaranteed canonical fallback
    return NextResponse.json(
      {
        success: true,
        source: 'canonical',
        products: DEMO_PRODUCTS,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    console.error('Failed to load products:', error);
    return NextResponse.json(
      {
        success: true,
        source: 'canonical-error-fallback',
        products: DEMO_PRODUCTS,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  }
}
