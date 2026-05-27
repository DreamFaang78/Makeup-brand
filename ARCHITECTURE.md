# LANAN — Application Architecture Reference

<!--
  PURPOSE OF THIS FILE
  ────────────────────
  This file is the single source of truth for any AI coding assistant, developer,
  or agent working on this codebase. Before writing any code, read this file fully.
  Every section answers the question: "WHERE does X live and HOW does it work?"

  QUICK ORIENTATION
  ─────────────────
  • App name     : LANAN
  • Type         : Full-stack e-commerce (luxury Indian skincare brand)
  • Framework    : Next.js 16 App Router (TypeScript)
  • Database     : Supabase (PostgreSQL + Auth)
  • State        : Zustand (client-only, no Redux, no Context API for global state)
  • Payments     : Razorpay (India)
  • AI Feature   : Google Gemini 1.5 Flash (skin analysis)
  • Root dir     : lanan/   (all paths below are relative to this root)
-->

---

## 1. TECH STACK (exact versions)

| What | Library | Version |
|---|---|---|
| Framework | `next` | 16.2.6 |
| UI | `react` + `react-dom` | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Animation | `framer-motion` | ^12 |
| Database + Auth | `@supabase/supabase-js` + `@supabase/ssr` | ^2.106 / ^0.10 |
| Global state | `zustand` | ^5 |
| Server data | `@tanstack/react-query` | ^5 |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` | ^7 / ^5 / ^4 |
| Payments | `razorpay` | ^2.9 |
| Email | `resend` | ^6 |
| Image CDN | `cloudinary` | ^2 |
| Toasts | `sonner` | ^2 |
| Icons | `lucide-react` | ^1 |
| Dates | `date-fns` | ^4 |
| CSS helpers | `clsx` + `tailwind-merge` + `class-variance-authority` | latest |

**Dev scripts:**
```bash
npm run dev      # starts Next.js dev server
npm run build    # production build
npm run start    # runs production server
npm run lint     # ESLint
```

---

## 2. COMPLETE FILE TREE (every important file with its role)

```
lanan/
│
├── ARCHITECTURE.md          ← YOU ARE HERE
├── middleware.ts             ← Edge middleware: protects /admin and /account routes
├── next.config.ts            ← Next.js config (image domains, etc.)
├── tailwind.config.ts        ← Design token overrides
├── .env.example              ← Template for all required environment variables
├── package.json              ← Dependencies
│
├── public/                   ← Static assets served at root URL
│   ├── Serum Bottle.jpeg     ← Product image (used by demo data)
│   ├── Moisturiser Tube.jpeg
│   ├── Sunscreen.jpeg
│   ├── Saffron Face Mask.jpeg
│   ├── Bathroom Shelf Mockup.jpeg
│   ├── Product in Hand.jpeg
│   └── website product cards..jpeg
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  ← FULL database schema — all tables defined here
│
└── src/
    │
    ├── app/                         ← Next.js App Router root
    │   ├── layout.tsx               ← ROOT LAYOUT — HTML shell, fonts, global metadata,
    │   │                               wraps everything in <Providers>, renders Navbar,
    │   │                               Footer, CartDrawer, AIPopup, AuthModal, Toaster
    │   ├── globals.css              ← Global CSS + Tailwind base + design tokens
    │   ├── page.tsx                 ← Homepage (also duplicated in (storefront)/page.tsx)
    │   ├── favicon.ico
    │   │
    │   ├── (storefront)/            ← Route group: public website. URL NOT affected by folder name.
    │   │   ├── layout.tsx           ← Thin storefront layout wrapper
    │   │   ├── page.tsx             ← / (homepage)
    │   │   ├── shop/
    │   │   │   └── page.tsx         ← /shop (product listing + filters)
    │   │   ├── products/
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx     ← /products/[slug] (product detail page)
    │   │   ├── checkout/
    │   │   │   └── page.tsx         ← /checkout (multi-step: contact→address→delivery→payment→success)
    │   │   ├── about/
    │   │   │   └── page.tsx         ← /about
    │   │   ├── ingredients/
    │   │   │   └── page.tsx         ← /ingredients (ingredient glossary)
    │   │   ├── trends/
    │   │   │   └── page.tsx         ← /trends (editorial/blog)
    │   │   └── legal/
    │   │       └── [slug]/
    │   │           └── page.tsx     ← /legal/[slug] (privacy-policy, terms, return-policy, etc.)
    │   │
    │   ├── (admin)/                 ← Route group: admin panel. COMPLETELY overrides root layout.
    │   │   ├── layout.tsx           ← Admin layout: full-screen, z-9999, auth guard, sidebar+topbar
    │   │   └── admin/
    │   │       ├── dashboard/page.tsx    ← /admin/dashboard
    │   │       ├── products/page.tsx     ← /admin/products
    │   │       ├── orders/page.tsx       ← /admin/orders
    │   │       ├── customers/page.tsx    ← /admin/customers
    │   │       ├── analytics/page.tsx    ← /admin/analytics
    │   │       ├── banners/page.tsx      ← /admin/banners
    │   │       ├── coupons/page.tsx      ← /admin/coupons
    │   │       ├── popups/page.tsx       ← /admin/popups
    │   │       └── settings/page.tsx     ← /admin/settings
    │   │
    │   ├── account/                 ← Customer portal (requires auth)
    │   │   └── orders/
    │   │       └── page.tsx         ← /account/orders (order history)
    │   │
    │   └── api/                     ← API Route Handlers (serverless, run on Node.js/Edge)
    │       ├── razorpay/
    │       │   ├── create-order/route.ts    ← POST: creates Razorpay order + DB order record
    │       │   ├── verify-payment/route.ts  ← POST: verifies HMAC signature, updates order
    │       │   └── webhook/route.ts         ← POST: Razorpay webhook handler
    │       ├── skin-analysis/route.ts       ← POST: Gemini AI skin analysis
    │       ├── check-user/route.ts          ← POST: does phone/email exist in DB?
    │       ├── sync-user/route.ts           ← POST: upsert customer after Supabase signup
    │       ├── seed/route.ts                ← POST: seeds DB with DEMO_PRODUCTS (dev only)
    │       └── admin/
    │           ├── orders/route.ts          ← GET/POST: admin order management
    │           └── customers/route.ts       ← GET: admin customer list
    │
    ├── components/
    │   ├── Providers.tsx            ← Wraps app in <QueryClientProvider> (TanStack Query)
    │   │
    │   ├── layout/                  ← Global persistent UI (rendered in root layout.tsx)
    │   │   ├── Navbar.tsx           ← Top navigation, search, cart icon, auth button
    │   │   ├── Footer.tsx           ← Site footer with links, newsletter, social
    │   │   ├── CartDrawer.tsx       ← Slide-in cart sidebar (reads cartStore)
    │   │   ├── AuthModal.tsx        ← Login/register modal (phone OTP + email/password)
    │   │   └── AIPopup.tsx          ← AI skin analysis floating widget
    │   │
    │   ├── products/
    │   │   └── ProductCard.tsx      ← Product card component (homepage + shop page)
    │   │
    │   └── admin/
    │       ├── AdminSidebar.tsx     ← Admin nav sidebar (left panel)
    │       └── AdminTopbar.tsx      ← Admin header bar (top of admin layout)
    │
    ├── store/                       ← Zustand client-side global stores
    │   ├── cartStore.ts             ← Cart items, totals, coupon, open/close state
    │   ├── uiStore.ts               ← Auth modal, search, mobile menu, popups
    │   └── checkoutStore.ts         ← Checkout wizard step + data
    │
    ├── lib/
    │   ├── data/
    │   │   └── products.ts          ← DEMO_PRODUCTS, DEMO_CATEGORIES, DEMO_REVIEWS (static seed data)
    │   └── utils.ts                 ← Shared helpers: cn(), formatPrice(), slugify(), BRAND config
    │
    ├── types/
    │   ├── product.ts               ← ProductCardData, Product, ProductVariant, Category, SkinType, SkinConcern
    │   ├── order.ts                 ← CartItem, Order, OrderItem, ShippingAddress, PaymentStatus, FulfillmentStatus
    │   └── razorpay.d.ts            ← Global type declaration for window.Razorpay
    │
    └── utils/
        └── supabase/
            ├── client.ts            ← Browser Supabase client (use in 'use client' components)
            ├── server.ts            ← Server Supabase client (use in Server Components + API routes)
            └── admin.ts             ← Service-role client (bypasses RLS — admin API only)
