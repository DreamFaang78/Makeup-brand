-- ─────────────────────────────────────────────────────────────────────────────
-- LANAN — Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CUSTOMERS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         text UNIQUE,
  email         text UNIQUE,
  full_name     text,
  segment       text DEFAULT 'new' CHECK (segment IN ('new','repeat','vip','inactive')),
  total_spend   numeric(12,2) DEFAULT 0,
  order_count   int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers(id) ON DELETE CASCADE,
  label         text DEFAULT 'Home',
  full_name     text NOT NULL,
  phone         text NOT NULL,
  line1         text NOT NULL,
  line2         text,
  city          text NOT NULL,
  state         text NOT NULL,
  pincode       text NOT NULL,
  landmark      text,
  is_default    boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- ─── CATALOG ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  image_url   text,
  sort_order  int DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  image_url   text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  tagline           text,
  description       text,
  ingredients       text,
  how_to_use        text[],
  category_id       uuid REFERENCES categories(id),
  collection_ids    uuid[],
  skin_types        text[],
  skin_concerns     text[],
  base_price        numeric(10,2) NOT NULL,
  sale_price        numeric(10,2),
  gst_rate          numeric(5,2) DEFAULT 18,
  sku               text UNIQUE,
  status            text DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  is_featured       boolean DEFAULT false,
  is_bestseller     boolean DEFAULT false,
  rating_avg        numeric(3,2) DEFAULT 0,
  rating_count      int DEFAULT 0,
  seo_title         text,
  seo_description   text,
  og_image_url      text,
  weight_grams      int,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  name          text NOT NULL,
  sku           text UNIQUE,
  price         numeric(10,2) NOT NULL,
  sale_price    numeric(10,2),
  inventory     int DEFAULT 0,
  is_active     boolean DEFAULT true,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  sort_order  int DEFAULT 0,
  is_video    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id    uuid REFERENCES product_variants(id),
  product_id    uuid REFERENCES products(id),
  change        int NOT NULL,
  reason        text CHECK (reason IN ('sale','return','restock','adjustment')),
  order_id      uuid,
  created_at    timestamptz DEFAULT now()
);

-- ─── CART & ORDERS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.carts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers(id),
  session_id    text,
  coupon_code   text,
  discount_amt  numeric(10,2) DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id),
  variant_id    uuid REFERENCES product_variants(id),
  quantity      int NOT NULL DEFAULT 1,
  unit_price    numeric(10,2) NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          text UNIQUE NOT NULL,
  customer_id           uuid REFERENCES customers(id),
  guest_phone           text,
  guest_email           text,
  shipping_address      jsonb NOT NULL,
  billing_address       jsonb,
  subtotal              numeric(10,2) NOT NULL,
  discount_amt          numeric(10,2) DEFAULT 0,
  shipping_charge       numeric(10,2) DEFAULT 0,
  gst_amount            numeric(10,2) DEFAULT 0,
  total_amount          numeric(10,2) NOT NULL,
  coupon_code           text,
  payment_method        text,
  payment_status        text DEFAULT 'payment_pending'
                        CHECK (payment_status IN (
                          'payment_pending','payment_authorized','payment_captured',
                          'payment_failed','payment_refunded','cod_pending'
                        )),
  fulfillment_status    text DEFAULT 'pending'
                        CHECK (fulfillment_status IN (
                          'pending','processing','shipped','delivered','cancelled','returned'
                        )),
  courier_name          text,
  tracking_id           text,
  razorpay_order_id     text,
  notes                 text,
  delivery_method       text DEFAULT 'standard',
  estimated_delivery    date,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id),
  variant_id    uuid REFERENCES product_variants(id),
  product_name  text NOT NULL,
  variant_name  text,
  quantity      int NOT NULL,
  unit_price    numeric(10,2) NOT NULL,
  total_price   numeric(10,2) NOT NULL,
  gst_rate      numeric(5,2),
  image_url     text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid REFERENCES orders(id),
  razorpay_order_id     text,
  razorpay_payment_id   text UNIQUE,
  razorpay_signature    text,
  amount                numeric(10,2) NOT NULL,
  currency              text DEFAULT 'INR',
  status                text,
  method                text,
  error_code            text,
  error_description     text,
  webhook_event         text,
  raw_payload           jsonb,
  created_at            timestamptz DEFAULT now()
);

-- ─── COMMERCE FEATURES ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupons (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text UNIQUE NOT NULL,
  description       text,
  type              text CHECK (type IN ('flat','percent','free_shipping','first_order')),
  value             numeric(10,2),
  min_order_value   numeric(10,2) DEFAULT 0,
  max_discount      numeric(10,2),
  product_ids       uuid[],
  usage_limit       int,
  used_count        int DEFAULT 0,
  is_active         boolean DEFAULT true,
  valid_from        timestamptz,
  valid_until       timestamptz,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id   uuid REFERENCES customers(id),
  order_id      uuid REFERENCES orders(id),
  rating        int CHECK (rating BETWEEN 1 AND 5),
  title         text,
  body          text,
  images        text[],
  is_verified   boolean DEFAULT false,
  is_published  boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- ─── CMS ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.popups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  type            text CHECK (type IN (
                    'welcome','exit_intent','cart_abandonment',
                    'newsletter','flash_sale','bundle_upsell'
                  )),
  title           text,
  body            text,
  cta_text        text,
  cta_url         text,
  image_url       text,
  coupon_code     text,
  trigger_delay   int DEFAULT 3,
  trigger_scroll  int,
  device_target   text DEFAULT 'all' CHECK (device_target IN ('all','mobile','desktop')),
  page_target     text[],
  is_active       boolean DEFAULT false,
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  type          text CHECK (type IN ('announcement_bar','hero','sale')),
  content       text,
  link_url      text,
  image_url     text,
  bg_color      text,
  text_color    text,
  is_active     boolean DEFAULT false,
  sort_order    int DEFAULT 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- ─── ANALYTICS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text,
  customer_id   uuid REFERENCES customers(id),
  event_name    text NOT NULL,
  properties    jsonb,
  page_url      text,
  referrer      text,
  device_type   text,
  created_at    timestamptz DEFAULT now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Customers can only read their own data
CREATE POLICY "Customers read own data" ON customers
  FOR SELECT USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admin full access (via service role key — bypasses RLS)
