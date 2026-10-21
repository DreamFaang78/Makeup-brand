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
  discountCode: 'LANAN16', // Default Shopify checkout promo code
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
 * Calculates the promotional discount on a given price safely and without stacking.
 *
 * Rules:
 * 1. Base price is the original undiscounted price (e.g. ₹899, ₹599, ₹499).
 * 2. discountedPrice = Math.round(originalPrice * 0.84)
 * 3. savings = originalPrice - discountedPrice
 * 4. Percentage savings calculated from actual original price.
 * 5. Prevents double-discounting if a price is already reduced.
 * 6. Safely handles missing, invalid, or zero prices.
 */
export function calculateProductPrice(
  input: number | string | null | undefined | PriceOptions,
  rawSalePrice?: number | string | null | undefined,
  overrideDiscountPercent: number = PROMOTION_CONFIG.discountPercent
): PriceCalculation {
  let rawBasePrice: number | string | null | undefined;
  let effectiveSalePrice: number | string | null | undefined = rawSalePrice;
  let effectiveDiscount = overrideDiscountPercent;

  if (typeof input === 'object' && input !== null) {
    rawBasePrice = input.basePrice;
    effectiveSalePrice = input.salePrice;
    if (typeof input.discountPercent === 'number') {
      effectiveDiscount = input.discountPercent;
    }
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

  // Calculate target promotional price (default 16%)
  const multiplier = 1 - effectiveDiscount / 100;
  const targetDiscounted = Math.round(base * multiplier);

  let discountedPrice = base;

  if (PROMOTION_CONFIG.enabled) {
    // If an existing sale price is already provided:
    // Ensure we do NOT double-discount an already reduced price!
    if (existingSale !== null && existingSale > 0 && existingSale < base) {
      // If existingSale is already equal to or very close to targetDiscounted, use targetDiscounted
      discountedPrice = targetDiscounted;
    } else {
      discountedPrice = targetDiscounted;
    }
  } else if (existingSale !== null && existingSale > 0 && existingSale < base) {
    discountedPrice = existingSale;
  }

  const hasDiscount = discountedPrice < base;
  const savings = hasDiscount ? base - discountedPrice : 0;
  const actualPercent = hasDiscount ? Math.round(((base - discountedPrice) / base) * 100) : 0;
  const badgeText = hasDiscount ? `SAVE ${actualPercent}%` : '';

  return {
    originalPrice: base,
    discountedPrice,
    savings,
    discountPercent: actualPercent,
    hasDiscount,
    formattedOriginal: formatPrice(base),
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
