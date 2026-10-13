'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Skincare Trends Edit
// Curates viral trends and integrates matched products with instant checkout
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Flame, Eye, ShoppingBag, Check, 
  ArrowRight, ShieldCheck, RefreshCw, Calendar, CalendarDays
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice } from '@/lib/utils';
import { PriceTag } from '@/components/products/PriceTag';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';

// ── Viral Trends Data ──
const VIRAL_TRENDS = [
  {
    id: 'trend-1',
    title: 'The "Glass Skin" Layering Ritual',
    views: '142M+ Views',
    platform: 'TikTok & Reels',
    concept: 'Achieving a translucent, poreless, and highly hydrated complexion that mimics crystal-clear glass through deep humectant and barrier moisture layering.',
    whyItWorks: 'By prep-hydrating the skin layers with the Glutathione Face Toner and infusing active brightness with the Glutathione Face Serum, the skin reflects light evenly for lasting radiance.',
    matchedProductSlugs: ['lanan-glutathione-face-toner', 'lanan-glutathione-face-serum'],
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent'
  },
  {
    id: 'trend-2',
    title: 'Daily Radiance Reset',
    views: '86M+ Views',
    platform: 'Dermatologist Hotlist',
    concept: 'A strategic daily routine that purifies pores with Salicylic Acid, brightens with Glutathione, and defends against photoaging with broad-spectrum SPF 50 PA++++.',
    whyItWorks: 'Cleansing with active salicylic acid clears excess oil and dullness, while high PA++++ sun protection prevents pigmentation and sun damage.',
    matchedProductSlugs: ['lanan-face-wash', 'lanan-sunscreen-spf-50'],
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent'
  },
  {
    id: 'trend-3',
    title: 'Antioxidant Power Duo',
    views: '52M+ Views',
    platform: 'Instagram Trends',
    concept: 'Layering concentrated Glutathione and Vitamin C serum with protective SPF 50 PA++++ to neutralize oxidative stress and maintain all-day luminosity.',
    whyItWorks: 'Antioxidants supercharge UV defense, ensuring comprehensive protection against UV rays and environmental aggressors.',
    matchedProductSlugs: ['lanan-glutathione-face-serum', 'lanan-sunscreen-spf-50'],
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent'
  }
];

// ── Skin Cycling Planner Config ──
const CYCLE_NIGHTS = [
  {
    day: 'Night 1',
    phase: 'Deep Cleanse & Prep',
    desc: 'Clear away excess sebum, dirt, and impurities with Salicylic Acid 2% and Niacinamide 1% to prep skin.',
    productSlug: 'lanan-face-wash',
    tip: 'Massage gently in circular motions for 60 seconds before rinsing thoroughly.'
  },
  {
    day: 'Night 2',
    phase: 'Hydrate & Refine',
    desc: 'Restore skin hydration, refresh tired complexion, and reveal your natural glow with Glutathione toner.',
    productSlug: 'lanan-glutathione-face-toner',
    tip: 'Pat gently into damp skin using palms to boost moisture absorption.'
  },
  {
    day: 'Night 3',
    phase: 'Active Brightening',
    desc: 'Target uneven tone, dullness, and fatigue with concentrated Glutathione and Vitamin C serum.',
    productSlug: 'lanan-glutathione-face-serum',
    tip: 'Apply 2-3 drops to fingertips and smooth evenly over face and neck until absorbed.'
  },
  {
    day: 'Night 4',
    phase: 'Hydration Reset',
    desc: 'Give skin a soothing moisture reset and lock in hydration for a supple, healthy-looking glow.',
    productSlug: 'lanan-glutathione-face-toner',
    tip: 'Layer toner generously to refresh moisture reserves before sleep.'
  }
];