```

---

## 3. ROUTING — Every URL This App Handles

### 3.1 Storefront (Public)

| URL | Page File | Who Can Access |
|---|---|---|
| `/` | `app/(storefront)/page.tsx` | Everyone |
| `/shop` | `app/(storefront)/shop/page.tsx` | Everyone |
| `/products/[slug]` | `app/(storefront)/products/[slug]/page.tsx` | Everyone |
| `/skin-analysis` | `app/(storefront)/skin-analysis/page.tsx` | Everyone |
| `/checkout` | `app/(storefront)/checkout/page.tsx` | Everyone (guest checkout supported) |
| `/about` | `app/(storefront)/about/page.tsx` | Everyone |
| `/ingredients` | `app/(storefront)/ingredients/page.tsx` | Everyone |
| `/trends` | `app/(storefront)/trends/page.tsx` | Everyone |
| `/legal/[slug]` | `app/(storefront)/legal/[slug]/page.tsx` | Everyone |

### 3.2 Admin Panel (Private)

> Middleware redirects unauthenticated users to `/?auth=login`.
> Admin layout additionally checks `customer.email === 'admin@lanan.in'` for role.

| URL | Page File |
|---|---|
| `/admin/dashboard` | `app/(admin)/admin/dashboard/page.tsx` |
| `/admin/products` | `app/(admin)/admin/products/page.tsx` |
| `/admin/orders` | `app/(admin)/admin/orders/page.tsx` |
| `/admin/customers` | `app/(admin)/admin/customers/page.tsx` |
| `/admin/analytics` | `app/(admin)/admin/analytics/page.tsx` |
| `/admin/banners` | `app/(admin)/admin/banners/page.tsx` |
| `/admin/coupons` | `app/(admin)/admin/coupons/page.tsx` |
| `/admin/popups` | `app/(admin)/admin/popups/page.tsx` |
| `/admin/settings` | `app/(admin)/admin/settings/page.tsx` |

### 3.3 Account (Auth Required)

| URL | Page File |
|---|---|
| `/account/orders` | `app/account/orders/page.tsx` |

### 3.4 API Routes (Backend Endpoints)

| Method | URL | File | Auth Needed |
|---|---|---|---|
| POST | `/api/razorpay/create-order` | `api/razorpay/create-order/route.ts` | None (guest OK) |
| POST | `/api/razorpay/verify-payment` | `api/razorpay/verify-payment/route.ts` | None |
| POST | `/api/razorpay/webhook` | `api/razorpay/webhook/route.ts` | Webhook signature |
| POST | `/api/skin-analysis` | `api/skin-analysis/route.ts` | None |
| POST | `/api/check-user` | `api/check-user/route.ts` | None |
| POST | `/api/sync-user` | `api/sync-user/route.ts` | Supabase session |
| GET  | `/api/admin/orders` | `api/admin/orders/route.ts` | Service role |
| POST | `/api/admin/orders` | `api/admin/orders/route.ts` | Service role |
| GET  | `/api/admin/customers` | `api/admin/customers/route.ts` | Service role |
| POST | `/api/seed` | `api/seed/route.ts` | None ⚠️ disable in prod |

---

## 4. FRONTEND — Component Rules & Patterns

### 4.1 Layout Hierarchy

```
HTML (<html> + <body>)                    ← app/layout.tsx
  └── <Providers>                         ← QueryClientProvider
        ├── <Navbar />                    ← always visible (except admin)
        ├── <main>{page content}</main>
        ├── <Footer />                    ← always visible (except admin)
        ├── <CartDrawer />                ← portal/overlay, controlled by cartStore.isOpen
        ├── <AIPopup />                   ← floating widget
        ├── <AuthModal />                 ← modal, controlled by uiStore.authModalOpen
        └── <Toaster />                   ← sonner toasts, bottom-right
