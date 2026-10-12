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

    const { data: rawProducts, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin products:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Format products to match ProductCardData
    const products = (rawProducts || []).map((p: any) => {
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
            is_active: p.status !== 'draft',
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
    console.error('Admin products GET route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a product by ID (handles cascaded and foreign key cleanup)
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

    // Validate UUID format to prevent PostgreSQL 'invalid input syntax for type uuid: "1"'
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) {
      console.log(`[Admin Products] Product ID "${id}" is not a UUID (client-side demo item). Successfully ignored in DB.`);
      return NextResponse.json({
        success: true,
        message: `Product ${id} removed successfully`,
      });
    }

    console.log(`[Admin Products] Deleting product with ID: ${id}`);

    // 1. Unlink from order_items if referenced to preserve order history without violating FK
    await supabase
      .from('order_items')
      .update({ product_id: null })
      .eq('product_id', id);

    // 2. Clear related records without cascade
    await supabase.from('inventory_logs').delete().eq('product_id', id);
    await supabase.from('cart_items').delete().eq('product_id', id);
    await supabase.from('wishlist').delete().eq('product_id', id);
    await supabase.from('reviews').delete().eq('product_id', id);

    // 3. Clear variants and images
    await supabase.from('product_variants').delete().eq('product_id', id);
    await supabase.from('product_images').delete().eq('product_id', id);

    // 4. Delete the product itself
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

// POST: Create a new product OR seed demo products
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();

    // Check if this is an explicit seed request
    if (body.action === 'seed') {
      console.log('[Admin Products] Seeding demo products to Supabase...');

      // 1. Categories
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

      // 2. Products
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
      if (pErr) throw new Error(pErr.message);

      // 3. Variants
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

      // 4. Images
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
        message: 'Successfully seeded 9 starter products into Supabase!',
      });
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

    // Resolve or find Category ID
    let categoryId: string | null = null;
    if (categoryName) {
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName)
        .limit(1)
        .single();

      if (existingCat?.id) {
        categoryId = existingCat.id;
      } else {
        // Create new category
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
    }

    // 1. Insert product
    const { data: newProd, error: prodErr } = await supabase
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
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (prodErr) {
      console.error('[Admin Products] Error creating product:', prodErr);
      return NextResponse.json({ success: false, error: prodErr.message }, { status: 500 });
    }

    // 2. Insert variant
    const variantId = generateUUID();
    const finalSku = sku || `LAN-${slug.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const { data: newVar } = await supabase
      .from('product_variants')
      .insert({
        id: variantId,
        product_id: productId,
        name: 'Standard',
        sku: finalSku,
        price: salePriceNum || basePriceNum,
        sale_price: null,
        inventory: invNum,
        is_active: true,
        sort_order: 0,
      })
      .select()
      .single();

    // 3. Insert images (support array of images or single image_url)
    const imagesToProcess: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : [image_url || '/Serum Bottle.jpeg'];

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

    // Set first image as og_image_url
    if (imagesToProcess[0]) {
      await supabase
        .from('products')
        .update({ og_image_url: imagesToProcess[0] })
        .eq('id', productId);
    }

    const formattedProduct = {
      ...newProd,
      og_image_url: imagesToProcess[0] || null,
      variants: newVar ? [newVar] : [],
      images: newImages,
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (err: any) {
    console.error('Admin products POST route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT / PATCH: Update product
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

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (tagline !== undefined) updates.tagline = tagline;
    if (base_price !== undefined) updates.base_price = parseFloat(base_price);
    if (sale_price !== undefined) updates.sale_price = sale_price ? parseFloat(sale_price) : null;
    if (is_active !== undefined) updates.status = is_active ? 'active' : 'draft';

    // Update category if provided
    if (categoryName) {
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryName)
        .limit(1)
        .single();
      if (existingCat?.id) {
        updates.category_id = existingCat.id;
      }
    }

    // Determine primary image
    const imagesArray: string[] | null = Array.isArray(images) && images.length > 0
      ? images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
      : (image_url ? [image_url] : null);

    if (imagesArray && imagesArray[0]) {
      updates.og_image_url = imagesArray[0];
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
    }

    // Update variant if inventory, sku, or is_active provided
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

    // Update images if provided
    if (imagesArray) {
      // Clear old images for this product
      await supabase.from('product_images').delete().eq('product_id', id);

      // Insert new images in order
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

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    console.error('Admin products PUT route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
