'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Card Component
// Premium card with 1:1 aspect-square, object-contain, equal-height stretch,
// 2-line title min-height, and bottom-pinned price row.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { discountPercent, cn } from '@/lib/utils';
import PriceTag from '@/components/products/PriceTag';
import type { ProductCardData } from '@/types/product';
import { toast } from 'sonner';

import { useWishlistStore } from '@/store/wishlistStore';

interface Props {
  product: ProductCardData;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id) || isInWishlist(product.slug);

  const image = product.images?.[0];
  const activeVariant = product.variants?.find((v) => v.is_active) ?? product.variants?.[0];

  const originalPrice = product.base_price || activeVariant?.price || 0;
  const displayPrice = product.sale_price ?? activeVariant?.sale_price ?? activeVariant?.price ?? product.base_price ?? 0;
  const hasSale = Boolean(displayPrice && originalPrice && displayPrice < originalPrice);
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
      base_price: originalPrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
    setAddingToCart(false);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleItem(product.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡');
  }

  const categoryName = typeof product.category === 'string'
    ? product.category
    : product.category?.name || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="h-full flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="group block h-full flex flex-col">
        <div className="product-card h-full flex flex-col bg-white rounded-card overflow-hidden border border-beige/40 hover:border-gold/30 transition-all duration-300">
          {/* Image Container: 1:1 aspect-square, ivory background, full creative visible */}
          <div className="relative aspect-square w-full overflow-hidden bg-ivory flex items-center justify-center">
            {image?.url ? (
              <Image
                src={image.url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-ivory flex items-center justify-center">
                <span className="font-heading text-3xl text-taupe/40">LANAN</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
              {product.is_bestseller && (
                <span className="badge-gold shadow-xs">Bestseller</span>
              )}
              {hasSale && !isOutOfStock && (
                <span className="badge-sale lanan-sale-badge-pulse shadow-xs">SAVE {discount}%</span>
              )}
              {isOutOfStock && (
                <span className="badge-oos shadow-xs">Out of Stock</span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center z-10',
                'bg-white/90 backdrop-blur-sm shadow-sm',
                'transition-all duration-200 opacity-0 group-hover:opacity-100',
                'hover:scale-110',
                wishlisted ? 'text-error-red opacity-100' : 'text-taupe hover:text-error-red'
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Quick Add (desktop hover) */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
              {isOutOfStock ? (
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-white/95 backdrop-blur-sm text-xs font-body font-medium text-taupe flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye size={13} />
                  Notify Me
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={cn(
                    'w-full py-2 rounded-xl text-xs font-body font-medium flex items-center justify-center gap-1.5 shadow-sm',
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

          {/* Card Body: flex-col and flex-1 so price pinned to bottom */}
          <div className="p-3.5 lg:p-4 flex flex-col flex-1">
            {/* Category */}
            {categoryName && (
              <p className="text-[10px] font-body font-semibold text-taupe/80 uppercase tracking-widest mb-1">
                {categoryName}
              </p>
            )}

            {/* Name: 2 lines with min-height for perfectly uniform grid alignment */}
            <h3 className="font-body font-semibold text-xs sm:text-sm text-obsidian line-clamp-2 min-h-[2.5rem] leading-snug mb-1 group-hover:text-gold transition-colors">
              {product.name}
            </h3>

            {/* Tagline */}
            {product.tagline && (
              <p className="text-[11px] font-body text-taupe line-clamp-1 mb-2" title={product.tagline}>
                {product.tagline}
              </p>
            )}

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

            {/* Price with Original -> Sale -> SAVE %: Pinned to Bottom */}
            <div className="mt-auto pt-2.5 border-t border-beige/40">
              <PriceTag
                basePrice={originalPrice}
                salePrice={hasSale ? displayPrice : null}
                size="md"
                animate={true}
              />
            </div>

            {/* Variants hint */}
            {product.variants && product.variants.length > 1 && (
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
