-- ─────────────────────────────────────────────────────────────────────────────
-- LANAN — Migration 002: Catalog Standardization (Exactly 5 Products)
-- Updates or inserts the 5 canonical products with exact titles, prices,
-- categories, packaging creatives, and status (moisturizer as draft).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure Categories Exist with Canonical Slugs
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order, is_active)
VALUES
  ('081c55fe-b0ec-4df4-a400-a44f7a7152d5', 'Cleansers', 'cleansers', 'Gentle daily cleansing rituals', '/lanan-face-wash.jpeg', 0, true),
  ('ab599fa6-9562-44df-a52e-f39f25f70bf0', 'Moisturisers', 'moisturisers', 'Deep hydration for every skin type', '/lanan-face-moisturizer.jpeg', 1, true),
  ('bec469d0-bb3c-4ebe-aa04-1cb282c0424f', 'Sunscreen', 'sunscreen', 'Broad spectrum daily protection', '/lanan-sunscreen-spf-50.jpeg', 2, true),
  ('a081e852-628d-493e-a158-f196d26a8326', 'Toners', 'toners', 'Balancing and refreshing toner rituals', '/lanan-glutathione-face-toner.jpeg', 3, true),
  ('51ebeaa3-8500-4e78-a56b-4319703f5d52', 'Serums', 'serums', 'Concentrated formulas for targeted skin concerns', '/lanan-glutathione-face-serum.jpeg', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  is_active = true;

-- 2. Clean Up Any Legacy Test / Demo Products Not Matching Canonical 5 Products
DELETE FROM public.products
WHERE slug NOT IN (
  'lanan-face-wash',
  'lanan-face-moisturizer',
  'lanan-sunscreen-spf-50',
  'lanan-glutathione-face-toner',
  'lanan-glutathione-face-serum'
)
AND sku NOT IN ('LFW-100', 'LFM-50', 'LSP-50', 'LGT-100', 'LGS-30', 'LAN-SUN-050', 'LAN-TON-100', 'LAN-MST-050', 'LAN-GFS-030');

-- 3. Standardize Product 1: LANAN Face Wash – 100 ml
DO $$
DECLARE
  v_prod_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'cleansers' LIMIT 1;
  SELECT id INTO v_prod_id FROM public.products WHERE slug = 'lanan-face-wash' OR sku = 'LFW-100' OR slug LIKE 'lanan-face-wash%' LIMIT 1;

  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
    INSERT INTO public.products (id, name, slug, tagline, description, ingredients, how_to_use, category_id, base_price, sale_price, sku, status, is_bestseller, rating_avg, rating_count, og_image_url)
    VALUES (
      v_prod_id,
      'LANAN Face Wash – 100 ml',
      'lanan-face-wash',
      'Daily Cleanser to Help Control Oil & Enhance Brightness',
      'Daily facial cleanser formulated to help control excess oil, unclog pores, and improve the look of skin brightness.',
      'Salicylic Acid 2%, Niacinamide 1%, Alpha Arbutin 0.5%, Glutathione 0.5%',
      ARRAY['Apply to wet face', 'Massage gently in circular motions', 'Rinse and pat dry', 'Use morning and evening'],
      v_cat_id,
      599.00,
      503.00,
      'LFW-100',
      'active',
      true,
      4.8,
      86,
      '/lanan-face-wash.jpeg'
    );
  ELSE
    UPDATE public.products SET
      name = 'LANAN Face Wash – 100 ml',
      slug = 'lanan-face-wash',
      tagline = 'Daily Cleanser to Help Control Oil & Enhance Brightness',
      description = 'Daily facial cleanser formulated to help control excess oil, unclog pores, and improve the look of skin brightness.',
      ingredients = 'Salicylic Acid 2%, Niacinamide 1%, Alpha Arbutin 0.5%, Glutathione 0.5%',
      how_to_use = ARRAY['Apply to wet face', 'Massage gently in circular motions', 'Rinse and pat dry', 'Use morning and evening'],
      category_id = v_cat_id,
      base_price = 599.00,
      sale_price = 503.00,
      sku = 'LFW-100',
      status = 'active',
      is_bestseller = true,
      og_image_url = '/lanan-face-wash.jpeg'
    WHERE id = v_prod_id;
  END IF;

  -- Ensure variant
  DELETE FROM public.product_variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_variants (product_id, name, sku, price, sale_price, inventory, is_active, sort_order)
  VALUES (v_prod_id, '100 ml', 'LFW-100', 599.00, 503.00, 100, true, 0);

  -- Ensure primary image
  DELETE FROM public.product_images WHERE product_id = v_prod_id;
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_video)
  VALUES (v_prod_id, '/lanan-face-wash.jpeg', 'LANAN Face Wash – 100 ml', 0, false);
