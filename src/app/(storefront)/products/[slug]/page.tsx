'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Detail Page (PDP)
// Full PDP with gallery, variants, tabs, add to cart, reviews
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ShoppingBag, Zap, ShieldCheck, RefreshCw, Package,
  MapPin, ChevronDown, Heart, Share2, Minus, Plus, Check
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice, discountPercent, cn } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import { toast } from 'sonner';

type TabKey = 'description' | 'ingredients' | 'how-to-use' | 'reviews';

const PRODUCT_TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Description' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'how-to-use', label: 'How to Use' },
  { key: 'reviews', label: 'Reviews' },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const product = DEMO_PRODUCTS.find((p) => p.slug === slug) ?? DEMO_PRODUCTS[0];
  const allProducts = DEMO_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  const displayPrice = selectedVariant?.sale_price ?? selectedVariant?.price ?? product.sale_price ?? product.base_price;
  const originalPrice = selectedVariant?.price ?? product.base_price;
  const hasSale = displayPrice < originalPrice;
  const discount = hasSale ? discountPercent(originalPrice, displayPrice) : 0;
  const isOutOfStock = selectedVariant ? selectedVariant.inventory <= 0 : false;

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    await new Promise((r) => setTimeout(r, 400));
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: selectedVariant?.name ?? null,
      image_url: product.images[0]?.url ?? '',
      unit_price: displayPrice,
      quantity: qty,
    });
    toast.success(`${product.name} added to cart!`);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    window.location.href = '/checkout';
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeResult('Please enter a valid 6-digit pincode.');
      return;
    }
    // Demo: most major pincodes are serviceable
    setPincodeResult(`✓ Delivery available to ${pincode}. Estimated delivery: 3-5 business days.`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="border-b border-beige bg-ivory">
        <div className="container-lanan py-3">
          <nav className="text-xs font-body text-taupe flex items-center gap-2">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <span>›</span>
            <span className="text-obsidian">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-lanan py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── LEFT: Gallery ── */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square rounded-card overflow-hidden bg-beige/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[activeImage]?.url ?? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop'}
                    alt={product.images[activeImage]?.alt_text ?? product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_bestseller && <span className="badge-gold">Bestseller</span>}
                {hasSale && <span className="badge-sale">{discount}% OFF</span>}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center bg-white/90 shadow-sm transition-all hover:scale-110',
                    wishlisted ? 'text-error-red' : 'text-taupe'
                  )}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 shadow-sm text-taupe hover:text-gold transition-colors">
                  <Share2 size={15} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scroll-hidden">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                      activeImage === i ? 'border-gold' : 'border-transparent'
                    )}
                  >
                    <Image src={img.url} alt={img.alt_text} width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="space-y-5">
            {/* Category */}
            <p className="text-xs font-body font-semibold text-gold uppercase tracking-[0.15em]">
              {product.category?.name ?? 'Skincare'}
            </p>

            {/* Name */}
            <h1 className="font-heading font-light text-obsidian">{product.name}</h1>

            {/* Tagline */}
            <p className="font-body text-taupe text-sm leading-relaxed">{product.tagline}</p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating_avg) ? 'text-gold fill-gold' : 'text-beige fill-beige'} />
                ))}
              </div>
              <span className="text-sm font-body font-medium text-obsidian">{product.rating_avg}</span>
              <span className="text-xs font-body text-taupe">({product.rating_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-mono text-2xl font-semibold text-obsidian">{formatPrice(displayPrice)}</span>
              {hasSale && (
                <>
                  <span className="font-mono text-base text-taupe line-through">{formatPrice(originalPrice)}</span>
                  <span className="badge-sale">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <p className="text-xs font-body font-semibold text-obsidian uppercase tracking-wider mb-2">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        'px-4 py-2 rounded-xl border text-xs font-body font-medium transition-all',
                        selectedVariant?.id === v.id
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-beige text-charcoal hover:border-gold/40',
                        v.inventory <= 0 && 'opacity-40 cursor-not-allowed line-through'
                      )}
                      disabled={v.inventory <= 0}
                    >
                      {v.name}
                      {v.sale_price && (
                        <span className="ml-1 text-gold font-mono">{formatPrice(v.sale_price)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            {selectedVariant && (
              <p className={cn(
                'text-xs font-body font-medium',
                isOutOfStock ? 'text-error-red' : selectedVariant.inventory <= 5 ? 'text-amber-600' : 'text-success-green'
              )}>
                {isOutOfStock
                  ? 'Out of Stock'
                  : selectedVariant.inventory <= 5
                    ? `Only ${selectedVariant.inventory} left in stock`
                    : 'In Stock'}
              </p>
            )}

            {/* Qty + CTA */}
            <div className="flex gap-3 items-center">
              {/* Qty Selector */}
              <div className="flex items-center border border-beige rounded-xl">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-beige transition-colors rounded-l-xl"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-mono text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-beige transition-colors rounded-r-xl"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={cn(
                  'flex-1 btn-dark flex items-center justify-center gap-2 py-3.5',
                  (isOutOfStock || addingToCart) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {addingToCart ? (
                  <><Check size={16} /> Added!</>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <><ShoppingBag size={16} /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Buy Now */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full btn-gold justify-center py-3.5"
              >
                <Zap size={16} />
                Buy Now
              </button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: <ShieldCheck size={14} />, label: 'Secure Payment' },
                { icon: <Package size={14} />, label: 'Authentic Product' },
                { icon: <RefreshCw size={14} />, label: 'Easy Returns' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-beige text-center">
                  <span className="text-gold">{badge.icon}</span>
                  <span className="text-[10px] font-body text-taupe">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Pincode Checker */}
            <div className="border border-beige rounded-xl p-4">
              <p className="text-xs font-body font-semibold text-obsidian mb-2.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-gold" />
                Check Delivery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
                  className="input-luxury flex-1 text-xs py-2.5"
                />
                <button onClick={checkPincode} className="px-4 rounded-xl bg-obsidian text-ivory text-xs font-body hover:bg-charcoal transition-colors">
                  Check
                </button>
              </div>
              {pincodeResult && (
                <p className={cn(
                  'text-xs font-body mt-2',
                  pincodeResult.startsWith('✓') ? 'text-success-green' : 'text-error-red'
                )}>
                  {pincodeResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Product Tabs ── */}
        <div className="mt-14">
          {/* Tab Headers */}
          <div className="border-b border-beige flex gap-0 overflow-x-auto scroll-hidden">
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 px-5 py-3.5 text-sm font-body font-medium border-b-2 transition-all',
                  activeTab === tab.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-taupe hover:text-obsidian'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
                  <p className="font-body text-charcoal text-sm leading-relaxed">
                    {product.name} is a premium skincare formula crafted specifically for Indian skin. Our expertly selected ingredients work synergistically to address your specific skin concerns while maintaining your skin's natural balance. Suitable for daily use, morning and evening, as part of your complete skincare ritual.
                  </p>
                  <p className="font-body text-charcoal text-sm leading-relaxed mt-4">
                    Each LANAN product is thoughtfully formulated to be gentle yet effective. We never use harsh sulfates, parabens, or artificial fragrances that can irritate sensitive skin. What you get is pure, purposeful skincare.
                  </p>
                  <ul className="mt-6 space-y-2">
                    {['Dermatologist tested formula', 'No harmful parabens or sulfates', 'Cruelty-free and vegan', 'Suitable for all Indian skin tones', 'Fragrance-free option available'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm font-body text-charcoal">
                        <Check size={13} className="text-success-green flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'ingredients' && (
                <motion.div key="ing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-5">
                    <p className="text-xs font-body text-taupe">
                      ✦ LANAN believes in full ingredient transparency. We list every ingredient and why it's there.
                    </p>
                  </div>
                  <p className="font-body text-sm text-charcoal leading-relaxed">
                    <span className="font-semibold">Key Active Ingredients: </span>
                    Hyaluronic Acid (3 molecular weights for deep hydration), Niacinamide 10% (brightening & pore refinement),
                    Saffron Extract (Indian skin radiance), Panthenol (barrier repair), Allantoin (soothing).
                  </p>
                  <p className="font-body text-sm text-charcoal leading-relaxed mt-4">
                    <span className="font-semibold">Full Ingredient List: </span>
                    Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Crocus Sativus (Saffron) Extract,
                    Panthenol, Allantoin, Tocopherol, Cetearyl Alcohol, Sodium PCA, Carbomer,
                    Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.
                  </p>
                </motion.div>
              )}

              {activeTab === 'how-to-use' && (
                <motion.div key="htu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl">
                  <div className="space-y-4">
                    {[
                      'Start with a clean, dry face.',
                      'Apply a few drops (serum) or pea-sized amount (cream) to fingertips.',
                      'Gently press and massage into skin in upward circular motions.',
                      'Allow to absorb for 60 seconds before applying next product.',
                      'For best results, use morning and evening consistently.',
                      'Always follow with SPF 30+ during the day.',
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm font-body text-charcoal leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div key="rev" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-center">
                      <p className="font-heading text-5xl font-light">{product.rating_avg}</p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < Math.round(product.rating_avg) ? 'text-gold fill-gold' : 'text-beige fill-beige'} />
                        ))}
                      </div>
                      <p className="text-xs font-body text-taupe mt-1">{product.rating_count} reviews</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'Absolutely love this product! My skin feels so much better after just 2 weeks. The texture is light and absorbs quickly.', verified: true },
                      { name: 'Anjali R.', location: 'Bangalore', rating: 4, text: 'Great product for the price. I can see visible improvement in my skin tone. Will definitely repurchase!', verified: true },
                      { name: 'Kavita M.', location: 'Delhi', rating: 5, text: 'LANAN products are just amazing. This is my second purchase and I am very happy with the results.', verified: false },
                    ].map((review, i) => (
                      <div key={i} className="p-5 rounded-xl border border-beige">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold font-mono">
                              {review.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-body font-semibold">{review.name}</p>
                              <p className="text-[10px] text-taupe">{review.location}</p>
                            </div>
                          </div>
                          {review.verified && (
                            <span className="text-[9px] bg-success-green/10 text-success-green px-2 py-0.5 rounded-full font-semibold">Verified Purchase</span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={11} className={j < review.rating ? 'text-gold fill-gold' : 'text-beige fill-beige'} />
                          ))}
                        </div>
                        <p className="text-xs font-body text-charcoal leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-10 pt-10 border-t border-beige">
          <h2 className="font-heading text-2xl text-obsidian mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
