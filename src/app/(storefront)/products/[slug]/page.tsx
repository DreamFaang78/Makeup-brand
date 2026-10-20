'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Product Detail Page (PDP)
// Full PDP with gallery, variants, tabs, add to cart, reviews
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ShoppingBag, Zap, ShieldCheck, RefreshCw, Package,
  MapPin, ChevronDown, ChevronLeft, ChevronRight, Heart, Share2, Minus, Plus, Check, ArrowLeft, Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice, discountPercent, cn } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import PriceTag from '@/components/products/PriceTag';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';
import { trackViewContent, trackInitiateCheckout } from '@/lib/metaPixel';

type TabKey = 'description' | 'ingredients' | 'how-to-use' | 'reviews';

const PRODUCT_TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Description' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'how-to-use', label: 'How to Use' },
  { key: 'reviews', label: 'Reviews' },
];

const gallerySlideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 20 : dir < 0 ? -20 : 0,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -20 : dir < 0 ? 20 : 0,
  }),
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProductData() {
      try {
        let currentProduct: ProductCardData | null = null;
        try {
          const singleRes = await fetch(`/api/products/${slug}`);
          const singleData = await singleRes.json();
          if (singleData.success && singleData.product) {
            currentProduct = singleData.product;
          }
        } catch (err) {
          console.warn('Failed to fetch product by handle, checking catalog:', err);
        }

        const catalogRes = await fetch('/api/products');
        const catalogData = await catalogRes.json();
        const catalog: ProductCardData[] =
          catalogData.success && Array.isArray(catalogData.products) && catalogData.products.length > 0
            ? catalogData.products
            : DEMO_PRODUCTS;

        if (!currentProduct) {
          currentProduct = catalog.find((p) => p.slug === slug || p.id === slug) ?? null;
        }

        if (!isMounted) return;
        setProduct(currentProduct);
        if (currentProduct) {
          setSelectedVariant(currentProduct.variants?.[0] ?? null);
          setAllProducts(catalog.filter((p) => p.id !== currentProduct!.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const trackedProductViewRef = useRef<string | null>(null);

  // Meta Pixel ViewContent event
  useEffect(() => {
    if (!product || trackedProductViewRef.current === product.id) return;
    trackedProductViewRef.current = product.id;

    const price = Number(product.sale_price ?? product.base_price ?? 0);
    const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Skincare';

    trackViewContent({
      id: product.id || product.slug,
      name: product.name,
      price,
      currency: 'INR',
      category: categoryName,
    });
  }, [product]);

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);

  // User-submitted review state
  const [reviewsList, setReviewsList] = useState<Array<{
    name: string;
    location: string;
    rating: number;
    title?: string;
    text: string;
    verified: boolean;
  }>>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    rating: 5,
    title: '',
    text: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.text.trim()) {
      toast.error('Please enter your name and review message.');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      const added = {
        name: newReview.name.trim(),
        location: newReview.location.trim() || 'Verified Customer',
        rating: newReview.rating,
        title: newReview.title.trim(),
        text: newReview.text.trim(),
        verified: true,
      };
      setReviewsList((prev) => [added, ...prev]);
      setNewReview({ name: '', location: '', rating: 5, title: '', text: '' });
      setShowReviewForm(false);
      setIsSubmittingReview(false);
      toast.success('Thank you! Your review has been submitted.');
    }, 400);
  };

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const totalImages = product?.images?.length ?? 0;

  const handlePrevImage = () => {
    if (totalImages <= 1) return;
    setDirection(-1);
    setActiveImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (totalImages <= 1) return;
    setDirection(1);
    setActiveImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleSelectImage = (index: number) => {
    if (index === activeImage) return;
    setDirection(index > activeImage ? 1 : -1);
    setActiveImage(index);
  };

  // Keep thumbnail strip centered on active thumbnail
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    const activeThumb = thumbnailRefs.current[activeImage];
    if (container && activeThumb) {
      const thumbLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.offsetWidth;
      const containerWidth = container.clientWidth;
      const targetScrollLeft = thumbLeft - containerWidth / 2 + thumbWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [activeImage]);

  // Touch swipe gesture handlers (pan-y compliant)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Must be predominantly horizontal and at least 35px
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-gold mx-auto" size={32} />
          <p className="font-heading text-lg text-obsidian font-light">Loading Formulation...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-ivory flex flex-col items-center justify-center text-center p-6">
        <p className="font-heading text-3xl text-obsidian font-light mb-3">Product Not Found</p>
        <p className="text-sm font-body text-taupe mb-6 max-w-sm">The formulation you are looking for may have been removed or is no longer available.</p>
        <Link href="/shop" className="btn-gold flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Collection
        </Link>
      </div>
    );
  }

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
      base_price: originalPrice,
      quantity: qty,
    });
    toast.success(`${product.name} added to cart!`);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    const currentPrice = Number(displayPrice) || 0;
    trackInitiateCheckout({
      items: [
        {
          id: product.id,
          name: product.name,
          price: currentPrice,
          quantity: qty,
        },
      ],
      value: currentPrice * qty,
      currency: 'INR',
      num_items: qty,
    });

    const variantId = selectedVariant?.id;
    if (variantId) {
      try {
        const res = await fetch('/api/shopify/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'checkout',
            lines: [{ merchandiseId: variantId, quantity: qty }],
          }),
        });
        const data = await res.json();
        if (data?.success && data?.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      } catch (err) {
        console.warn('Direct checkout handoff failed, redirecting to checkout page:', err);
      }
    }
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
      <div className="border-b border-beige/60 bg-ivory/80 backdrop-blur-xs">
        <div className="container-lanan py-2.5 sm:py-3">
          <nav className="text-xs font-body text-taupe flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold transition-colors flex-shrink-0">Home</Link>
            <span className="text-beige-dark flex-shrink-0">›</span>
            <Link href="/shop" className="hover:text-gold transition-colors flex-shrink-0">Shop</Link>
            {product.category?.name && (
              <>
                <span className="text-beige-dark flex-shrink-0">›</span>
                <Link
                  href={`/shop?category=${product.category.slug || product.category.name.toLowerCase()}`}
                  className="hover:text-gold transition-colors flex-shrink-0 hidden xs:inline"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-beige-dark flex-shrink-0">›</span>
            <span className="text-obsidian font-medium truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[320px] md:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-lanan py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-16 items-start w-full min-w-0">

          {/* ── LEFT: Gallery ── */}
          <div className="w-full min-w-0 space-y-3 sm:space-y-4">
            {/* Main Image Container */}
            <div
              tabIndex={totalImages > 1 ? 0 : -1}
              onKeyDown={(e) => {
                if (totalImages <= 1) return;
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  handlePrevImage();
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  handleNextImage();
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-roledescription="carousel"
              aria-label={`${product.name} image gallery`}
              className="relative w-full max-w-full aspect-square rounded-card overflow-hidden bg-ivory border border-beige/60 shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 touch-pan-y select-none"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeImage}
                  custom={direction}
                  variants={gallerySlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute inset-0 flex items-center justify-center p-3 sm:p-5"
                >
                  <Image
                    src={product.images[activeImage]?.url ?? '/serum-bottle.jpeg'}
                    alt={product.images[activeImage]?.alt_text ?? product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    className="object-contain p-2 sm:p-4 select-none pointer-events-none"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges - Top Left */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.is_bestseller && (
                  <span className="badge-gold text-[10px] sm:text-xs shadow-xs">Bestseller</span>
                )}
                {hasSale && (
                  <span className="badge-sale lanan-sale-badge-pulse text-[10px] sm:text-xs shadow-xs">
                    SAVE {discount}%
                  </span>
                )}
              </div>

              {/* Actions (Wishlist & Share) - Top Right */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setWishlisted((w) => !w);
                    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡');
                  }}
                  className={cn(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer',
                    wishlisted ? 'text-error-red' : 'text-taupe hover:text-error-red'
                  )}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                    } else if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Product link copied to clipboard!');
                    }
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-sm text-taupe hover:text-gold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Share product"
                >
                  <Share2 size={15} />
                </button>
              </div>

              {/* Sliding Arrow Controls & Counter (Only when multiple images) */}
              {totalImages > 1 && (
                <>
                  {/* Previous Arrow Button - Bottom Left */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/95 hover:bg-white text-obsidian hover:text-gold border border-beige/80 shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 touch-manipulation group"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="sm:w-[22px] sm:h-[22px] -translate-x-0.5 transition-colors group-hover:text-gold" strokeWidth={1.75} />
                  </button>

                  {/* Image Counter Pill - Bottom Center */}
                  <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 z-20 bg-obsidian/80 backdrop-blur-sm px-3 py-1 rounded-pill text-[10px] sm:text-[11px] font-mono font-medium text-ivory border border-gold/25 shadow-xs pointer-events-none select-none tracking-wider whitespace-nowrap"
                  >
                    <span>{activeImage + 1}</span>
                    <span className="opacity-60 mx-1">/</span>
                    <span>{totalImages}</span>
                  </div>

                  {/* Next Arrow Button - Bottom Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/95 hover:bg-white text-obsidian hover:text-gold border border-beige/80 shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 touch-manipulation group"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="sm:w-[22px] sm:h-[22px] translate-x-0.5 transition-colors group-hover:text-gold" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {totalImages > 1 && (
              <div className="relative w-full max-w-full min-w-0">
                <div
                  ref={thumbnailContainerRef}
                  className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto w-full max-w-full py-1 px-0.5 scrollbar-none scroll-hidden scroll-smooth"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {product.images.map((img, i) => (
                    <button
                      key={img.id || i}
                      ref={(el) => { thumbnailRefs.current[i] = el; }}
                      type="button"
                      onClick={() => handleSelectImage(i)}
                      className={cn(
                        'flex-shrink-0 relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer',
                        activeImage === i
                          ? 'border-gold shadow-xs ring-2 ring-gold/20 scale-102'
                          : 'border-beige/70 hover:border-gold/50 opacity-80 hover:opacity-100'
                      )}
                      aria-label={`View product image ${i + 1} of ${totalImages}`}
                      aria-pressed={activeImage === i}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt_text || `${product.name} thumbnail ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="w-full min-w-0 space-y-4 sm:space-y-5">
            {/* Category */}
            <p className="text-[11px] sm:text-xs font-body font-semibold text-gold uppercase tracking-[0.18em]">
              {product.category?.name ?? 'Skincare'}
            </p>

            {/* Name */}
            <h1 className="font-heading font-light text-obsidian text-2xl sm:text-3xl lg:text-4xl leading-[1.18] tracking-tight break-words">
              {product.name}
            </h1>

            {/* Tagline */}
            {product.tagline && (
              <p className="font-body text-taupe text-xs sm:text-sm leading-relaxed break-words">
                {product.tagline}
              </p>
            )}

            {/* Rating */}
            {(() => {
              const count = reviewsList.length > 0 ? reviewsList.length : product.rating_count;
              const avg = reviewsList.length > 0
                ? Number((reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1))
                : product.rating_avg;

              return count > 0 ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < Math.round(avg) ? 'text-gold fill-gold' : 'text-beige fill-beige'} />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-body font-semibold text-obsidian">{avg}</span>
                  <span className="text-xs font-body text-taupe">({count} {count === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-body text-taupe">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="text-beige fill-beige/40" />
                    ))}
                  </div>
                  <span className="text-taupe">No reviews yet</span>
                  <span className="text-gold/60">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reviews');
                      setShowReviewForm(true);
                    }}
                    className="text-gold hover:underline font-medium cursor-pointer"
                  >
                    Be the first to review
                  </button>
                </div>
              );
            })()}

            {/* Price with Original -> Sale -> SAVE % loop animation */}
            <div className="py-1">
              <PriceTag
                basePrice={originalPrice}
                salePrice={hasSale ? displayPrice : null}
                size="lg"
                animate={true}
              />
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-body font-semibold text-obsidian uppercase tracking-wider">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image_url) {
                          const imgIdx = product.images.findIndex((img) => img.url === v.image_url);
                          if (imgIdx !== -1) setActiveImage(imgIdx);
                        }
                      }}
                      className={cn(
                        'px-3.5 py-2 rounded-xl border text-xs font-body font-medium transition-all cursor-pointer',
                        selectedVariant?.id === v.id
                          ? 'border-gold bg-gold/10 text-gold font-semibold shadow-xs'
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
                'text-xs font-body font-medium flex items-center gap-1.5',
                isOutOfStock ? 'text-error-red' : 'text-success-green'
              )}>
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', isOutOfStock ? 'bg-error-red' : 'bg-success-green')} />
                <span>{isOutOfStock ? 'Currently Unavailable' : 'In Stock & Ready to Ship'}</span>
              </p>
            )}

            {/* Qty + CTA */}
            <div className="flex gap-2 sm:gap-3 items-stretch">
              {/* Qty Selector */}
              <div className="flex items-center border border-beige rounded-xl bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 sm:w-10 h-11 flex items-center justify-center hover:bg-beige/40 transition-colors rounded-l-xl text-obsidian cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 sm:w-10 text-center font-mono text-xs sm:text-sm font-semibold text-obsidian">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="w-8 sm:w-10 h-11 flex items-center justify-center hover:bg-beige/40 transition-colors rounded-r-xl text-obsidian cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={cn(
                  'flex-1 min-w-0 btn-dark flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium rounded-pill transition-all cursor-pointer',
                  (isOutOfStock || addingToCart) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {addingToCart ? (
                  <><Check size={15} className="flex-shrink-0" /><span className="truncate">Added!</span></>
                ) : isOutOfStock ? (
                  <span className="truncate">Out of Stock</span>
                ) : (
                  <><ShoppingBag size={15} className="flex-shrink-0" /><span className="truncate">Add to Cart</span></>
                )}
              </button>
            </div>

            {/* Buy Now */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full btn-gold justify-center py-3 sm:py-3.5 text-xs sm:text-sm font-semibold shadow-gold hover:shadow-gold-lg cursor-pointer"
              >
                <Zap size={15} />
                Buy Now
              </button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              {[
                { icon: <ShieldCheck size={14} className="text-gold flex-shrink-0" />, label: 'Secure Payment' },
                { icon: <Package size={14} className="text-gold flex-shrink-0" />, label: 'Authentic Product' },
                { icon: <RefreshCw size={14} className="text-gold flex-shrink-0" />, label: 'Easy Returns' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center justify-center gap-1 p-2 sm:p-3 rounded-xl border border-beige/70 bg-ivory/30 text-center min-w-0">
                  <span>{badge.icon}</span>
                  <span className="text-[9px] sm:text-[10px] font-body text-taupe leading-tight break-words">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Pincode Checker */}
            <div className="border border-beige/70 rounded-xl p-3.5 sm:p-4 bg-ivory/20">
              <p className="text-xs font-body font-semibold text-obsidian mb-2 flex items-center gap-1.5">
                <MapPin size={13} className="text-gold" />
                Check Pan-India Delivery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-beige bg-white text-xs font-body text-obsidian focus:outline-none focus:border-gold transition-colors placeholder:text-taupe/50"
                />
                <button
                  type="button"
                  onClick={checkPincode}
                  className="px-4 py-2.5 rounded-xl bg-obsidian text-ivory text-xs font-body font-medium hover:bg-charcoal transition-colors flex-shrink-0 cursor-pointer"
                >
                  Check
                </button>
              </div>
              {pincodeResult && (
                <p className={cn(
                  'text-xs font-body mt-2 leading-relaxed',
                  pincodeResult.startsWith('✓') ? 'text-success-green' : 'text-error-red'
                )}>
                  {pincodeResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Product Tabs ── */}
        <div className="mt-10 sm:mt-14 w-full min-w-0">
          {/* Tab Headers */}
          <div
            className="border-b border-beige flex gap-1 sm:gap-2 overflow-x-auto w-full max-w-full min-w-0 scrollbar-none scroll-hidden scroll-smooth"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 px-3.5 sm:px-5 py-3 text-xs sm:text-sm font-body font-medium border-b-2 transition-all cursor-pointer',
                  activeTab === tab.key
                    ? 'border-gold text-gold font-semibold'
                    : 'border-transparent text-taupe hover:text-obsidian'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-6 sm:py-8 w-full min-w-0 max-w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl min-w-0">
                  <p className="font-body text-charcoal text-xs sm:text-sm leading-relaxed">
                    {product.name} is a premium skincare formula crafted specifically for Indian skin. Our expertly selected ingredients work synergistically to address your specific skin concerns while maintaining your skin's natural balance. Suitable for daily use, morning and evening, as part of your complete skincare ritual.
                  </p>
                  <p className="font-body text-charcoal text-xs sm:text-sm leading-relaxed mt-4">
                    Each LANAN product is thoughtfully formulated to be gentle yet effective. We never use harsh sulfates, parabens, or artificial fragrances that can irritate sensitive skin. What you get is pure, purposeful skincare.
                  </p>
                  <ul className="mt-5 sm:mt-6 space-y-2">
                    {['Dermatologist tested formula', 'No harmful parabens or sulfates', 'Cruelty-free and vegan', 'Suitable for all Indian skin tones', 'Fragrance-free option available'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs sm:text-sm font-body text-charcoal">
                        <Check size={13} className="text-success-green flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'ingredients' && (
                <motion.div key="ing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl min-w-0">
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-3.5 sm:p-4 mb-5">
                    <p className="text-xs font-body text-taupe leading-relaxed">
                      ✦ LANAN believes in full ingredient transparency. We list every ingredient and why it's there.
                    </p>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-charcoal leading-relaxed">
                    <span className="font-semibold text-obsidian">Key Active Ingredients: </span>
                    {product.ingredients || 'Hyaluronic Acid, Niacinamide, Kashmiri Saffron Extract, Panthenol, Allantoin.'}
                  </p>
                  <p className="font-body text-xs sm:text-sm text-charcoal leading-relaxed mt-4">
                    <span className="font-semibold text-obsidian">Full Ingredient List: </span>
                    Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Crocus Sativus (Saffron) Extract,
                    Panthenol, Allantoin, Tocopherol, Cetearyl Alcohol, Sodium PCA, Carbomer,
                    Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.
                  </p>
                </motion.div>
              )}

              {activeTab === 'how-to-use' && (
                <motion.div key="htu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl min-w-0">
                  <div className="space-y-3.5 sm:space-y-4">
                    {(product.how_to_use && product.how_to_use.length > 0 ? product.how_to_use : [
                      'Start with a clean, dry face.',
                      'Apply a few drops (serum) or pea-sized amount (cream) to fingertips.',
                      'Gently press and massage into skin in upward circular motions.',
                      'Allow to absorb for 60 seconds before applying next product.',
                      'For best results, use morning and evening consistently.',
                      'Always follow with SPF 30+ during the day.',
                    ]).map((step, i) => (
                      <div key={i} className="flex gap-3 sm:gap-4 items-start">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-mono font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-xs sm:text-sm font-body text-charcoal leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div key="rev" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="min-w-0">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b border-beige/60">
                    <div>
                      <h3 className="font-heading text-xl text-obsidian">Customer Reviews</h3>
                      <p className="text-xs font-body text-taupe mt-0.5">Verified feedback from our skincare community</p>
                    </div>
                    {!showReviewForm && (
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(true)}
                        className="btn-gold text-xs px-4 py-2 cursor-pointer shadow-xs"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="mb-8 p-5 sm:p-6 rounded-2xl border border-gold/30 bg-gold/5 shadow-xs">
                      <h4 className="font-heading text-lg text-obsidian mb-1">Write a Review</h4>
                      <p className="text-xs font-body text-taupe mb-4">Share your feedback to help others discover their skincare ritual.</p>

                      <div className="space-y-4 font-body">
                        <div>
                          <label className="text-xs text-obsidian font-semibold block mb-1.5">Rating *</label>
                          <div className="flex gap-1.5 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview((r) => ({ ...r, rating: star }))}
                                className="p-1 cursor-pointer hover:scale-110 transition-transform"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  size={22}
                                  className={star <= newReview.rating ? 'text-gold fill-gold' : 'text-beige fill-beige/40'}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-mono font-semibold text-gold ml-2">
                              {newReview.rating} / 5 Stars
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-obsidian font-medium block mb-1">Your Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Aditi Sharma"
                              value={newReview.name}
                              onChange={(e) => setNewReview((r) => ({ ...r, name: e.target.value }))}
                              className="input-luxury text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-obsidian font-medium block mb-1">City / Region</label>
                            <input
                              type="text"
                              placeholder="e.g. Mumbai, Maharashtra"
                              value={newReview.location}
                              onChange={(e) => setNewReview((r) => ({ ...r, location: e.target.value }))}
                              className="input-luxury text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-obsidian font-medium block mb-1">Review Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Visible glow in two weeks!"
                            value={newReview.title}
                            onChange={(e) => setNewReview((r) => ({ ...r, title: e.target.value }))}
                            className="input-luxury text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-obsidian font-medium block mb-1">Your Review *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tell us about the texture, absorption, how it feels on your skin, and results..."
                            value={newReview.text}
                            onChange={(e) => setNewReview((r) => ({ ...r, text: e.target.value }))}
                            className="input-luxury text-xs resize-none"
                          />
                        </div>

                        <div className="flex gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="btn-outline-gold text-xs px-4 py-2 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="btn-gold text-xs px-6 py-2 cursor-pointer"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {reviewsList.length === 0 ? (
                    <div className="text-center py-12 px-6 rounded-2xl border border-beige/60 bg-ivory/30">
                      <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-3">
                        <Sparkles size={20} />
                      </div>
                      <h4 className="font-heading text-lg text-obsidian mb-1">No Customer Reviews Yet</h4>
                      <p className="text-xs font-body text-taupe max-w-sm mx-auto mb-5 leading-relaxed">
                        Be the first to share your experience with this formulation. Your honest feedback helps others find the right skincare ritual.
                      </p>
                      {!showReviewForm && (
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(true)}
                          className="btn-gold text-xs px-5 py-2.5 cursor-pointer shadow-xs"
                        >
                          Write the First Review
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviewsList.map((rev, i) => (
                        <div key={i} className="p-4 sm:p-5 rounded-xl border border-beige/70 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold font-mono">
                                {rev.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-body font-semibold">{rev.name}</p>
                                <p className="text-[10px] text-taupe">{rev.location}</p>
                              </div>
                            </div>
                            {rev.verified && (
                              <span className="text-[9px] bg-success-green/10 text-success-green px-2 py-0.5 rounded-full font-semibold">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                size={11}
                                className={j < rev.rating ? 'text-gold fill-gold' : 'text-beige fill-beige'}
                              />
                            ))}
                          </div>
                          {rev.title && <p className="text-xs font-body font-bold text-obsidian mb-1">{rev.title}</p>}
                          <p className="text-xs font-body text-charcoal leading-relaxed">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-beige w-full min-w-0">
          <h2 className="font-heading text-xl sm:text-2xl text-obsidian mb-5 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-stretch w-full min-w-0">
            {allProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
