// ─────────────────────────────────────────────────────────────────────────────
// LANAN Types — Product
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_video: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  inventory: number;
  is_active: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | 'all';
export type SkinConcern =
  | 'pigmentation'
  | 'acne'
  | 'hydration'
  | 'anti-aging'
  | 'brightening'
  | 'dark-circles'
  | 'pores'
  | 'sensitivity'
  | 'uneven-tone';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  ingredients: string;
  how_to_use: string[];
  category_id: string;
  category?: Category;
  skin_types: SkinType[];
  skin_concerns: SkinConcern[];
  base_price: number;
  sale_price: number | null;
  gst_rate: number;
  sku: string;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  rating_avg: number;
  rating_count: number;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  weight_grams: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  base_price: number;
  sale_price: number | null;
  rating_avg: number;
  rating_count: number;
  is_bestseller: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  skin_types: SkinType[];
  skin_concerns: SkinConcern[];
  category?: Category;
}

export type SortOption = 'newest' | 'bestselling' | 'price-asc' | 'price-desc' | 'rating';

export interface ProductFilters {
  category?: string;
  skinType?: SkinType[];
  skinConcern?: SkinConcern[];
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
  search?: string;
}
