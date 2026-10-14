// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Seed Data (Product Catalog)
// Exactly 5 products with exact images, SKUs, and prices
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductCardData } from '@/types/product';

export const DEMO_PRODUCTS: ProductCardData[] = [
  {
    id: 'lanan-face-wash',
    name: 'LANAN Face Wash – 100 ml',
    slug: 'lanan-face-wash',
    tagline: 'Daily Cleanser to Help Control Oil & Enhance Brightness',
    description: 'Daily facial cleanser formulated to help control excess oil, unclog pores, and improve the look of skin brightness.',
    ingredients: 'Salicylic Acid 2%, Niacinamide 1%, Alpha Arbutin 0.5%, Glutathione 0.5%',
    how_to_use: [
      'Apply to wet face',
      'Massage gently in circular motions',
      'Rinse and pat dry',
      'Use morning and evening',
    ],
    base_price: 599,
    sale_price: 503,
    rating_avg: 4.8,
    rating_count: 86,
    is_bestseller: true,
    skin_types: ['oily', 'combination', 'normal'],
    skin_concerns: ['acne', 'pores', 'brightening'],
    images: [
      {
        id: 'img-lfw-1',
        url: '/lanan-face-wash.jpeg',
        alt_text: 'LANAN Face Wash – 100 ml',
        sort_order: 0,
        is_video: false,
      },
    ],
    variants: [
      { id: 'v-lfw-100', product_id: 'lanan-face-wash', name: '100 ml', sku: 'LFW-100', price: 599, sale_price: 503, inventory: 100, is_active: true, sort_order: 0 },
    ],
    category: { id: 'c3', name: 'Cleansers', slug: 'cleansers', description: 'Gentle daily cleansing rituals', image_url: '/lanan-face-wash.jpeg', sort_order: 0, is_active: true },
  },
  {
    id: 'lanan-face-moisturizer',
    name: 'LANAN Face Moisturizer – 50 g',
    slug: 'lanan-face-moisturizer',
    tagline: 'Everyday Moisture. Healthy-Looking Glow.',
    description: 'Lightweight daily moisturiser designed to replenish hydration and support a healthy-looking natural skin glow.',
    ingredients: '',
    how_to_use: [],
    base_price: 499,
    sale_price: 419,
    rating_avg: 4.7,
    rating_count: 42,
    is_bestseller: false,
    skin_types: ['dry', 'normal', 'combination', 'sensitive'],
    skin_concerns: ['hydration', 'uneven-tone'],
    status: 'draft',
    images: [
      {
        id: 'img-lfm-1',
        url: '/lanan-face-moisturizer.jpeg',
        alt_text: 'LANAN Face Moisturizer – 50 g',
        sort_order: 0,
        is_video: false,
      },
    ],
    variants: [
      { id: 'v-lfm-50', product_id: 'lanan-face-moisturizer', name: '50 g', sku: 'LFM-50', price: 499, sale_price: 419, inventory: 100, is_active: false, sort_order: 0 },
    ],
    category: { id: 'c2', name: 'Moisturisers', slug: 'moisturisers', description: 'Deep hydration for every skin type', image_url: '/lanan-face-moisturizer.jpeg', sort_order: 1, is_active: true },
  },
  {
    id: 'lanan-sunscreen-spf-50',
    name: 'LANAN Sunscreen SPF 50 PA++++ – 50 g',
    slug: 'lanan-sunscreen-spf-50',
    tagline: 'Broad Spectrum UVA/UVB Protection with No White Cast',
    description: 'High-protection sunscreen formulated with SPF 50 and PA++++ broad spectrum filters. Helps protect skin from UVA/UVB damage while absorbing smoothly with zero white cast.',
    ingredients: '',
    how_to_use: [
      'Apply generously 15 minutes before sun exposure',
      'Reapply at least every 2 hours or after sweating/swimming',
    ],
    base_price: 899,
    sale_price: 737,
    rating_avg: 4.9,
    rating_count: 114,
    is_bestseller: true,
    skin_types: ['all', 'sensitive', 'oily', 'dry'],
    skin_concerns: ['anti-aging', 'pigmentation'],
    images: [
      {
        id: 'img-lsp-1',
        url: '/lanan-sunscreen-spf-50.jpeg',
        alt_text: 'LANAN Sunscreen SPF 50 PA++++ – 50 g',
        sort_order: 0,
        is_video: false,
      },
    ],
    variants: [
      { id: 'v-lsp-50', product_id: 'lanan-sunscreen-spf-50', name: '50 g', sku: 'LSP-50', price: 899, sale_price: 737, inventory: 100, is_active: true, sort_order: 0 },
    ],
    category: { id: 'c6', name: 'Sunscreen', slug: 'sunscreen', description: 'Broad spectrum daily protection', image_url: '/lanan-sunscreen-spf-50.jpeg', sort_order: 2, is_active: true },
  },
  {
    id: 'lanan-glutathione-face-toner',
    name: 'LANAN Glutathione Face Toner – 100 ml',
    slug: 'lanan-glutathione-face-toner',
    tagline: 'Refresh. Hydrate. Reveal Your Natural Glow.',
    description: 'Hydrating and refreshing daily face toner formulated with Glutathione to help tone, hydrate, and improve the look of skin radiance.',
    ingredients: '',
    how_to_use: [
      'After cleansing, apply toner with cotton pad or pat directly onto face',
      'Allow to absorb before applying serum or moisturiser',
    ],
    base_price: 499,
    sale_price: 419,
    rating_avg: 4.6,
    rating_count: 53,
    is_bestseller: false,
    skin_types: ['all', 'normal', 'combination'],
    skin_concerns: ['hydration', 'brightening'],
    images: [
      {
        id: 'img-lgt-1',
        url: '/lanan-glutathione-face-toner.jpeg',
        alt_text: 'LANAN Glutathione Face Toner – 100 ml',
        sort_order: 0,
        is_video: false,
      },
    ],
    variants: [
      { id: 'v-lgt-100', product_id: 'lanan-glutathione-face-toner', name: '100 ml', sku: 'LGT-100', price: 499, sale_price: 419, inventory: 100, is_active: true, sort_order: 0 },
    ],
    category: { id: 'c7', name: 'Toners', slug: 'toners', description: 'Balancing and refreshing toner rituals', image_url: '/lanan-glutathione-face-toner.jpeg', sort_order: 3, is_active: true },
  },
  {
    id: 'lanan-glutathione-face-serum',
    name: 'LANAN Glutathione Face Serum – 30 ml',
    slug: 'lanan-glutathione-face-serum',
    tagline: 'Deep Hydration, Brighter-Looking Skin, Radiant Glow',
    description: 'Potent radiance serum formulated with Glutathione, Vitamin C, Ceramide NP, and Hyaluronic Acid to deliver deep hydration and a radiant glow.',
    ingredients: 'Glutathione, Vitamin C, Ceramide NP, Hyaluronic Acid',
    how_to_use: [
      'Apply 2-3 drops on fingertips',
      'Smooth over cleansed face and neck',
      'Massage until absorbed',
      'Use morning and night',
    ],
    base_price: 899,
    sale_price: 737,
    rating_avg: 4.9,
    rating_count: 142,
    is_bestseller: true,
    skin_types: ['all', 'dry', 'combination', 'sensitive', 'normal'],
    skin_concerns: ['brightening', 'pigmentation', 'hydration', 'anti-aging'],
    images: [
      {
        id: 'img-lgs-1',
        url: '/lanan-glutathione-face-serum.jpeg',
        alt_text: 'LANAN Glutathione Face Serum – 30 ml',
        sort_order: 0,
        is_video: false,
      },
    ],
    variants: [
      { id: 'v-lgs-30', product_id: 'lanan-glutathione-face-serum', name: '30 ml', sku: 'LGS-30', price: 899, sale_price: 737, inventory: 100, is_active: true, sort_order: 0 },
    ],
    category: { id: 'c1', name: 'Serums', slug: 'serums', description: 'Concentrated formulas for targeted skin concerns', image_url: '/lanan-glutathione-face-serum.jpeg', sort_order: 4, is_active: true },
  },
];