```

**Admin pages override this entirely:**
```
Admin Layout (position:fixed, inset:0, z-9999)   ← app/(admin)/layout.tsx
  ├── <AdminSidebar />                            ← left nav
  └── <div flex-col>
        ├── <AdminTopbar />                       ← top bar
        └── <main>{admin page}</main>
```

### 4.2 Key Component Contracts

#### `<ProductCard />` — `src/components/products/ProductCard.tsx`
```tsx
// Props it expects:
props: {
  product: ProductCardData   // from src/types/product.ts
}

// What it renders:
// - product image (product.images[0].url)
// - name, tagline
// - base_price (crossed out if sale_price exists)
// - sale_price (highlighted)
// - rating_avg + rating_count
// - "BESTSELLER" badge if product.is_bestseller === true
// - "Add to Cart" button → calls cartStore.addItem()
```

#### `<CartDrawer />` — `src/components/layout/CartDrawer.tsx`
```tsx
// Reads from: useCartStore()
// Opens when: cartStore.isOpen === true
// Key displayed values: items[], subtotal, shippingCharge, gstAmount, total
// Coupon input → calls cartStore.applyCoupon(code, discount)
// "Checkout" button → router.push('/checkout')
```

#### `<AuthModal />` — `src/components/layout/AuthModal.tsx`
```tsx
// Opens when: uiStore.authModalOpen === true
// Mode: uiStore.authMode === 'login' | 'register'
// Open it programmatically with: useUIStore().openAuthModal('login')
// After success: calls POST /api/sync-user then closes modal
```

#### `<AIPopup />` — `src/components/layout/AIPopup.tsx`
```tsx
// Floating button → opens full skin analysis wizard
// User uploads up to 4 images → base64 encoded in browser
// Calls: POST /api/skin-analysis with { images: string[] }
// Renders response: skinType, concerns[], recommendedProductSlugs[]
// Each recommended slug links to: /products/[slug]
```

---

## 5. STATE MANAGEMENT — Zustand Stores

> Rule: NEVER use useState/useContext for cross-component global state. Use the appropriate store below.

### 5.1 `cartStore` — `src/store/cartStore.ts`

```ts
// Import:
import { useCartStore } from '@/store/cartStore';