END $$;

-- 4. Standardize Product 2: LANAN Face Moisturizer – 50 g (status: draft / hidden)
DO $$
DECLARE
  v_prod_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'moisturisers' LIMIT 1;
  SELECT id INTO v_prod_id FROM public.products WHERE slug = 'lanan-face-moisturizer' OR sku = 'LFM-50' OR sku = 'LAN-MST-050' OR slug LIKE '%face-moisturizer%' LIMIT 1;

  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
    INSERT INTO public.products (id, name, slug, tagline, description, ingredients, how_to_use, category_id, base_price, sale_price, sku, status, is_bestseller, rating_avg, rating_count, og_image_url)
    VALUES (
      v_prod_id,
      'LANAN Face Moisturizer – 50 g',
      'lanan-face-moisturizer',
      'Everyday Moisture. Healthy-Looking Glow.',
      'Lightweight daily moisturiser designed to replenish hydration and support a healthy-looking natural skin glow.',
      NULL,
      NULL,
      v_cat_id,
      499.00,
      419.00,
      'LFM-50',
      'draft',
      false,
      4.7,
      42,
      '/lanan-face-moisturizer.jpeg'
    );
  ELSE
    UPDATE public.products SET
      name = 'LANAN Face Moisturizer – 50 g',
      slug = 'lanan-face-moisturizer',
      tagline = 'Everyday Moisture. Healthy-Looking Glow.',
      description = 'Lightweight daily moisturiser designed to replenish hydration and support a healthy-looking natural skin glow.',
      ingredients = NULL,
      how_to_use = NULL,
      category_id = v_cat_id,
      base_price = 499.00,
      sale_price = 419.00,
      sku = 'LFM-50',
      status = 'draft',
      is_bestseller = false,
      og_image_url = '/lanan-face-moisturizer.jpeg'
    WHERE id = v_prod_id;
  END IF;

  -- Ensure variant
  DELETE FROM public.product_variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_variants (product_id, name, sku, price, sale_price, inventory, is_active, sort_order)
  VALUES (v_prod_id, '50 g', 'LFM-50', 499.00, 419.00, 100, false, 0);

  -- Ensure image (neutral ivory placeholder with LANAN logo)
  DELETE FROM public.product_images WHERE product_id = v_prod_id;
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_video)
  VALUES (v_prod_id, '/lanan-face-moisturizer.jpeg', 'LANAN Face Moisturizer – 50 g', 0, false);
END $$;

