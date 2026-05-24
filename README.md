# LANAN — Premium Indian D2C Skincare Platform
### Codename: Antigravity | Brand: LANAN | Entity: Ma Tara Neelsarashwati

A complete, production-ready Indian D2C skincare e-commerce platform built with Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, and Razorpay.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Razorpay account (test mode)

### 1. Clone and Install

```bash
cd lanan
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local` — see [Environment Variables](#-environment-variables) below.

### 3. Set Up the Database

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor**
3. Run the migration: copy and paste from `supabase/migrations/001_initial_schema.sql`

### 4. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** for the storefront.  
Visit **http://localhost:3000/admin/dashboard** for the admin panel.

---

## 📁 Project Structure

```
lanan/
├── src/
│   ├── app/
│   │   ├── (storefront)/          # Public pages
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── shop/              # Product listing
│   │   │   ├── products/[slug]/   # Product detail
│   │   │   ├── checkout/          # Multi-step checkout
│   │   │   ├── about/             # About LANAN
│   │   │   └── legal/[slug]/      # Legal pages
│   │   ├── (admin)/               # Admin dashboard
│   │   │   └── admin/dashboard/   # Dashboard overview
│   │   └── api/                   # API routes
│   │       └── razorpay/          # Payment APIs
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, CartDrawer
│   │   ├── products/              # ProductCard, Gallery
│   │   ├── admin/                 # AdminSidebar, Topbar
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── data/products.ts       # Demo product data
│   │   └── utils.ts               # Utilities + constants
│   ├── store/
│   │   ├── cartStore.ts           # Zustand cart state
│   │   ├── checkoutStore.ts       # Checkout state
│   │   └── uiStore.ts             # UI state
│   └── types/
│       ├── product.ts
│       └── order.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Full database schema
├── .env.example                   # Environment template
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (**server only**) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay Key ID (safe to expose) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Key Secret (**server only, never expose**) |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | Razorpay webhook signature secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ⚡ | Cloudinary cloud name |
| `CLOUDINARY_API_SECRET` | ⚡ | Cloudinary API secret (**server only**) |
| `RESEND_API_KEY` | ⚡ | Resend email API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | ⚡ | PostHog analytics key |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | ⚡ | Google Analytics 4 ID |

> ⚡ = Optional for basic local development

---

## 💳 Razorpay Integration

### How It Works (Secure Flow)

```
Customer → Frontend → POST /api/razorpay/create-order → Razorpay API
                                                              ↓
                              Frontend ← Razorpay Order ID ←←←
                                  ↓
                    Razorpay Checkout Modal (opens in browser)
                                  ↓
                    Customer Pays (UPI / Card / Netbanking)
                                  ↓
                    POST /api/razorpay/verify-payment
                    (HMAC SHA256 signature verification)
                                  ↓
                    Order confirmed in database ✓
```

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `payment.captured` | Confirm order, send email, deduct inventory |
| `payment.failed` | Update order status, notify customer |
| `order.paid` | Final order confirmation |
| `refund.processed` | Update to `payment_refunded`, notify customer |

### Test Payment Cards

| Type | Number | Expiry | CVV |
|------|--------|--------|-----|
| Success | 4111 1111 1111 1111 | Any future | Any |
| Failure | 4000 0000 0000 0002 | Any future | Any |
| UPI (Demo) | success@razorpay | — | — |

---

## 🛍️ Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/shop` | Product listing with filters |
| `/products/[slug]` | Product detail page |
| `/checkout` | Multi-step checkout (5 steps) |
| `/about` | About LANAN |
| `/contact` | Contact page |
| `/rituals` | Brand ritual editorial |
| `/ingredients` | Ingredient transparency |
| `/legal/shipping-policy` | Shipping Policy |
| `/legal/return-refund-policy` | Return & Refund Policy |
| `/legal/privacy-policy` | Privacy Policy |
| `/legal/terms-and-conditions` | Terms & Conditions |
| `/legal/cancellation-policy` | Cancellation Policy |
| `/admin/dashboard` | Admin overview |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/customers` | Customer management |
| `/admin/coupons` | Coupon engine |
| `/admin/popups` | Popup manager |
| `/admin/banners` | Banner manager |
| `/admin/analytics` | Analytics |

---

## 🎨 Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep Obsidian | `#0A0A0A` | Primary text, nav, footer |
| Premium Gold | `#C9A96E` | Brand accent, CTAs, logo |
| Warm Taupe | `#9B7465` | Secondary text, icons |
| Soft Ivory | `#F7F1EA` | Background |
| Muted Beige | `#E8D8CA` | Cards, borders |
| Charcoal | `#2D2D2D` | Body text |
| Success Green | `#2D7A4F` | Success states |
| Error Red | `#C0392B` | Error states |

### Typography

- **Headings**: Cormorant Garamond (luxury serif)
- **Body/UI**: Inter (clean sans-serif)
- **Prices/IDs**: JetBrains Mono (monospace)

---

## 🗄️ Database

All 20 tables are defined in `supabase/migrations/001_initial_schema.sql`:

- `customers`, `addresses`
- `categories`, `collections`, `products`, `product_variants`, `product_images`, `inventory_logs`
- `carts`, `cart_items`, `orders`, `order_items`, `payments`
- `coupons`, `reviews`, `wishlist`
- `popups`, `banners`
- `analytics_events`

---

## 🛡️ Security

- ✅ Razorpay secret key is **never exposed** to frontend
- ✅ Payment amount is validated **server-side**
- ✅ Payment signature verified with **HMAC SHA256**
- ✅ Webhook signature verified to prevent spoofing
- ✅ Supabase RLS policies protect customer data
- ✅ No card details are stored anywhere

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand + React Query |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (Phone OTP) |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Resend |
| Analytics | PostHog + GA4 |

---

## 📦 Deployment (Vercel)

```bash
# Build first to check for errors
npm run build

# Deploy to Vercel
npx vercel --prod
```

Add all environment variables from `.env.example` to your Vercel project settings.

**Razorpay Webhook URL**: `https://lanan.in/api/razorpay/webhook`

---

## 🏢 Business Details

**Legal Entity**: Ma Tara Neelsarashwati  
**Brand**: LANAN  
**Business Type**: Proprietary  
**PAN Holder**: Sadhna Yadav  
**Phone**: +91 7630888521  
**Address**: Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki, Kanpur, Uttar Pradesh - 208020  

> **Note**: Bank account details, Aadhaar, GST documents, and MSME documents are for Razorpay dashboard KYC verification only. They must **never** be stored in code, environment variables, or the repository.

---

## 📝 License

Proprietary. © 2026 Ma Tara Neelsarashwati (LANAN). All rights reserved.