// Key state:
items: CartItem[]          // persisted to localStorage
couponCode: string | null  // persisted
couponDiscount: number     // persisted
isOpen: boolean            // NOT persisted

// Computed (auto-recalculated on every mutation):
itemCount: number
subtotal: number
shippingCharge: number     // 0 if subtotal >= 599, else 79
gstAmount: number          // 18% of discounted subtotal
total: number
freeShippingProgress: number  // 0-100 (% toward free shipping)

// Key actions:
cartStore.addItem({ product_id, variant_id, product_name, product_slug,
                    variant_name, image_url, unit_price, quantity })
cartStore.removeItem(productId, variantId?)
cartStore.updateQty(productId, variantId, newQty)   // qty <= 0 removes item
cartStore.clearCart()
cartStore.applyCoupon(code, discountAmount)
cartStore.removeCoupon()
cartStore.openCart()   // sets isOpen = true
cartStore.closeCart()

// localStorage key: 'lanan-cart'
// Only items, couponCode, couponDiscount are persisted (NOT isOpen)
```

### 5.2 `uiStore` — `src/store/uiStore.ts`

```ts
// Import:
import { useUIStore } from '@/store/uiStore';

// Key state (NOT persisted):
authModalOpen: boolean
authMode: 'login' | 'register'
searchOpen: boolean
searchQuery: string
popupShown: string | null    // popup id shown this session
popupVisible: boolean
mobileMenuOpen: boolean
announcementVisible: boolean

// Key actions:
uiStore.openAuthModal('login' | 'register')
uiStore.closeAuthModal()
uiStore.toggleSearch()
uiStore.setSearchQuery(q)
uiStore.showPopup(id)
uiStore.hidePopup()
uiStore.toggleMobileMenu()
uiStore.closeMobileMenu()
uiStore.hideAnnouncement()
```

### 5.3 `checkoutStore` — `src/store/checkoutStore.ts`

```ts
// Import:
import { useCheckoutStore } from '@/store/checkoutStore';

// Checkout is a 5-step wizard:
type CheckoutStep = 'contact' | 'address' | 'delivery' | 'payment' | 'success'

// Key state (NOT persisted — resets on page refresh, intentional for security):
step: CheckoutStep
contact: { phone, name, email }
address: ShippingAddress | null
deliveryMethod: 'standard' | 'express'
razorpayOrderId: string | null
confirmedOrderId: string | null

// Key actions:
checkoutStore.setStep(step)
checkoutStore.setContact({ phone, name, email })
checkoutStore.setAddress(shippingAddress)
checkoutStore.setDeliveryMethod('standard' | 'express')
checkoutStore.setRazorpayOrderId(id)
checkoutStore.setConfirmedOrderId(id)
checkoutStore.resetCheckout()    // called after order success
```

---

## 6. TYPES — Where to Import From

> Rule: Always import types from `src/types/`. Never define local types for these entities.

### `src/types/product.ts`

```ts
ProductCardData   // Used on product listing / cards — lightweight
Product           // Full product record — used on PDP
ProductImage      // { id, url, alt_text, sort_order, is_video }
ProductVariant    // { id, product_id, name, sku, price, sale_price, inventory, is_active, sort_order }
Category          // { id, name, slug, description, image_url, sort_order, is_active }
SkinType          // 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | 'all'
SkinConcern       // 'pigmentation' | 'acne' | 'hydration' | 'anti-aging' | 'brightening' | 'dark-circles' | 'pores' | 'sensitivity' | 'uneven-tone'
ProductStatus     // 'draft' | 'active' | 'archived'
SortOption        // 'newest' | 'bestselling' | 'price-asc' | 'price-desc' | 'rating'
ProductFilters    // { category?, skinType?, skinConcern?, priceMin?, priceMax?, sort?, search? }
```

### `src/types/order.ts`

```ts
CartItem          // { id, product_id, variant_id, product_name, product_slug, variant_name, image_url, unit_price, quantity }
Order             // Full order record with items[]
OrderItem         // Denormalised line item (snapshot of product at order time)
ShippingAddress   // { full_name, phone, line1, line2?, city, state, pincode, landmark? }
PaymentStatus     // 'payment_pending' | 'payment_authorized' | 'payment_captured' | 'payment_failed' | 'payment_refunded' | 'cod_pending'
FulfillmentStatus // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
PaymentMethod     // 'razorpay' | 'cod'
DeliveryMethod    // 'standard' | 'express'
```

---

## 7. UTILITY FUNCTIONS — `src/lib/utils.ts`

```ts
import { cn, formatPrice, formatPriceRaw, discountPercent,
         slugify, generateOrderNumber, truncate, isValidPincode,
         getStars, delay, INDIAN_STATES, BRAND } from '@/lib/utils';