-- 5. Standardize Product 3: LANAN Sunscreen SPF 50 PA++++ – 50 g
DO $$
DECLARE
  v_prod_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'sunscreen' LIMIT 1;
  SELECT id INTO v_prod_id FROM public.products WHERE slug = 'lanan-sunscreen-spf-50' OR sku = 'LSP-50' OR sku = 'LAN-SUN-050' OR slug LIKE 'lanan-sunscreen%' LIMIT 1;

  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
    INSERT INTO public.products (id, name, slug, tagline, description, ingredients, how_to_use, category_id, base_price, sale_price, sku, status, is_bestseller, rating_avg, rating_count, og_image_url)
    VALUES (
      v_prod_id,
      'LANAN Sunscreen SPF 50 PA++++ – 50 g',
      'lanan-sunscreen-spf-50',
      'Broad Spectrum UVA/UVB Protection with No White Cast',
      'High-protection sunscreen formulated with SPF 50 and PA++++ broad spectrum filters. Helps protect skin from UVA/UVB damage while absorbing smoothly with zero white cast.',
      NULL,
      ARRAY['Apply generously 15 minutes before sun exposure', 'Reapply at least every 2 hours or after sweating/swimming'],
      v_cat_id,
      899.00,
      737.00,
      'LSP-50',
      'active',
      true,
      4.9,
      114,
      '/lanan-sunscreen-spf-50.jpeg'
    );
  ELSE
    UPDATE public.products SET
      name = 'LANAN Sunscreen SPF 50 PA++++ – 50 g',
      slug = 'lanan-sunscreen-spf-50',
      tagline = 'Broad Spectrum UVA/UVB Protection with No White Cast',
      description = 'High-protection sunscreen formulated with SPF 50 and PA++++ broad spectrum filters. Helps protect skin from UVA/UVB damage while absorbing smoothly with zero white cast.',
      ingredients = NULL,
      how_to_use = ARRAY['Apply generously 15 minutes before sun exposure', 'Reapply at least every 2 hours or after sweating/swimming'],
      category_id = v_cat_id,
      base_price = 899.00,
      sale_price = 737.00,
      sku = 'LSP-50',
      status = 'active',
      is_bestseller = true,
      og_image_url = '/lanan-sunscreen-spf-50.jpeg'
    WHERE id = v_prod_id;
  END IF;

  -- Ensure variant
  DELETE FROM public.product_variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_variants (product_id, name, sku, price, sale_price, inventory, is_active, sort_order)
  VALUES (v_prod_id, '50 g', 'LSP-50', 899.00, 737.00, 100, true, 0);

  -- Ensure primary image
  DELETE FROM public.product_images WHERE product_id = v_prod_id;
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_video)
  VALUES (v_prod_id, '/lanan-sunscreen-spf-50.jpeg', 'LANAN Sunscreen SPF 50 PA++++ – 50 g', 0, false);
END $$;

-- 6. Standardize Product 4: LANAN Glutathione Face Toner – 100 ml
DO $$
DECLARE
  v_prod_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'toners' LIMIT 1;
  SELECT id INTO v_prod_id FROM public.products WHERE slug = 'lanan-glutathione-face-toner' OR sku = 'LGT-100' OR sku = 'LAN-TON-100' OR slug LIKE 'lanan-glutathione-face-toner%' LIMIT 1;

  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
    INSERT INTO public.products (id, name, slug, tagline, description, ingredients, how_to_use, category_id, base_price, sale_price, sku, status, is_bestseller, rating_avg, rating_count, og_image_url)
    VALUES (
      v_prod_id,
      'LANAN Glutathione Face Toner – 100 ml',
      'lanan-glutathione-face-toner',
      'Refresh. Hydrate. Reveal Your Natural Glow.',
      'Hydrating and refreshing daily face toner formulated with Glutathione to help tone, hydrate, and improve the look of skin radiance.',
      NULL,
      ARRAY['After cleansing, apply toner with cotton pad or pat directly onto face', 'Allow to absorb before applying serum or moisturiser'],
      v_cat_id,
      499.00,
      419.00,
      'LGT-100',
      'active',
      false,
      4.6,
      53,
      '/lanan-glutathione-face-toner.jpeg'
    );
  ELSE
    UPDATE public.products SET
      name = 'LANAN Glutathione Face Toner – 100 ml',
      slug = 'lanan-glutathione-face-toner',
      tagline = 'Refresh. Hydrate. Reveal Your Natural Glow.',
      description = 'Hydrating and refreshing daily face toner formulated with Glutathione to help tone, hydrate, and improve the look of skin radiance.',
      ingredients = NULL,
      how_to_use = ARRAY['After cleansing, apply toner with cotton pad or pat directly onto face', 'Allow to absorb before applying serum or moisturiser'],
      category_id = v_cat_id,
      base_price = 499.00,
      sale_price = 419.00,
      sku = 'LGT-100',
      status = 'active',
      is_bestseller = false,
      og_image_url = '/lanan-glutathione-face-toner.jpeg'
    WHERE id = v_prod_id;
  END IF;

  -- Ensure variant
  DELETE FROM public.product_variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_variants (product_id, name, sku, price, sale_price, inventory, is_active, sort_order)
  VALUES (v_prod_id, '100 ml', 'LGT-100', 499.00, 419.00, 100, true, 0);

  -- Ensure primary image
  DELETE FROM public.product_images WHERE product_id = v_prod_id;
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_video)
  VALUES (v_prod_id, '/lanan-glutathione-face-toner.jpeg', 'LANAN Glutathione Face Toner – 100 ml', 0, false);