export default function TrendsPage() {
  const [activeCycleNight, setActiveCycleNight] = useState('Night 1');
  const { addItem } = useCartStore();

  const handleAddToCart = (product: ProductCardData) => {
    const primaryVariant = product.variants[0];
    addItem({
      product_id: product.id,
      variant_id: primaryVariant?.id || null,
      product_name: product.name,
      product_slug: product.slug,
      variant_name: primaryVariant?.name || null,
      unit_price: primaryVariant?.price ?? product.sale_price ?? product.base_price,
      base_price: primaryVariant?.price ?? product.base_price,
      quantity: 1,
      image_url: product.images[0]?.url || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const getProductBySlug = (slug: string) => {
    return DEMO_PRODUCTS.find((p) => p.slug === slug);
  };

  const currentCycleData = CYCLE_NIGHTS.find((n) => n.day === activeCycleNight)!;
  const matchedPlannerProduct = getProductBySlug(currentCycleData.productSlug);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Banner ── */}
      <section className="bg-gradient-hero border-b border-beige py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-luxury opacity-30" />
        <div className="container-lanan relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/25 rounded-pill px-3 py-1 mb-4">
            <Flame size={12} className="text-gold animate-pulse" />
            <span className="text-gold text-[10px] font-body font-semibold tracking-wider uppercase">The Skincare Edit</span>
          </div>
          <h1 className="font-heading text-4xl lg:text-5xl font-light text-obsidian leading-tight">
            Viral Skincare <em className="italic text-gold">Trends</em>
          </h1>
          <p className="font-body text-xs lg:text-sm text-taupe max-w-lg mx-auto mt-3 leading-relaxed">
            We translate the internet’s favorite skincare movements into scientifically backed daily rituals. Learn the trends, see the results, and shop the exact matching formulas.
          </p>
        </div>
      </section>

      {/* ── Trends Showcase ── */}
      <section className="container-lanan py-16">
        <div className="text-center mb-12">
          <h2 className="section-title">The Seasonal Hotlist</h2>
          <div className="divider-gold mt-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {VIRAL_TRENDS.map((trend) => {
            const matchedProds = trend.matchedProductSlugs
              .map((slug) => getProductBySlug(slug))
              .filter(Boolean) as ProductCardData[];

            return (
              <motion.div
                key={trend.id}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between rounded-card border border-beige bg-white p-6 shadow-sm hover:shadow-luxury hover:border-gold/30 transition-all duration-300 overflow-hidden"
              >
                {/* Accent Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${trend.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  {/* Badge */}
                  <div className="flex justify-between items-center text-[10px] font-body text-taupe font-semibold">
                    <span className="flex items-center gap-1 bg-ivory border border-beige/40 px-2 py-0.5 rounded">
                      <Sparkles size={10} className="text-gold" />
                      {trend.platform}
                    </span>
                    <span className="text-gold uppercase tracking-wider">{trend.views}</span>
                  </div>

                  <h3 className="font-heading text-xl text-obsidian font-light group-hover:text-gold transition-colors">
                    {trend.title}
                  </h3>

                  <p className="text-xs font-body text-taupe leading-relaxed">
                    {trend.concept}
                  </p>

                  <div className="p-3.5 bg-ivory/50 rounded-xl border border-beige/30 text-[11px] font-body text-charcoal leading-relaxed">
                    <strong className="text-gold">Why it works:</strong> {trend.whyItWorks}
                  </div>
                </div>

                {/* Match Products */}
                <div className="relative z-10 mt-8 pt-4 border-t border-beige/40 space-y-3">
                  <span className="text-[10px] font-body font-bold text-obsidian tracking-wider uppercase block">
                    Product Matches
                  </span>
                  
                  <div className="space-y-2.5">
                    {matchedProds.map((prod) => (
                      <div key={prod.id} className="flex gap-3 items-center bg-white p-2 rounded-lg border border-beige/30 hover:border-gold/20 transition-all">
                        <div className="w-10 h-10 relative rounded overflow-hidden bg-ivory flex-shrink-0">
                          <Image
                            src={prod.images[0]?.url || ''}
                            alt={prod.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-body font-semibold text-obsidian truncate">{prod.name}</h4>
                          <div className="mt-0.5">
                            <PriceTag
                              basePrice={prod.base_price}
                              salePrice={prod.sale_price}
                              size="sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-colors"
                          title="Quick Add to Cart"
                        >
                          <ShoppingBag size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Interactive Skin Cycling Planner ── */}
      <section className="bg-ivory/40 border-y border-beige py-16">
        <div className="container-lanan max-w-4xl">
          <div className="text-center mb-8">
            <span className="section-label">Routine Planner</span>
            <h2 className="section-title mt-1">Interactive Skin Cycling Planner</h2>
            <p className="text-xs font-body text-taupe mt-2">
              Select a night in the cycle to schedule your products and understand the barrier recovery mechanism.
            </p>
          </div>

          <div className="grid md:grid-cols-[160px_1fr] gap-8 bg-white rounded-card border border-beige p-6 md:p-8 shadow-sm">
            {/* Left Nav */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {CYCLE_NIGHTS.map((night) => (
                <button
                  key={night.day}
                  onClick={() => setActiveCycleNight(night.day)}
                  className={`px-4 py-2.5 rounded-pill text-xs font-body text-left whitespace-nowrap transition-all flex items-center gap-2 border ${
                    activeCycleNight === night.day
                      ? 'bg-gold border-gold text-obsidian font-semibold shadow-gold'
                      : 'bg-white border-beige/60 text-taupe hover:border-gold/40'
                  }`}
                >
                  <CalendarDays size={12} />
                  {night.day}
                </button>
              ))}
            </div>

            {/* Right details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCycleNight}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-body font-bold text-gold uppercase tracking-wider">
                        {currentCycleData.day} Phase
                      </span>
                      <h3 className="font-heading text-2xl text-obsidian font-light mt-0.5">
                        {currentCycleData.phase}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-body text-charcoal leading-relaxed">
                    {currentCycleData.desc}
                  </p>

                  <div className="bg-ivory/50 rounded-xl p-3.5 border border-beige/40 text-[11px] font-body text-taupe">
                    <strong className="text-obsidian font-semibold block mb-0.5">Expert Tip:</strong>
                    {currentCycleData.tip}
                  </div>
                </div>

                {/* Match Product */}
                {matchedPlannerProduct && (
                  <div className="mt-8 pt-5 border-t border-beige/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 relative bg-ivory rounded-xl overflow-hidden flex-shrink-0 border border-beige/30">
                        <Image
                          src={matchedPlannerProduct.images[0]?.url || ''}
                          alt={matchedPlannerProduct.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-body font-semibold text-obsidian">{matchedPlannerProduct.name}</h4>
                        <p className="text-[10px] font-body text-taupe leading-none mt-0.5">{matchedPlannerProduct.tagline}</p>
                        <div className="mt-1">
                          <PriceTag
                            basePrice={matchedPlannerProduct.base_price}
                            salePrice={matchedPlannerProduct.sale_price}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 w-full sm:w-auto">
                      <Link
                        href={`/products/${matchedPlannerProduct.slug}`}
                        className="btn-outline-gold text-xs py-2 px-5 flex-1 sm:flex-initial justify-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(matchedPlannerProduct)}
                        className="btn-gold text-xs py-2 px-5 flex-1 sm:flex-initial justify-center whitespace-nowrap"
                      >
                        Add to Cycle
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <section className="py-20 relative overflow-hidden bg-white text-center">
        <div className="container-lanan max-w-lg">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto mb-5">
            <ShieldCheck size={20} />
          </div>
          <h2 className="font-heading text-3xl font-light text-obsidian">Skin Health First</h2>
          <p className="text-xs font-body text-taupe mt-3 leading-relaxed">
            Skincare is a personal journey. No matter the trend, always patch-test active formulas and listen to your skin’s barrier signal. When in doubt, prioritize recovery.
          </p>
          <Link href="/shop" className="btn-gold mt-8 justify-center mx-auto">
            Explore All Formulas
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