cn(...classNames)                   // Merge Tailwind classes (clsx + tailwind-merge)
formatPrice(1299)                   // → "₹1,299"  (Indian rupee format)
formatPriceRaw(1299)                // → "1,299"   (no currency symbol)
discountPercent(1299, 999)          // → 23  (discount %)
slugify('Radiance Serum')           // → 'radiance-serum'
generateOrderNumber()               // → 'LAN2505ABCDE'
truncate('long text', 50)           // trims to 50 chars + '…'
isValidPincode('208020')            // → true (Indian 6-digit pincode)
getStars(4.5)                       // → ['full','full','full','full','half']
delay(3000)                         // Promise that resolves after 3000ms

INDIAN_STATES                       // string[] — all Indian states/UTs
BRAND                               // { name, fullName, phone, email, supportEmail, address,
                                    //   addressLines, socialLinks, freeShippingThreshold: 599,
                                    //   standardShipping: 79, gstRate: 18 }
```

---

## 8. SUPABASE — Client Selection Rules

> Rule: Wrong client = either broken session handling or security vulnerability. Always use the right one.

| Situation | Import | Key Used |
|---|---|---|
| Inside a `'use client'` component | `import { createClient } from '@/utils/supabase/client'` | Anon key |
| Inside a Server Component | `import { createClient } from '@/utils/supabase/server'` | Anon key + cookies |
| Inside an API route handler | `import { createClient } from '@/utils/supabase/server'` | Anon key + cookies |
| Admin API (needs to bypass RLS) | `import { createClient } from '@/utils/supabase/admin'` | Service role key |

**Client component pattern:**
```tsx
'use client';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
```

**Server component / API route pattern:**
```tsx
import { createClient } from '@/utils/supabase/server';

const supabase = await createClient();  // note: await (reads cookies)
const { data } = await supabase.from('products').select('*');
```

---

## 9. DATABASE SCHEMA — All Tables

> Full SQL is in `supabase/migrations/001_initial_schema.sql`. This is the summary.

### Customer Domain
```
customers
  id uuid PK | phone UNIQUE | email UNIQUE | full_name
  segment: 'new' | 'repeat' | 'vip' | 'inactive'
  total_spend numeric | order_count int | created_at | updated_at

addresses
  id uuid PK | customer_id → customers.id (CASCADE)
  label | full_name | phone | line1 | line2 | city | state | pincode | landmark
  is_default bool | created_at
```

### Catalog Domain
```
categories
  id uuid PK | name | slug UNIQUE | description | image_url | sort_order | is_active

collections
  id uuid PK | name | slug UNIQUE | description | image_url | is_active

products
  id uuid PK | name | slug UNIQUE | tagline | description | ingredients
  how_to_use text[] | category_id → categories.id | collection_ids uuid[]
  skin_types text[] | skin_concerns text[]
  base_price numeric | sale_price numeric | gst_rate (default 18)
  sku UNIQUE | status: 'draft'|'active'|'archived'
  is_featured bool | is_bestseller bool
  rating_avg numeric | rating_count int
  seo_title | seo_description | og_image_url | weight_grams

product_variants
  id uuid PK | product_id → products.id (CASCADE)
  name | sku UNIQUE | price numeric | sale_price numeric
  inventory int | is_active bool | sort_order

product_images
  id uuid PK | product_id → products.id (CASCADE)
  url | alt_text | sort_order | is_video bool

inventory_logs
  id uuid PK | variant_id → product_variants.id | product_id → products.id
  change int | reason: 'sale'|'return'|'restock'|'adjustment' | order_id uuid
