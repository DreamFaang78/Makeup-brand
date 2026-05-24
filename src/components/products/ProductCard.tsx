'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Card Component
// Premium card with hover effects, wishlist, quick-add, badges
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, discountPercent, cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/product';
import { toast } from 'sonner';

interface Props {
  product: ProductCardData;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [wishlistd, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  const image = product.images[0];
  const activeVariant = product.variants.find((v) => v.is_active) ?? product.variants[0];
  const displayPrice = activeVariant?.sale_price ?? activeVariant?.price ?? product.sale_price ?? product.base_price;
  const originalPrice = activeVariant?.price ?? product.base_price;
  const hasSale = displayPrice < originalPrice;
  const discount = hasSale ? discountPercent(originalPrice, displayPrice) : 0;
  const isOutOfStock = activeVariant ? activeVariant.inventory <= 0 : false;
  const isLowStock = activeVariant ? activeVariant.inventory <= 5 && activeVariant.inventory > 0 : false;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem({
      product_id: product.id,
      variant_id: activeVariant?.id ?? null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: activeVariant?.name ?? null,
      image_url: image?.url ?? '',
      unit_price: displayPrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
    setAddingToCart(false);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((w) => !w);
    toast(wishlistd ? 'Removed from wishlist' : 'Added to wishlist ♡');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="product-card">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-beige/30">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt_text || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-beige flex items-center justify-center">
                <span className="font-heading text-3xl text-taupe/40">LN</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.is_bestseller && (
                <span className="badge-gold">Bestseller</span>
              )}
              {hasSale && !isOutOfStock && (
                <span className="badge-sale">{discount}% OFF</span>
              )}
              {isOutOfStock && (
                <span className="badge-oos">Out of Stock</span>
              )}
              {isLowStock && !isOutOfStock && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase bg-amber-100 text-amber-700">
                  Only {activeVariant?.inventory} left
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
                'bg-white/90 backdrop-blur-sm shadow-sm',
                'transition-all duration-200 opacity-0 group-hover:opacity-100',
                'hover:scale-110',
                wishlistd ? 'text-error-red' : 'text-taupe hover:text-error-red'
              )}
              aria-label={wishlistd ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={wishlistd ? 'currentColor' : 'none'} />
            </button>

            {/* Quick View (desktop hover) */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              {isOutOfStock ? (
                <button className="w-full py-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-body font-medium text-taupe flex items-center justify-center gap-1.5">
                  <Eye size={13} />
                  Notify Me
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-body font-medium flex items-center justify-center gap-1.5',
                    'bg-obsidian/95 backdrop-blur-sm text-ivory',
                    'hover:bg-charcoal transition-colors duration-200',
                    addingToCart && 'opacity-70'
                  )}
                >
                  <ShoppingBag size={13} />
                  {addingToCart ? 'Adding...' : 'Quick Add'}
                </button>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3 lg:p-4">
            {/* Category */}
            {product.category && (
              <p className="text-[10px] font-body font-medium text-taupe/70 uppercase tracking-wider mb-1">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h3 className="font-body font-medium text-sm text-obsidian line-clamp-2 leading-snug mb-1 group-hover:text-gold transition-colors">
              {product.name}
            </h3>

            {/* Tagline */}
            <p className="text-[11px] font-body text-taupe line-clamp-1 mb-2">
              {product.tagline}
            </p>

            {/* Rating */}
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < Math.round(product.rating_avg) ? 'text-gold fill-gold' : 'text-beige fill-beige'}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-body text-taupe">({product.rating_count})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm text-obsidian">
                {formatPrice(displayPrice)}
              </span>
              {hasSale && (
                <span className="font-mono text-xs text-taupe line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Variants hint */}
            {product.variants.length > 1 && (
              <p className="text-[10px] font-body text-taupe/60 mt-1">
                {product.variants.length} sizes available
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
