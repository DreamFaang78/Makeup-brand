import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/data/products';

// Deterministic UUID mapper for seeding
const getUUID = (id: string, block: 'cat' | 'prod' | 'var' | 'img'): string => {
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().padEnd(12, '0').slice(0, 12);
  const blockMap = { cat: '8000', prod: '9000', var: 'a000', img: 'b000' };
  return `01920392-1234-7000-${blockMap[block]}-${clean}`;
};

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Seeding is only allowed in development mode.' }, { status: 403 });
  }

  const supabase = createAdminClient();

  try {
    // 1. Seed Categories
    console.log('Seeding categories...');
    const categoriesToInsert = DEMO_CATEGORIES.map(cat => ({
      id: getUUID(cat.id, 'cat'),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    }));

    const { error: catError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'slug' });

    if (catError) throw new Error(`Category seeding error: ${catError.message}`);

    // 2. Seed Products
    console.log('Seeding products...');
    const productsToInsert = DEMO_PRODUCTS.map(prod => ({
      id: getUUID(prod.id, 'prod'),
      name: prod.name,
      slug: prod.slug,
      tagline: prod.tagline,
      description: prod.tagline, // Fallback description
      category_id: prod.category ? getUUID(prod.category.id, 'cat') : '',
      skin_types: prod.skin_types,
      skin_concerns: prod.skin_concerns,
      base_price: prod.base_price,
      sale_price: prod.sale_price,
      status: 'active',
      is_featured: prod.is_bestseller, // Map to featured
      is_bestseller: prod.is_bestseller,
      rating_avg: prod.rating_avg,
      rating_count: prod.rating_count,
    }));

    const { error: prodError } = await supabase
      .from('products')
      .upsert(productsToInsert, { onConflict: 'slug' });

    if (prodError) throw new Error(`Product seeding error: ${prodError.message}`);

    // 3. Seed Product Variants
    console.log('Seeding product variants...');
    const variantsToInsert = DEMO_PRODUCTS.flatMap(prod => 
      prod.variants.map(v => ({
        id: getUUID(v.id, 'var'),
        product_id: getUUID(prod.id, 'prod'),
        name: v.name,
        sku: v.sku,
        price: v.price,
        sale_price: v.sale_price,
        inventory: v.inventory,
        is_active: v.is_active,
        sort_order: v.sort_order,
      }))
    );

    const { error: varError } = await supabase
      .from('product_variants')
      .upsert(variantsToInsert, { onConflict: 'sku' });

    if (varError) throw new Error(`Variant seeding error: ${varError.message}`);

    // 4. Seed Product Images
    console.log('Seeding product images...');
    const imagesToInsert = DEMO_PRODUCTS.flatMap(prod => 
      prod.images.map((img, index) => ({
        id: getUUID(img.id, 'img'),
        product_id: getUUID(prod.id, 'prod'),
        url: img.url,
        alt_text: img.alt_text,
        sort_order: img.sort_order || index,
        is_video: img.is_video,
      }))
    );

    const { error: imgError } = await supabase
      .from('product_images')
      .upsert(imagesToInsert, { onConflict: 'id' });

    if (imgError) throw new Error(`Product images seeding error: ${imgError.message}`);

    return NextResponse.json({
      success: true,
      message: 'Supabase database seeded successfully!',
      categoriesCount: categoriesToInsert.length,
      productsCount: productsToInsert.length,
      variantsCount: variantsToInsert.length,
      imagesCount: imagesToInsert.length,
    });
  } catch (error: any) {
    console.error('Seeding database failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