```

### Commerce Domain
```
orders
  id uuid PK | order_number UNIQUE (format: LAN2505XXXXX)
  customer_id → customers.id | guest_phone | guest_email
  shipping_address jsonb | billing_address jsonb
  subtotal | discount_amt | shipping_charge | gst_amount | total_amount
  coupon_code | payment_method: 'razorpay'|'cod'
  payment_status: 'payment_pending'|'payment_authorized'|'payment_captured'
                  |'payment_failed'|'payment_refunded'|'cod_pending'
  fulfillment_status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled'|'returned'
  courier_name | tracking_id | razorpay_order_id | notes
  delivery_method: 'standard'|'express' | estimated_delivery date

order_items
  id uuid PK | order_id → orders.id (CASCADE)
  product_id → products.id | variant_id → product_variants.id
  product_name text | variant_name text   ← DENORMALISED SNAPSHOT (not FK for display)
  quantity | unit_price | total_price | gst_rate | image_url

payments
  id uuid PK | order_id → orders.id
  razorpay_order_id | razorpay_payment_id UNIQUE | razorpay_signature
  amount | currency (default INR) | status | method
  error_code | error_description | webhook_event | raw_payload jsonb

coupons
  id uuid PK | code UNIQUE | description
  type: 'flat'|'percent'|'free_shipping'|'first_order'
  value | min_order_value | max_discount | product_ids uuid[]
  usage_limit | used_count | is_active | valid_from | valid_until

reviews
  id uuid PK | product_id → products.id | customer_id → customers.id
  order_id → orders.id | rating (1-5) | title | body | images text[]
  is_verified bool | is_published bool

wishlist
  id uuid PK | customer_id → customers.id | product_id → products.id
  UNIQUE(customer_id, product_id)
```

### CMS Domain
```
popups
  id uuid PK | name | type: 'welcome'|'exit_intent'|'cart_abandonment'
                            |'newsletter'|'flash_sale'|'bundle_upsell'
  title | body | cta_text | cta_url | image_url | coupon_code
  trigger_delay int | trigger_scroll int | device_target: 'all'|'mobile'|'desktop'
  page_target text[] | is_active | starts_at | ends_at

banners
  id uuid PK | name | type: 'announcement_bar'|'hero'|'sale'
  content | link_url | image_url | bg_color | text_color
  is_active | sort_order | starts_at | ends_at
```

### Analytics Domain
```
analytics_events
  id uuid PK | session_id | customer_id → customers.id
  event_name | properties jsonb | page_url | referrer | device_type
```

### Row Level Security (RLS)
```
Tables with RLS enabled: customers, orders, payments, wishlist

Policy "Customers read own data" ON customers:
  SELECT WHERE id::text = JWT sub claim

Admin access: Use admin Supabase client (service role) → bypasses ALL RLS
```

---

## 10. API ROUTES — Input/Output Contracts

### `POST /api/razorpay/create-order`
```ts
// Input (body):
{ cartItems: CartItem[], contact: { name, phone, email }, address: ShippingAddress,
  subtotal: number, shippingCharge: number, gstAmount: number, total: number,
  couponCode?: string, discountAmt?: number, deliveryMethod: 'standard'|'express' }

// What it does:
// 1. Creates Razorpay order via Razorpay SDK (amount in paise = total * 100)
// 2. Inserts order into Supabase orders table (status: payment_pending)
// 3. Inserts order_items records

// Output (success):
{ razorpayOrderId: string, orderId: string, amount: number, currency: 'INR',
  orderNumber: string, keyId: string }
```

### `POST /api/razorpay/verify-payment`
```ts
// Input (body):
{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }

// What it does:
// 1. HMAC-SHA256 verification: `${razorpay_order_id}|${razorpay_payment_id}`
// 2. Updates orders.payment_status → 'payment_captured'
// 3. Creates payment record in payments table

// Output (success):
{ success: true, orderId: string }
```

### `POST /api/razorpay/webhook`
```ts
// Input: Razorpay webhook POST with X-Razorpay-Signature header
// What it does: Validates webhook signature, upserts payments table
// Output: { received: true }
```

### `POST /api/skin-analysis`
```ts
// Input (body):
{ images: string[] }   // 1-4 base64 image strings (with or without data: prefix)

// What it does:
// If GEMINI_API_KEY set: calls https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash
// If no API key: returns random mock profile after 3s delay

