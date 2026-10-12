// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin: Products API (CRUD)
// GET, POST, PUT, DELETE /api/admin/products
// Uses Supabase Service Role to bypass RLS policies
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/data/products';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration in environment variables');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function getDeterministicUUID(id: string, block: string): string {
  const hash = crypto.createHash('md5').update(`${block}:${id}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// GET: Fetch all products with categories, variants, and images
export async function GET() {
  try {
    const supabase = getAdminClient();

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
      // 2. Fallback to flat select *
      const flatRes = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (flatRes.error) {
        console.error('Error fetching admin products:', flatRes.error);
        return NextResponse.json({ success: false, error: flatRes.error.message }, { status: 500 });
      }
      rawProducts = flatRes.data || [];
    }

    // Format products to match ProductCardData
    const products = (rawProducts || []).map((p: any) => {
      const basePrice = Number(p.base_price ?? p.price ?? 0);
      const salePrice = p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : null;

      // Images
      let images = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        images = p.images.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      } else if (p.image_url) {
        images = [{ id: `img-${p.id}`, url: p.image_url, alt_text: p.name, sort_order: 0, is_video: false }];
      } else if (p.og_image_url) {
        images = [{ id: `img-${p.id}`, url: p.og_image_url, alt_text: p.name, sort_order: 0, is_video: false }];
      } else {
        images = [{ id: `img-${p.id}`, url: '/Serum Bottle.jpeg', alt_text: p.name, sort_order: 0, is_video: false }];
      }

      // Variants
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
          is_active: p.is_active !== false && p.status !== 'draft',
          sort_order: 0,
        }];
      }

      // Category
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
    console.error('Admin products GET route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a product by ID (handles both relational and flat schemas)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getAdminClient();

    // ID can be passed in query param (?id=...) or JSON body
    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Validate UUID format to prevent PostgreSQL 'invalid input syntax for type uuid'
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      console.log(`[Admin Products] Product ID "${id}" is not a UUID (client-side demo item). Successfully ignored in DB.`);
      return NextResponse.json({
        success: true,
        message: `Product ${id} removed successfully`,
      });
    }

    console.log(`[Admin Products] Deleting product with ID: ${id}`);

    // Helper for safe table cleanup that ignores missing tables or constraint errors
    const safeDelete = async (table: string, matchCol: string, val: string) => {
      try {
        await supabase.from(table).delete().eq(matchCol, val);
      } catch {
        // ignore missing table or constraint
      }
    };

    // Clean up dependent foreign-key records across both flat and relational schemas
    await safeDelete('order_items', 'product_id', id);
    await safeDelete('inventory_logs', 'product_id', id);
    await safeDelete('cart_items', 'product_id', id);
    await safeDelete('wishlist', 'product_id', id);
    await safeDelete('reviews', 'product_id', id);
    await safeDelete('product_variants', 'product_id', id);
    await safeDelete('product_images', 'product_id', id);

    // Delete the product itself
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Admin Products] Error deleting product:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    console.log(`[Admin Products] Successfully deleted product ID: ${id}`);
    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully from Supabase`,
    });
  } catch (err: any) {
    console.error('Admin products DELETE route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create a new product OR seed demo products (Dual-Schema Compatible)
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    // Check if this is an explicit seed request
    if (body.action === 'seed') {
      console.log('[Admin Products] Seeding demo products to Supabase...');

      // Attempt 1: Relational Seed
      try {
        const allCategoriesMap = new Map();
        DEMO_CATEGORIES.forEach(c => allCategoriesMap.set(c.slug, c));
        DEMO_PRODUCTS.forEach(p => {
          if (p.category && !allCategoriesMap.has(p.category.slug)) {
            allCategoriesMap.set(p.category.slug, p.category);
          }
        });

        const categoriesToInsert = Array.from(allCategoriesMap.values()).map(cat => ({
          id: getDeterministicUUID(cat.id || cat.slug, 'cat'),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          image_url: cat.image_url || '',
          sort_order: cat.sort_order || 0,
          is_active: cat.is_active ?? true,
        }));

        await supabase.from('categories').upsert(categoriesToInsert, { onConflict: 'slug' });
        const { data: dbCategories } = await supabase.from('categories').select('id, slug');
        const catSlugToId = new Map(dbCategories?.map(c => [c.slug, c.id]) || []);

        const productsToInsert = DEMO_PRODUCTS.map(prod => ({
          id: getDeterministicUUID(prod.id, 'prod'),
          name: prod.name,
          slug: prod.slug,
          tagline: prod.tagline,
          description: prod.tagline,
          category_id: prod.category ? catSlugToId.get(prod.category.slug) || null : null,
          skin_types: prod.skin_types,
          skin_concerns: prod.skin_concerns,
          base_price: prod.base_price,
          sale_price: prod.sale_price,
          status: 'active',
          is_featured: prod.is_bestseller,
          is_bestseller: prod.is_bestseller,
          rating_avg: prod.rating_avg,
          rating_count: prod.rating_count,
          og_image_url: prod.images[0]?.url || '/Serum Bottle.jpeg',
        }));

        const { error: pErr } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'slug' });
        if (pErr) throw pErr;

        const variantsToInsert = DEMO_PRODUCTS.flatMap(prod =>
          prod.variants.map((v, idx) => ({
            id: getDeterministicUUID(v.id || `${prod.id}-var-${idx}`, 'var'),
            product_id: getDeterministicUUID(prod.id, 'prod'),
            name: v.name,
            sku: v.sku,
            price: v.price,
            sale_price: v.sale_price,
            inventory: v.inventory,
            is_active: v.is_active ?? true,
            sort_order: v.sort_order || idx,
          }))
        );
        await supabase.from('product_variants').upsert(variantsToInsert, { onConflict: 'sku' });

        const imagesToInsert = DEMO_PRODUCTS.flatMap(prod =>
          prod.images.map((img, index) => ({
            id: getDeterministicUUID(img.id || `${prod.id}-img-${index}`, 'img'),
            product_id: getDeterministicUUID(prod.id, 'prod'),
            url: img.url,
            alt_text: img.alt_text,
            sort_order: img.sort_order || index,
            is_video: img.is_video || false,
          }))
        );
        await supabase.from('product_images').upsert(imagesToInsert, { onConflict: 'id' });

        return NextResponse.json({
          success: true,
          message: 'Successfully seeded starter products (Relational schema)!',
        });
      } catch (relSeedErr: any) {
        console.warn('[Admin Products] Relational seed failed, attempting flat schema seed fallback:', relSeedErr?.message);

        // Attempt 2: Flat Schema Seed
        const flatProducts = DEMO_PRODUCTS.map(prod => ({
          id: getDeterministicUUID(prod.id, 'prod'),
          name: prod.name,
          slug: prod.slug,
          description: prod.tagline || prod.name,
          price: prod.sale_price || prod.base_price,
          image_url: prod.images[0]?.url || '/Serum Bottle.jpeg',
          category: prod.category?.name || 'Skincare',
          stock: prod.variants[0]?.inventory || 50,
          is_active: true,
        }));

        const { error: flatSeedErr } = await supabase
          .from('products')
          .upsert(flatProducts, { onConflict: 'slug' });

        if (flatSeedErr) {
          throw new Error(`Seed failed: ${flatSeedErr.message}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully seeded starter products (Flat schema)!',
        });
      }
    }

    const {
      name,
      tagline,
      categoryName,
      base_price,
      sale_price,
      inventory,
      sku,
      image_url,
    } = body;

    if (!name || base_price === undefined) {
      return NextResponse.json({ success: false, error: 'Name and Base Price are required' }, { status: 400 });
    }

    const productId = generateUUID();
    const slug = (body.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) + '-' + Math.floor(1000 + Math.random() * 9000);
    const basePriceNum = parseFloat(base_price) || 0;
    const salePriceNum = sale_price ? parseFloat(sale_price) : null;
    const invNum = parseInt(inventory, 10) || 50;
    const effectivePrice = salePriceNum || basePriceNum;

    // Normalizing photos
    const imagesToProcess: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : [image_url || '/Serum Bottle.jpeg'];

    // Resolve or find Category ID (for relational schema)
    let categoryId: string | null = null;
    if (categoryName) {
      try {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', categoryName)
          .limit(1)
          .single();

        if (existingCat?.id) {
          categoryId = existingCat.id;
        } else {
          const catSlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const { data: newCat } = await supabase
            .from('categories')
            .insert({
              name: categoryName,
              slug: catSlug,
              description: `${categoryName} skincare collection`,
              is_active: true,
            })
            .select('id')
            .single();
          if (newCat) categoryId = newCat.id;
        }
      } catch {
        // category table might not exist in flat schema
      }
    }

    // Attempt 1: Insert into Relational Products Schema
    const { data: relProd, error: relProdErr } = await supabase
      .from('products')
      .insert({
        id: productId,
        name,
        slug,
        tagline: tagline || '',
        description: tagline || name,
        category_id: categoryId,
        base_price: basePriceNum,
        sale_price: salePriceNum,
        status: 'active',
        is_bestseller: false,
        rating_avg: 5.0,
        rating_count: 1,
        skin_types: ['all'],
        skin_concerns: ['brightening'],
        og_image_url: imagesToProcess[0] || null,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (!relProdErr && relProd) {
      // Insert Variant into relational table
      const variantId = generateUUID();
      const finalSku = sku || `LAN-${slug.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const { data: newVar } = await supabase
        .from('product_variants')
        .insert({
          id: variantId,
          product_id: productId,
          name: 'Standard',
          sku: finalSku,
          price: effectivePrice,
          sale_price: null,
          inventory: invNum,
          is_active: true,
          sort_order: 0,
        })
        .select()
        .single();

      // Insert Images into relational table
      const newImages = [];
      for (let i = 0; i < imagesToProcess.length; i++) {
        const imgUrl = imagesToProcess[i];
        const imgId = generateUUID();
        const { data: newImg } = await supabase
          .from('product_images')
          .insert({
            id: imgId,
            product_id: productId,
            url: imgUrl,
            alt_text: `${name} photo ${i + 1}`,
            sort_order: i,
            is_video: false,
          })
          .select()
          .single();
        if (newImg) newImages.push(newImg);
      }

      const formattedProduct = {
        ...relProd,
        og_image_url: imagesToProcess[0] || null,
        variants: newVar ? [newVar] : [],
        images: newImages,
      };

      return NextResponse.json({ success: true, product: formattedProduct });
    }

    // Attempt 2: Fallback to Flat Products Schema
    console.log('[Admin Products] Relational insert failed, inserting into flat products table:', relProdErr?.message);
    const flatPayload = {
      id: productId,
      name,
      slug,
      description: tagline || name,
      price: effectivePrice,
      image_url: imagesToProcess[0] || '/Serum Bottle.jpeg',
      category: categoryName || 'Skincare',
      stock: invNum,
      is_active: true,
    };

    const { data: flatProd, error: flatProdErr } = await supabase
      .from('products')
      .insert(flatPayload)
      .select('*')
      .single();

    if (flatProdErr) {
      console.error('[Admin Products] Error creating product (both schemas failed):', flatProdErr);
      return NextResponse.json({ success: false, error: flatProdErr.message }, { status: 500 });
    }

    // Standardized product return format
    const formattedFlatProduct = {
      id: flatProd.id,
      name: flatProd.name,
      slug: flatProd.slug,
      tagline: flatProd.description || '',
      description: flatProd.description || '',
      base_price: Number(flatProd.price || 0),
      sale_price: null,
      rating_avg: 5.0,
      rating_count: 0,
      status: flatProd.is_active !== false ? 'active' : 'draft',
      is_bestseller: false,
      skin_types: ['all'],
      skin_concerns: [],
      category: flatProd.category ? {
        id: `cat-${flatProd.category.toLowerCase().replace(/\s+/g, '-')}`,
        name: flatProd.category,
        slug: flatProd.category.toLowerCase().replace(/\s+/g, '-'),
        is_active: true,
      } : null,
      variants: [{
        id: `v-${flatProd.id}`,
        product_id: flatProd.id,
        name: 'Standard',
        sku: sku || `SKU-${flatProd.id.slice(0, 8)}`,
        price: Number(flatProd.price || 0),
        sale_price: null,
        inventory: Number(flatProd.stock ?? 50),
        is_active: flatProd.is_active !== false,
        sort_order: 0,
      }],
      images: imagesToProcess.map((url, idx) => ({
        id: `img-${flatProd.id}-${idx}`,
        url,
        alt_text: `${flatProd.name} photo ${idx + 1}`,
        sort_order: idx,
        is_video: false,
      })),
    };

    return NextResponse.json({ success: true, product: formattedFlatProduct });
  } catch (err: any) {
    console.error('Admin products POST route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT / PATCH: Update product (Dual-Schema Compatible)
export async function PUT(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    const {
      id,
      name,
      tagline,
      categoryName,
      base_price,
      sale_price,
      inventory,
      sku,
      image_url,
      images,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // If ID is not a UUID (client-side demo item), return success
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      return NextResponse.json({ success: true, message: 'Demo product updated locally' });
    }

    // Determine primary images
    const imagesArray: string[] | null = Array.isArray(images) && images.length > 0
      ? images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : (image_url ? [image_url] : null);

    // Attempt 1: Relational Schema Update
    const relUpdates: any = {};
    if (name !== undefined) relUpdates.name = name;
    if (tagline !== undefined) {
      relUpdates.tagline = tagline;
      relUpdates.description = tagline;
    }
    if (base_price !== undefined) relUpdates.base_price = parseFloat(base_price);
    if (sale_price !== undefined) relUpdates.sale_price = sale_price ? parseFloat(sale_price) : null;
    if (is_active !== undefined) relUpdates.status = is_active ? 'active' : 'draft';
    if (imagesArray && imagesArray[0]) relUpdates.og_image_url = imagesArray[0];

    // Check category id if relational
    if (categoryName) {
      try {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', categoryName)
          .limit(1)
          .single();
        if (existingCat?.id) {
          relUpdates.category_id = existingCat.id;
        }
      } catch {
        // category table might not exist
      }
    }

    let isRelationalSuccess = false;
    if (Object.keys(relUpdates).length > 0) {
      const { error: relUpdateErr } = await supabase
        .from('products')
        .update(relUpdates)
        .eq('id', id);

      if (!relUpdateErr) {
        isRelationalSuccess = true;
      }
    }

    // If relational update failed or didn't run, execute Flat Schema Update
    if (!isRelationalSuccess) {
      const flatUpdates: any = {};
      if (name !== undefined) flatUpdates.name = name;
      if (tagline !== undefined) flatUpdates.description = tagline;
      if (sale_price !== undefined || base_price !== undefined) {
        flatUpdates.price = parseFloat(sale_price || base_price);
      }
      if (categoryName !== undefined) flatUpdates.category = categoryName;
      if (inventory !== undefined) flatUpdates.stock = parseInt(inventory, 10);
      if (is_active !== undefined) flatUpdates.is_active = Boolean(is_active);
      if (imagesArray && imagesArray[0]) flatUpdates.image_url = imagesArray[0];

      if (Object.keys(flatUpdates).length > 0) {
        const { error: flatUpdateErr } = await supabase
          .from('products')
          .update(flatUpdates)
          .eq('id', id);

        if (flatUpdateErr) {
          return NextResponse.json({ success: false, error: flatUpdateErr.message }, { status: 500 });
        }
      }
    }

    // If relational schema is in place, safely update variant and images tables
    if (isRelationalSuccess) {
      try {
        const variantUpdates: any = {};
        if (inventory !== undefined) variantUpdates.inventory = parseInt(inventory, 10);
        if (sku !== undefined) variantUpdates.sku = sku;
        if (is_active !== undefined) variantUpdates.is_active = is_active;
        if (sale_price !== undefined || base_price !== undefined) {
          variantUpdates.price = (sale_price ? parseFloat(sale_price) : null) || (base_price ? parseFloat(base_price) : undefined);
        }

        if (Object.keys(variantUpdates).length > 0) {
          await supabase
            .from('product_variants')
            .update(variantUpdates)
            .eq('product_id', id);
        }

        if (imagesArray) {
          await supabase.from('product_images').delete().eq('product_id', id);
          for (let i = 0; i < imagesArray.length; i++) {
            await supabase.from('product_images').insert({
              id: generateUUID(),
              product_id: id,
              url: imagesArray[i],
              alt_text: `${name || 'Product'} image ${i + 1}`,
              sort_order: i,
              is_video: false,
            });
          }
        }
      } catch {
        // Safe ignore child table errors
      }
    }

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    console.error('Admin products PUT route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

