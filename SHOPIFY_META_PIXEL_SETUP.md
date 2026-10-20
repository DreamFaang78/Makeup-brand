# LANAN — Meta Ads Pixel & Shopify Headless Tracking Guide

This document details the complete end-to-end Meta Ads Pixel integration for LANAN's headless architecture.

- **Meta Pixel ID:** `1159732883048720`
- **Headless Storefront:** `https://www.lvbrilanan.in/` (Next.js 16 App Router)
- **Checkout & Order Processing:** Shopify Hosted Checkout (`https://lvlanan.myshopify.com/`)

---

## 1. Architecture Overview

In a headless Shopify storefront, the customer journey is split across two domains:

```
[ LANAN Next.js Headless Storefront ]
   ├── PageView (Initial load & client-side route changes)
   ├── ViewContent (Product detail pages with ID, Name, Price INR)
   ├── Search (Customer search queries from Search Modal & Shop page)
   ├── AddToCart (Cart additions with product details & item value)
   └── InitiateCheckout (Proceeding to Shopify checkout handoff)
             │
             ▼ Redirects customer via Shopify cart permalink / checkoutUrl
[ Shopify Hosted Checkout ]
   └── Purchase (ONLY fired after genuine order completion with verified order ID & value)
```

By keeping the `Purchase` event exclusively on Shopify's order completion, we guarantee:
- **No false conversions:** Zero purchase events fired on button clicks, abandoned checkouts, or mock screens.
- **Accurate ROAS:** Only verified orders with actual paid amounts and real order numbers are sent to Meta.
- **Zero duplicates:** Meta Pixel base code and route changes on Next.js are strictly deduplicated.

---

## 2. Shopify Customer Events (Web Pixel) Setup for Purchase

To track genuine `Purchase` events when customers finish placing their orders on Shopify checkout:

### Step-by-Step Installation:

1. Open **Shopify Admin** (`https://admin.shopify.com/store/lvlanan`).
2. Go to **Settings** (bottom-left gear icon) → **Customer Events**.
3. Click **Add custom pixel**.
4. Name the pixel: `Meta Pixel - Headless Checkout`.
5. Under **Customer Privacy**, set Permission to:
   - **Permission:** *Not required* or *Analytics & Marketing* (depending on your store policy).
6. In the code editor, paste the following verified Web Pixel script:

```javascript
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Web Pixel for Meta Ads (Purchase & Checkout Tracking)
// Pixel ID: 1159732883048720
// ─────────────────────────────────────────────────────────────────────────────

const META_PIXEL_ID = '1159732883048720';

// Inject Meta Pixel base code into the Web Pixel sandbox
!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', META_PIXEL_ID);

// 1. Subscribe to genuine completed checkouts (PURCHASE)
analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data?.checkout;
  if (!checkout) return;

  const orderId = checkout.order?.id || checkout.token;
  const totalPrice = parseFloat(checkout.totalPrice?.amount || '0');
  const currency = checkout.currencyCode || 'INR';

  const lineItems = checkout.lineItems || [];
  const contentIds = lineItems.map((item) => String(item.variant?.id || item.id || ''));
  const numItems = lineItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  fbq('track', 'Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: totalPrice,
    currency: currency,
    num_items: numItems,
    order_id: String(orderId),
  });
});
```

7. Click **Save**, then click **Connect** to activate the pixel.

---

## 3. Alternative: Shopify Facebook & Instagram Channel App

If your Shopify store uses the official **Facebook & Instagram** app from the Shopify App Store:
1. Navigate to **Shopify Admin** → **Facebook & Instagram** sales channel.
2. In Settings, select **Data Sharing Settings**.
3. Choose **Maximum** (which enables Meta Conversions API / CAPI server-side tracking alongside browser tracking).
4. Connect Pixel ID: `1159732883048720`.
5. Shopify will automatically track checkout and purchases with automatic deduplication.

---

## 4. How to Verify All Events

### A. Meta Pixel Helper Extension (Google Chrome)
1. Install the [Meta Pixel Helper Chrome Extension](https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc).
2. Visit `https://www.lvbrilanan.in/` (or your local dev server `http://localhost:3000`).
3. Click the extension icon. You should see:
   - Green indicator for Pixel ID `1159732883048720`.
   - `PageView` event with status 200 OK.

### B. Meta Events Manager → Test Events Tool
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2).
2. Select your Pixel (`1159732883048720`).
3. Click the **Test Events** tab.
4. Under "Test Browser Events", enter website URL: `https://www.lvbrilanan.in/` and click **Open Website**.
5. Test each action and watch events appear in real time:

| Action to Perform | Expected Meta Event | Payload Details |
|---|---|---|
| Land on Homepage | `PageView` | URL: `/` |
| Click "Shop" or any navigation link | `PageView` | URL: `/shop` (no duplicates) |
| Click on a product (e.g. Saffron Face Mask) | `ViewContent` | `content_name`, `content_ids`, `value`, `currency: 'INR'` |
| Click the Search icon and submit a query | `Search` | `search_string: '<term>'` |
| Click "Add to Cart" on any product card or PDP | `AddToCart` | `content_name`, `content_ids`, `value`, `currency: 'INR'` |
| Click "Proceed to Checkout" in Cart Drawer or "Buy Now" on PDP | `InitiateCheckout` | `content_ids`, `value`, `currency: 'INR'`, `num_items` |
| Complete a test checkout on Shopify | `Purchase` | `value`, `currency: 'INR'`, `order_id` (via Shopify Web Pixel) |

### C. Testing Privacy & Consent
1. Visit the store in an incognito window.
2. The luxury **Privacy & Personalization** banner appears at the bottom.
3. If the user clicks **Accept All**:
   - `fbq('consent', 'grant')` is invoked.
   - Preference is saved to `localStorage` (`lanan_cookie_consent: 'granted'`).
4. If the user clicks **Essential Only**:
   - `fbq('consent', 'revoke')` is invoked.
   - Preference is saved to `localStorage` (`lanan_cookie_consent: 'denied'`).
5. Users can reopen and change their preferences at any time by clicking **Cookie Preferences** in the website footer.