// Output:
{
  skinType: 'Combination' | 'Oily' | 'Dry' | 'Sensitive' | 'Normal',
  skinTypeDescription: string,
  concerns: Array<{ name: string, severityPercent: number, details: string }>,
  routineExplanation: string,
  recommendedProductSlugs: string[],  // product slugs from DEMO_PRODUCTS
  isMock: boolean
}
```

### `POST /api/check-user`
```ts
// Input: { phone?: string, email?: string }
// Output: { exists: boolean, userId?: string }
```

### `POST /api/sync-user`
```ts
// Input: { id: string, email?: string, phone?: string, full_name?: string }
// What it does: upserts row into customers table
// Output: { success: true }
```

---

## 11. AUTHENTICATION — Full Flow

```
Step 1: User clicks "Login" anywhere
        → useUIStore().openAuthModal('login')
        → <AuthModal /> becomes visible

Step 2: User enters phone number
        → POST /api/check-user { phone }
        → exists? → login flow : → registration flow

Step 3: Supabase OTP sent
        → supabase.auth.signInWithOtp({ phone })

Step 4: User enters OTP
        → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
        → @supabase/ssr automatically sets sb-* session cookies

Step 5: Sync customer record
        → POST /api/sync-user (upserts customers table)

Step 6: Modal closes
        → useUIStore().closeAuthModal()

Middleware checks on every request to /admin/* and /account/*:
  cookies().getAll().some(c => c.name.startsWith('sb-'))
  → no session? → redirect to /?auth=login

Admin role check (client-side in (admin)/layout.tsx):
  supabase.from('customers').select('segment, email').eq('id', userId)
  email === 'admin@lanan.in'  → full admin
  segment === 'new'|'repeat'  → redirect to /account/orders
  segment === 'vip'           → admin access (TODO: tighten)

Dev mode: mock user stored in localStorage key 'mock_user'
  → middleware also checks cookie 'mock-user'
```

---

## 12. PAYMENT FLOW — Razorpay

```
1. User on /checkout fills contact + address + delivery

2. User clicks "Pay Now"
   → POST /api/razorpay/create-order
   ← receives { razorpayOrderId, amount, keyId }

3. Browser opens Razorpay modal:
   new window.Razorpay({
     key: keyId,
     amount: amount,   // in paise (₹1 = 100 paise)
     order_id: razorpayOrderId,
     currency: 'INR',
     handler: function(response) { /* call verify-payment */ }
   }).open()

4. User pays → Razorpay calls handler with:
   { razorpay_payment_id, razorpay_order_id, razorpay_signature }

5. → POST /api/razorpay/verify-payment
   ← { success: true, orderId }

6. Frontend:
   checkoutStore.setConfirmedOrderId(orderId)
   checkoutStore.setStep('success')
   cartStore.clearCart()

7. Async (server→server): Razorpay sends webhook to /api/razorpay/webhook
   → updates payments table raw_payload
```

---

## 13. DEMO DATA — `src/lib/data/products.ts`

> This file allows the app to run with ZERO database connection. All demo products, categories, and reviews are defined here as TypeScript constants.

```ts
import { DEMO_PRODUCTS, DEMO_CATEGORIES, DEMO_REVIEWS } from '@/lib/data/products';

// DEMO_PRODUCTS: ProductCardData[] — 9 products
// IDs: '1' through '9'
// Slugs: 'radiance-revival-serum', 'velvet-hydra-moisturiser', 'petal-soft-cleansing-foam',
//        'golden-hour-eye-cream', 'saffron-glow-face-mask', 'rose-dew-spf40-sunscreen',
//        'niacinamide-clarity-toner', 'midnight-repair-night-cream', 'mini-glow-lip-balm'

// DEMO_CATEGORIES: Category[] — 6 categories
// DEMO_REVIEWS: 5 customer reviews with avatar initials

// Product image URLs reference files in /public/ (served at root URL)
// e.g. url: '/Serum Bottle.jpeg' → served at https://lanan.in/Serum Bottle.jpeg
```

---

## 14. ENVIRONMENT VARIABLES

> Copy `.env.example` to `.env.local`. Variables without `NEXT_PUBLIC_` are **server-only** (never sent to browser).

```bash
# REQUIRED FOR CORE FUNCTIONALITY
NEXT_PUBLIC_SUPABASE_URL=            # Supabase project URL (safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Supabase anon/public key (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=           # SERVER ONLY — bypasses RLS

NEXT_PUBLIC_RAZORPAY_KEY_ID=         # Razorpay key ID (safe for browser, loads SDK)
RAZORPAY_KEY_SECRET=                 # SERVER ONLY — signs orders
RAZORPAY_WEBHOOK_SECRET=             # SERVER ONLY — validates webhooks

