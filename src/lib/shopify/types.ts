// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Shopify Storefront API Types & Mappings
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductCardData, ProductVariant } from '@/types/product';
import { calculateProductPrice, getAuthoritativePriceByHandle } from '@/lib/pricing';

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  sku?: string | null;
  image?: ShopifyImage | null;
  quantityAvailable?: number | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  productType?: string;
  vendor?: string;
  tags?: string[];
  totalInventory?: number;
  featuredImage?: ShopifyImage | null;
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  } | null;
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
  } | null>;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyImage | null;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
  };
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: ShopifyImage | null;
    };
    price: ShopifyMoney;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney | null;
    totalDutyAmount?: ShopifyMoney | null;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  discountCodes?: Array<{
    code: string;
    applicable: boolean;
  }>;
}

/**
 * Normalizes a Shopify Storefront GraphQL product into LANAN's ProductCardData
 */
export function normalizeShopifyProduct(sp: ShopifyProduct): ProductCardData {
  const images = (sp.images?.edges || []).map((e, idx) => ({
    id: e.node.id || `img-${sp.handle}-${idx}`,
    url: e.node.url,
    alt_text: e.node.altText || sp.title,
    sort_order: idx,
    is_video: false,
  }));

  if (images.length === 0 && sp.featuredImage) {
    images.push({
      id: sp.featuredImage.id || `img-${sp.handle}-0`,
      url: sp.featuredImage.url,
      alt_text: sp.featuredImage.altText || sp.title,
      sort_order: 0,
      is_video: false,
    });
  }

  const authRef = getAuthoritativePriceByHandle(sp.handle) || getAuthoritativePriceByHandle(sp.title);

  const variants: ProductVariant[] = (sp.variants?.edges || []).map((vEdge, idx) => {
    const v = vEdge.node;
    const priceNum = Math.round(parseFloat(v.price.amount) || 0);
    const rawCompareNum = v.compareAtPrice ? Math.round(parseFloat(v.compareAtPrice.amount) || 0) : null;

    // Use Shopify compareAtPrice if valid and greater than priceNum.
    // If Shopify compareAtPrice is missing, null, or not set, fall back to authoritative compare-at price.
    let compareNum = rawCompareNum;
    if ((compareNum === null || compareNum <= priceNum) && authRef) {
      compareNum = authRef.originalPrice;
    }

    const hasShopifyDiscount = compareNum !== null && compareNum > priceNum;

    // Apply LANAN pricing policy (16% discount, anti-stacking)
    const vPricing = calculateProductPrice(
      hasShopifyDiscount ? compareNum : priceNum,
      hasShopifyDiscount ? priceNum : null
    );

    return {
      id: v.id,
      product_id: sp.id,
      name: v.title || 'Standard',
      sku: v.sku || `SKU-${sp.handle}`,
      price: vPricing.originalPrice,
      sale_price: vPricing.hasDiscount ? vPricing.discountedPrice : null,
      inventory: v.quantityAvailable ?? (v.availableForSale ? 50 : 0),
      is_active: v.availableForSale,
      sort_order: idx,
      image_url: v.image?.url || null,
    };
  });

  const firstVariant = variants[0];
  const minPrice = Math.round(parseFloat(sp.priceRange.minVariantPrice.amount) || 0);
  const rawMinCompare = sp.compareAtPriceRange?.minVariantPrice?.amount
    ? Math.round(parseFloat(sp.compareAtPriceRange.minVariantPrice.amount) || 0)
    : null;

  let minCompare = rawMinCompare;
  if ((minCompare === null || minCompare <= minPrice) && authRef) {
    minCompare = authRef.originalPrice;
  }

  const hasCompareAt = minCompare !== null && minCompare > minPrice;
  const rawBase = hasCompareAt ? minCompare : (firstVariant ? firstVariant.price : minPrice);
  const rawSale = hasCompareAt ? minPrice : (firstVariant?.sale_price ?? null);
  const prodPricing = calculateProductPrice(rawBase, rawSale);

  const basePrice = prodPricing.originalPrice;
  const salePrice = prodPricing.hasDiscount ? prodPricing.discountedPrice : null;

  const tags = sp.tags || [];
  const isBestseller = tags.some((t) => t.toLowerCase().includes('bestseller'));

  // Extract ingredients or how-to-use metafields if present
  let ingredients = '';
  let howToUse: string[] = [];
  if (Array.isArray(sp.metafields)) {
    const ingMeta = sp.metafields.find((m) => m?.key === 'ingredients' || m?.key === 'active_ingredients');
    if (ingMeta?.value) ingredients = ingMeta.value;
    const useMeta = sp.metafields.find((m) => m?.key === 'how_to_use' || m?.key === 'directions');
    if (useMeta?.value) {
      try {
        const parsed = JSON.parse(useMeta.value);
        if (Array.isArray(parsed)) howToUse = parsed;
        else howToUse = [useMeta.value];
      } catch {
        howToUse = useMeta.value.split('\n').filter(Boolean);
      }
    }
  }

  return {
    id: sp.id,
    name: sp.title,
    slug: sp.handle,
    tagline: sp.description.slice(0, 100) + '...',
    description: sp.description,
    description_html: sp.descriptionHtml,
    ingredients,
    how_to_use: howToUse,
    base_price: basePrice,
    sale_price: salePrice,
    rating_avg: 0,
    rating_count: 0,
    is_bestseller: isBestseller,
    skin_types: ['all', 'normal', 'combination'],
    skin_concerns: ['hydration', 'brightening'],
    images,
    variants,
    category: {
      id: `cat-${sp.productType || 'skincare'}`,
      name: sp.productType || 'Skincare',
      slug: (sp.productType || 'skincare').toLowerCase().replace(/\s+/g, '-'),
      description: sp.description || 'LANAN Botanical Formulations',
      image_url: images[0]?.url || '/serum-bottle.jpeg',
      sort_order: 0,
      is_active: true,
    },
  };
}