END $$;

-- 7. Standardize Product 5: LANAN Glutathione Face Serum – 30 ml
DO $$
DECLARE
  v_prod_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_cat_id FROM public.categories WHERE slug = 'serums' LIMIT 1;
  SELECT id INTO v_prod_id FROM public.products WHERE slug = 'lanan-glutathione-face-serum' OR sku = 'LGS-30' OR sku = 'LAN-GFS-030' OR slug LIKE 'lanan-glutathione-face-serum%' LIMIT 1;

  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
    INSERT INTO public.products (id, name, slug, tagline, description, ingredients, how_to_use, category_id, base_price, sale_price, sku, status, is_bestseller, rating_avg, rating_count, og_image_url)
    VALUES (
      v_prod_id,
      'LANAN Glutathione Face Serum – 30 ml',
      'lanan-glutathione-face-serum',
      'Deep Hydration, Brighter-Looking Skin, Radiant Glow',
      'Potent radiance serum formulated with Glutathione, Vitamin C, Ceramide NP, and Hyaluronic Acid to deliver deep hydration and a radiant glow.',
      'Glutathione, Vitamin C, Ceramide NP, Hyaluronic Acid',
      ARRAY['Apply 2-3 drops on fingertips', 'Smooth over cleansed face and neck', 'Massage until absorbed', 'Use morning and night'],
      v_cat_id,
      899.00,
      737.00,
      'LGS-30',
      'active',
      true,
      4.9,
      142,
      '/lanan-glutathione-face-serum.jpeg'
    );
  ELSE
    UPDATE public.products SET
      name = 'LANAN Glutathione Face Serum – 30 ml',
      slug = 'lanan-glutathione-face-serum',
      tagline = 'Deep Hydration, Brighter-Looking Skin, Radiant Glow',
      description = 'Potent radiance serum formulated with Glutathione, Vitamin C, Ceramide NP, and Hyaluronic Acid to deliver deep hydration and a radiant glow.',
      ingredients = 'Glutathione, Vitamin C, Ceramide NP, Hyaluronic Acid',
      how_to_use = ARRAY['Apply 2-3 drops on fingertips', 'Smooth over cleansed face and neck', 'Massage until absorbed', 'Use morning and night'],
      category_id = v_cat_id,
      base_price = 899.00,
      sale_price = 737.00,
      sku = 'LGS-30',
      status = 'active',
      is_bestseller = true,
      og_image_url = '/lanan-glutathione-face-serum.jpeg'
    WHERE id = v_prod_id;
  END IF;

  -- Ensure variant
  DELETE FROM public.product_variants WHERE product_id = v_prod_id;
  INSERT INTO public.product_variants (product_id, name, sku, price, sale_price, inventory, is_active, sort_order)
  VALUES (v_prod_id, '30 ml', 'LGS-30', 899.00, 737.00, 100, true, 0);

  -- Ensure primary image
  DELETE FROM public.product_images WHERE product_id = v_prod_id;
  INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_video)
  VALUES (v_prod_id, '/lanan-glutathione-face-serum.jpeg', 'LANAN Glutathione Face Serum – 30 ml', 0, false);
END $$;