# OPTIONAL / FEATURE FLAGS
GEMINI_API_KEY=                      # SERVER ONLY — enables real AI skin analysis (mock if missing)
CLOUDINARY_API_KEY=                  # SERVER ONLY — for image uploads
CLOUDINARY_API_SECRET=               # SERVER ONLY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # safe for browser (for upload widget)
RESEND_API_KEY=                      # SERVER ONLY — transactional email
RESEND_FROM_EMAIL=noreply@lanan.in

# APP CONFIG (all safe for browser)
NEXT_PUBLIC_APP_URL=https://lanan.in
NEXT_PUBLIC_BRAND_NAME=LANAN
NEXT_PUBLIC_SUPPORT_PHONE=7630888521
NEXT_PUBLIC_SUPPORT_EMAIL=hello@lanan.in
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=599
NEXT_PUBLIC_COD_ENABLED=false

# ANALYTICS (optional)
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## 15. CODING RULES — Follow These When Writing New Code

### File naming
```
Pages          → page.tsx                          (Next.js convention, always)
Components     → PascalCase.tsx                    (e.g. ProductCard.tsx)
Stores         → camelCaseStore.ts                 (e.g. cartStore.ts)
API routes     → route.ts                          (Next.js convention, always)
Types          → camelCase.ts grouped by domain    (e.g. product.ts)
Utilities      → camelCase.ts                      (e.g. utils.ts)
```

### Import alias
```ts
// ALWAYS use @/ alias, never relative paths that go up more than one level
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import type { ProductCardData } from '@/types/product';
import { createClient } from '@/utils/supabase/client';
```

### Server vs Client components
```ts
// DEFAULT: Server Component (no directive needed)
// Add 'use client' ONLY when you need:
//   - useState, useEffect, useRef, or any React hook
//   - Browser APIs (window, localStorage, document)
//   - Zustand stores (useCartStore, useUIStore, etc.)
//   - Event handlers (onClick, onChange inline)
//   - Framer Motion animations

// ❌ WRONG — Zustand in a Server Component will crash
// ✅ RIGHT — mark it 'use client' first
'use client';
import { useCartStore } from '@/store/cartStore';
```

### CSS / Styling
```tsx
// Tailwind utility classes — always use cn() for conditional merging
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class', props.className)} />

// Design tokens (defined in tailwind.config.ts + globals.css):
//   bg-ivory       → #F7F1EA   (page background)
//   text-obsidian  → #0A0A0A   (primary text)
//   text-gold      → #C9A96E   (brand accent)
//   font-body      → Inter
//   font-display   → Cormorant Garamond (serif, luxury headings)
```

### Price formatting
```ts
// Always use formatPrice() for display. Never manually format currency.
import { formatPrice } from '@/lib/utils';
formatPrice(1299)   // → "₹1,299"
```

### Adding a new product to demo data
```ts
// File: src/lib/data/products.ts
// Add to DEMO_PRODUCTS array. Follow the ProductCardData type exactly.
// Use next sequential id ('10', '11', etc.)
// Image: put file in /public/, reference as '/filename.jpg'
// slug must be kebab-case and unique
```

### Adding a new admin page
```
1. Create: src/app/(admin)/admin/[section]/page.tsx
2. Add link to: src/components/admin/AdminSidebar.tsx
3. Page auto-inherits admin layout (auth guard, sidebar, topbar)
```

### Adding a new API route
```
1. Create: src/app/api/[route-name]/route.ts
2. Export async functions named: GET, POST, PUT, DELETE, PATCH
3. Always return NextResponse.json(data) or NextResponse.json({ error }, { status: N })
4. Use createClient from @/utils/supabase/server for DB access
5. For admin endpoints needing RLS bypass: use @/utils/supabase/admin
```

### File header comment style (keep consistent)
```ts
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — [Description of what this file does]
// ─────────────────────────────────────────────────────────────────────────────
```

---

## 16. BUSINESS CONSTANTS (hardcoded — do not change without updating DB + UI)

```ts
// From src/lib/utils.ts → BRAND constant:
freeShippingThreshold: 599   // orders above ₹599 get free shipping
standardShipping: 79          // flat shipping fee
gstRate: 18                   // 18% GST applied to all products

// Admin email (hardcoded role check in (admin)/layout.tsx):
'admin@lanan.in'              // this email gets full admin access

// Order number format: LAN + YY + MM + 5 random chars
// Example: LAN2505ABCDE
// Generated by: generateOrderNumber() in src/lib/utils.ts

// Razorpay amounts are always in PAISE (multiply INR by 100):
// ₹999 → 99900 paise
```

---

*Last updated: May 2026. Update this file whenever you add routes, tables, stores, or third-party integrations.*
