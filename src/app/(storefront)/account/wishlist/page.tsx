'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Wishlist Page (/account/wishlist)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { calculateProductPrice } from '@/lib/utils';
import PriceTag from '@/components/products/PriceTag';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import type { ProductCardData } from '@/types/product';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Match wishlisted IDs/slugs to catalog products
  const wishlistedProducts: ProductCardData[] = DEMO_PRODUCTS.filter((product) =>
    items.includes(product.id) || items.includes(product.slug)
  );

  const handleAddToCart = (product: ProductCardData) => {
    const activeVariant = product.variants?.find((v) => v.is_active) ?? product.variants?.[0];
    const pricing = calculateProductPrice(
      product.base_price || activeVariant?.price,
      product.sale_price ?? activeVariant?.sale_price
    );
    const image = product.images?.[0];

    addItem({
      product_id: product.id,
      variant_id: activeVariant?.id ?? null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: activeVariant?.name ?? null,
      image_url: image?.url ?? '',
      unit_price: pricing.discountedPrice,
      base_price: pricing.originalPrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to your bag!`);
    toggleCart();
  };

  return (
    <div className="min-h-screen bg-sand-50/30 pb-24">
      {/* ── Header ── */}
      <section className="relative py-16 bg-gradient-hero border-b border-gold/15">
        <div className="container-lanan text-center max-w-2xl mx-auto">
          <p className="section-label mb-2">Saved Formulations</p>
          <h1 className="font-heading text-4xl sm:text-5xl text-obsidian font-light tracking-tight">
            My <span className="text-gradient-gold italic">Wishlist</span>
          </h1>
          <p className="font-body text-taupe text-sm mt-3">
            {wishlistedProducts.length === 0
              ? 'Your personal curation of desired LANAN rituals.'
              : `You have saved ${wishlistedProducts.length} ${wishlistedProducts.length === 1 ? 'formulation' : 'formulations'} to your personal ritual.`}
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container-lanan mt-10">
        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-2xl border border-gold/20 shadow-subtle">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5 text-gold">
              <Heart size={30} className="stroke-[1.5]" />
            </div>
            <h2 className="font-heading text-2xl text-obsidian font-light mb-2">Your Wishlist is Empty</h2>
            <p className="font-body text-taupe text-sm mb-8 leading-relaxed">
              Explore our luxury Ayurvedic-backed skincare formulations and tap the heart icon on any product to save it here.
            </p>
            <div className="space-y-3">
              <Link
                href="/shop"
                className="btn-gold w-full justify-center text-sm py-3 rounded-pill inline-flex items-center gap-2 cursor-pointer"
              >
                Explore Formulations <ArrowRight size={16} />
              </Link>
              <Link
                href="/skin-analysis"
                className="btn-outline-gold w-full justify-center text-xs py-2.5 rounded-pill inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} /> Take Free AI Skin Analysis
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gold/15 mb-8">
              <span className="font-body text-xs font-semibold tracking-widest uppercase text-charcoal/70">
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'Item' : 'Items'} Saved
              </span>
              <button
                onClick={() => {
                  clearWishlist();
                  toast.info('Wishlist cleared.');
                }}
                className="text-xs font-body text-taupe hover:text-error-red transition-colors cursor-pointer"
              >
                Clear all items
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistedProducts.map((product) => {
                const img = product.images?.[0]?.url || '/images/products/facewash.png';

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gold/20 overflow-hidden shadow-subtle hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square bg-[#FDFBF7] overflow-hidden p-6 flex items-center justify-center">
                      <Link href={`/products/${product.slug}`} className="w-full h-full relative block">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeItem(product.id);
                          removeItem(product.slug);
                          toast.info(`${product.name} removed from wishlist.`);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-taupe hover:text-error-red hover:bg-white transition-colors cursor-pointer shadow-sm"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Details Area */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        {product.category?.name && (
                          <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-gold mb-1">
                            {product.category.name}
                          </p>
                        )}
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-heading text-lg text-obsidian font-normal group-hover:text-gold transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        {product.tagline && (
                          <p className="text-xs font-body text-taupe mt-0.5 line-clamp-1">
                            {product.tagline}
                          </p>
                        )}
                        <div className="mt-3">
                          <PriceTag
                            basePrice={product.base_price}
                            salePrice={product.sale_price}
                            size="sm"
                            animate={true}
                          />
                        </div>
                      </div>

                      {/* Add to Bag CTA */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="mt-5 w-full btn-gold py-2.5 rounded-pill text-xs font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <ShoppingBag size={14} />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
