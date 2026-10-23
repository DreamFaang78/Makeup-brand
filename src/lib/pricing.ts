// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Central Pricing & 16% Discount Engine
// ─────────────────────────────────────────────────────────────────────────────

/** Format price as Indian Rupees */
export function formatPrice(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return `₹${Math.round(numeric).toLocaleString('en-IN')}`;
}

/**
 * Storewide promotion configuration.
 * All discount calculations reference this single source of truth.
 */
export const PROMOTION_CONFIG = {
  enabled: true,
  discountPercent: 16, // 16% off storewide on all eligible products
  discountMultiplier: 0.84, // 1 - 0.16 = 0.84
  badgeText: 'SAVE 16%',
  discountCode: null as string | null, // Explicit customer-entered coupon codes only
} as const;

export interface PriceCalculation {
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  discountPercent: number;
  hasDiscount: boolean;
  formattedOriginal: string;
  formattedDiscounted: string;
  formattedSavings: string;
  badgeText: string;
}

export interface PriceOptions {
  basePrice?: number | string | null;
  salePrice?: number | string | null;
  discountPercent?: number;
}

/**
 * Approved authoritative original and discounted prices reference.
 * Formula: Final Price = Math.round(Original Price * 0.84)
 * Savings = Original Price - Final Price
 */
export const AUTHORITATIVE_PRICES = {
  'lanan-face-wash-100-ml': {
    name: 'LANAN Face Wash — 100 ml',
    originalPrice: 599,
    finalPrice: 503,
    savings: 96,
    discountPercent: 16,
  },
  'lanan-face-moisturizer-50-g': {
    name: 'LANAN Face Moisturizer — 50 g',
    originalPrice: 499,
    finalPrice: 419,
    savings: 80,
    discountPercent: 16,
  },
  'lanan-sunscreen-spf-50-pa-50-g': {
    name: 'LANAN Sunscreen SPF 50 PA++++ — 50 g',
    originalPrice: 899,
    finalPrice: 755,
    savings: 144,
    discountPercent: 16,
  },
  'lanan-glutathione-face-toner-100-ml': {
    name: 'LANAN Glutathione Face Toner — 100 ml',
    originalPrice: 499,
    finalPrice: 419,
    savings: 80,
    discountPercent: 16,
  },
  'lanan-glutathione-face-serum-30-ml': {
    name: 'LANAN Glutathione Face Serum — 30 ml',
    originalPrice: 899,
    finalPrice: 755,
    savings: 144,
    discountPercent: 16,
  },
} as const;

/**
 * Calculates final price after 16% discount from an original price.
 * Final Price = Math.round(Original Price × 0.84)
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number = 16): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/**
 * Calculates product pricing safely and without duplicate discounting.
 *
 * Rules:
 * 1. Base price is the original undiscounted price (e.g. ₹899, ₹599, ₹499).
 * 2. If a valid sale price is provided (where salePrice < basePrice):
 *    discountedPrice = salePrice (the authoritative selling price from Shopify / catalog).
 *    Do NOT apply a second 16% discount to an already reduced price.
 * 3. If no sale price is provided (or salePrice >= basePrice):
 *    The single price is the authoritative selling price.
 *    Do NOT invent an artificial original price or apply another 16% reduction.
 * 4. savings = originalPrice - discountedPrice
 * 5. Percentage savings calculated from actual original price.
 * 6. Safely handles missing, invalid, or zero prices.
 */
export function calculateProductPrice(
  input: number | string | null | undefined | PriceOptions,
  rawSalePrice?: number | string | null | undefined,
  _overrideDiscountPercent: number = PROMOTION_CONFIG.discountPercent
): PriceCalculation {
  let rawBasePrice: number | string | null | undefined;
  let effectiveSalePrice: number | string | null | undefined = rawSalePrice;

  if (typeof input === 'object' && input !== null) {
    rawBasePrice = input.basePrice;
    effectiveSalePrice = input.salePrice;
  } else {
    rawBasePrice = input;
  }

  const base = Math.round(Number(rawBasePrice) || 0);
  const existingSale = effectiveSalePrice != null ? Math.round(Number(effectiveSalePrice) || 0) : null;

  if (base <= 0) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      savings: 0,
      discountPercent: 0,
      hasDiscount: false,
      formattedOriginal: formatPrice(0),
      formattedDiscounted: formatPrice(0),
      formattedSavings: formatPrice(0),
      badgeText: '',
    };
  }

  // A valid sale price is strictly positive and strictly lower than the base price
  const hasValidSale = existingSale !== null && existingSale > 0 && existingSale < base;

  const originalPrice = base;
  const discountedPrice = hasValidSale ? existingSale : base;
  const hasDiscount = hasValidSale;
  const savings = hasDiscount ? originalPrice - discountedPrice : 0;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;
  const badgeText = hasDiscount && discountPercent > 0 ? `SAVE ${discountPercent}%` : '';

  return {
    originalPrice,
    discountedPrice,
    savings,
    discountPercent,
    hasDiscount,
    formattedOriginal: formatPrice(originalPrice),
    formattedDiscounted: formatPrice(discountedPrice),
    formattedSavings: formatPrice(savings),
    badgeText,
  };
}

/**
 * Helper to compute pricing for an arbitrary product card or variant object.
 */
export function getProductPricing(product: {
  base_price?: number | null;
  sale_price?: number | null;
  price?: number | null;
  variants?: Array<{ price?: number | null; sale_price?: number | null; is_active?: boolean }>;
}): PriceCalculation {
  const activeVariant = product.variants?.find((v) => v.is_active) ?? product.variants?.[0];
  const base = product.base_price ?? activeVariant?.price ?? product.price ?? 0;
  const sale = product.sale_price ?? activeVariant?.sale_price ?? null;

  return calculateProductPrice(base, sale);
}