export const DEMO_CATEGORIES = [
  { id: 'c3', name: 'Cleansers', slug: 'cleansers', image_url: '/lanan-face-wash.jpeg', sort_order: 0, is_active: true, description: 'Gentle daily cleansing rituals' },
  { id: 'c2', name: 'Moisturisers', slug: 'moisturisers', image_url: '/lanan-face-moisturizer.jpeg', sort_order: 1, is_active: true, description: 'Deep hydration for every skin type' },
  { id: 'c6', name: 'Sunscreen', slug: 'sunscreen', image_url: '/lanan-sunscreen-spf-50.jpeg', sort_order: 2, is_active: true, description: 'Broad spectrum daily protection' },
  { id: 'c7', name: 'Toners', slug: 'toners', image_url: '/lanan-glutathione-face-toner.jpeg', sort_order: 3, is_active: true, description: 'Balancing and refreshing toner rituals' },
  { id: 'c1', name: 'Serums', slug: 'serums', image_url: '/lanan-glutathione-face-serum.jpeg', sort_order: 4, is_active: true, description: 'Concentrated formulas for targeted skin concerns' },
];

export const DEMO_REVIEWS = [
  { id: 'r1', name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The Glutathione Face Serum transformed my skin in 3 weeks. It absorbs beautifully and gives a natural radiant glow without feeling sticky.', product: 'LANAN Glutathione Face Serum – 30 ml', verified: true, avatar: 'PS' },
  { id: 'r2', name: 'Anjali Menon', location: 'Bangalore', rating: 5, text: 'The Sunscreen SPF 50 PA++++ is my holy grail. Lightweight, completely absorbs with no white cast, and sits seamlessly under makeup.', product: 'LANAN Sunscreen SPF 50 PA++++ – 50 g', verified: true, avatar: 'AM' },
  { id: 'r3', name: 'Ritu Gupta', location: 'Delhi', rating: 5, text: 'The Face Wash with Salicylic Acid and Niacinamide cleanses so thoroughly without drying out my skin. Gentle yet effective.', product: 'LANAN Face Wash – 100 ml', verified: true, avatar: 'RG' },
  { id: 'r4', name: 'Kavitha Nair', location: 'Hyderabad', rating: 5, text: 'The Glutathione Face Toner is deeply refreshing. It preps my skin perfectly and gives an instant soothing hydration boost.', product: 'LANAN Glutathione Face Toner – 100 ml', verified: true, avatar: 'KN' },
  { id: 'r5', name: 'Deepa Joshi', location: 'Pune', rating: 5, text: 'LANAN formulations feel truly luxury and clinical. The texture, finish, and results on my skin are outstanding.', product: 'LANAN Glutathione Face Serum – 30 ml', verified: true, avatar: 'DJ' },
];
