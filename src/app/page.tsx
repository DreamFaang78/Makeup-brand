'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Homepage
// Hero, Trust Ticker, Bestsellers, Brand Story, Ingredients, Reviews, Newsletter
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Star, ShieldCheck, Leaf, Truck, Sparkles,
  Droplets, FlaskConical, Sun, Wind, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { DEMO_PRODUCTS, DEMO_REVIEWS } from '@/lib/data/products';
import { formatPrice, cn } from '@/lib/utils';

/* ── Animation helpers ── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Trust Ticker ── */
const TRUST_ITEMS = [
  '✦ Made in India',
  '✦ Dermatologist Tested',
  '✦ No Harmful Chemicals',
  '✦ Cruelty Free',
  '✦ Secure Payments',
  '✦ Skin-Friendly Formulas',
  '✦ Free Shipping Above ₹599',
  '✦ Easy 7-Day Returns',
  '✦ Premium Ingredients',
  '✦ Crafted for Indian Skin',
];

function TrustTicker() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];
  return (
    <div className="bg-obsidian overflow-hidden py-3">
      <div className="flex animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((item, i) => (
          <span key={i} className="text-gold text-xs font-body font-medium tracking-widest mx-8">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── INGREDIENTS DATA ── */
const INGREDIENTS = [
  { icon: <Droplets size={20} />, name: 'Hyaluronic Acid', benefit: 'Deep hydration & plumping' },
  { icon: <Sparkles size={20} />, name: 'Niacinamide', benefit: 'Brightening & pore refinement' },
  { icon: <Sun size={20} />, name: 'Saffron Extract', benefit: 'Radiance & even tone' },
  { icon: <Leaf size={20} />, name: 'Aloe Vera', benefit: 'Soothing & calming' },
  { icon: <FlaskConical size={20} />, name: 'Vitamin C', benefit: 'Antioxidant & glow boost' },
  { icon: <Wind size={20} />, name: 'Peptides', benefit: 'Firming & anti-aging' },
];

/* ── HERO STATS ── */
const STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '12+', label: 'Premium Products' },
  { value: '100%', label: 'Skin-Safe Promise' },
];

/* ── SKIN CONCERNS ── */
const SKIN_CONCERNS = [
  { label: 'Pigmentation', href: '/shop?concern=pigmentation', icon: '✦' },
  { label: 'Hydration', href: '/shop?concern=hydration', icon: '✦' },
  { label: 'Acne & Pores', href: '/shop?concern=acne', icon: '✦' },
  { label: 'Anti-Aging', href: '/shop?concern=anti-aging', icon: '✦' },
  { label: 'Brightening', href: '/shop?concern=brightening', icon: '✦' },
  { label: 'Dark Circles', href: '/shop?concern=dark-circles', icon: '✦' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Homepage Component
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [reviewIndex, setReviewIndex] = useState(0);
  const bestsellers = DEMO_PRODUCTS.filter((p) => p.is_bestseller);

  const prevReview = () => setReviewIndex((i) => (i === 0 ? DEMO_REVIEWS.length - 1 : i - 1));
  const nextReview = () => setReviewIndex((i) => (i === DEMO_REVIEWS.length - 1 ? 0 : i + 1));

  return (
    <div className="w-full">

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden bg-gradient-hero mt-[-100px] lg:mt-[-116px] pt-[100px] lg:pt-[116px]">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 bg-pattern-luxury" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #9B7465 0%, transparent 70%)' }} />

        {/* Gold border accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-gold opacity-60" />

        <div className="container-lanan relative z-10 pt-8 pb-16 lg:pt-20 lg:pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">

            {/* Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Pill label */}
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-pill px-4 py-1.5 mb-6">
                  <Sparkles size={12} className="text-gold" />
                  <span className="text-gold text-xs font-body font-medium tracking-widest uppercase">
                    Premium Indian Skincare
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-heading font-light text-obsidian mb-5 leading-[1.05]"
              >
                Luxury Skincare,{' '}
                <em className="italic text-taupe">Crafted for</em>
                <br />
                <span className="text-gradient-gold">Your Everyday</span>
                <br />
                Ritual
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-body text-taupe text-base lg:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0"
              >
                Discover premium skincare essentials designed to make your daily routine feel
                calm, confident, and radiant. Gentle formulas for modern Indian skin.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link href="/shop" className="btn-gold text-sm px-8 py-4">
                  Shop LANAN
                  <ArrowRight size={16} />
                </Link>
                <Link href="/rituals" className="btn-outline-gold text-sm px-8 py-4">
                  Explore Our Ritual
                </Link>
              </motion.div>

              {/* Trust badges inline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {[
                  { icon: <ShieldCheck size={14} />, text: 'Secure Payments' },
                  { icon: <Truck size={14} />, text: 'Fast Delivery' },
                  { icon: <Leaf size={14} />, text: 'Skin-Friendly' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-1.5 text-taupe text-xs font-body">
                    <span className="text-gold">{badge.icon}</span>
                    {badge.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                {/* Decorative circles */}
                <div className="absolute inset-8 rounded-full border border-gold/20 animate-spin-slow" />
                <div className="absolute inset-16 rounded-full border border-gold/10" />

                {/* Main image container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full overflow-hidden shadow-glow-gold bg-gradient-to-br from-beige to-ivory">
                    <video
                      src="/Product Hero.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating product card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 -right-4 bg-white rounded-card p-3 shadow-luxury"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                      <Image src="/Serum Bottle.jpeg" alt="Product" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-semibold text-obsidian">Velvet Hydra</p>
                      <p className="text-[10px] font-mono text-gold">₹899</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating review */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-8 -left-6 bg-white rounded-card p-3 shadow-luxury"
                >
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={9} className="text-gold fill-gold" />)}
                  </div>
                  <p className="text-[10px] font-body text-obsidian font-medium">"Skin is glowing!"</p>
                  <p className="text-[9px] text-taupe">Priya S., Mumbai</p>
                </motion.div>

                {/* LANAN brand mark in center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow-gold opacity-0">
                    <span className="font-heading font-bold text-2xl text-obsidian">LN</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ════════════════════════════════════════════════════════════
          TRUST TICKER
      ════════════════════════════════════════════════════════════ */}
      <TrustTicker />

      {/* ════════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-beige py-8">
        <div className="container-lanan">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.08}>
                <div className="text-center">
                  <p className="font-heading text-3xl lg:text-4xl text-gold font-light">{stat.value}</p>
                  <p className="text-xs font-body text-taupe mt-1 tracking-wide">{stat.label}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ivory overflow-hidden border-b border-beige/30">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <FadeUp>
                <p className="section-label mb-2">Targeted Care</p>
                <h2 className="section-title mb-6">
                  Shop by <em className="italic text-gold">Skin Concern</em>
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-8">
                  Every skin is different, and so are its needs. Select your primary skin concern below to find a curated routine designed specifically to heal, nourish, and protect your skin.
                </p>
              </FadeUp>
              <div className="flex flex-wrap gap-3">
                {SKIN_CONCERNS.map((concern, i) => (
                  <FadeUp key={concern.label} delay={i * 0.05}>
                    <Link
                      href={concern.href}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-pill border border-gold/30 text-sm font-body font-medium text-taupe hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-200"
                    >
                      {concern.label}
                    </Link>
                  </FadeUp>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-5">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-luxury border-4 border-white">
                  <Image
                    src="/skincare concern  ingredient section.jpeg"
                    alt="LANAN Skin Concerns"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover animate-float"
                  />
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BESTSELLERS SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-white">
        <div className="container-lanan">
          <FadeUp className="text-center mb-10">
            <p className="section-label mb-2">Customer Favourites</p>
            <h2 className="section-title">
              Our <em className="italic text-gold">Bestsellers</em>
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-md mx-auto">
              Tried, trusted, and loved by thousands of customers across India.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestsellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <FadeUp className="text-center mt-10">
            <Link href="/shop" className="btn-outline-gold">
              View All Products
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BRAND STORY SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-obsidian text-ivory relative overflow-hidden clip-diagonal">
        {/* Gold decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-gold opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-gold opacity-40" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }} />

        <div className="container-lanan relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Image side */}
            <FadeUp>
              <div className="relative">
                <div className="aspect-[4/5] rounded-card overflow-hidden">
                  <Image
                    src="/premium story section..jpeg"
                    alt="LANAN Brand Story"
                    width={560}
                    height={700}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Gold frame accent */}
                <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-gold/50 rounded-tl-card" />
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-gold/50 rounded-br-card" />
              </div>
            </FadeUp>

            {/* Text side */}
            <FadeUp delay={0.2}>
              <p className="section-label text-gold mb-4">Our Story</p>
              <h2 className="font-heading font-light text-ivory leading-tight mb-6">
                Skincare That Understands{' '}
                <em className="italic text-gold">Indian Skin</em>
              </h2>
              <div className="space-y-4 text-ivory/70 font-body text-sm leading-relaxed">
                <p>
                  LANAN was born from a simple truth — Indian skin is unique. Our climate, our lifestyle,
                  our skin concerns deserve skincare that actually works for us, not just adapted from
                  global formulas.
                </p>
                <p>
                  We work with ingredient specialists to create formulas that address pigmentation, heat,
                  humidity, and the diverse skin tones that make Indian skin so beautifully complex.
                </p>
                <p>
                  Every LANAN product is a ritual — a moment of care, calm, and confidence in your daily life.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/about" className="btn-gold">
                  Our Story
                  <ArrowRight size={15} />
                </Link>
                <Link href="/ingredients" className="btn-outline-gold border-ivory/30 text-ivory hover:bg-ivory/10">
                  Our Ingredients
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CAMPAIGN VIDEO REEL
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white overflow-hidden border-b border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <FadeUp>
                <span className="section-label mb-3">Skin Ritual Reel</span>
                <h2 className="section-title mb-6">
                  Experience the <em className="italic text-gold">Lanan</em> Glow
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-6">
                  Skincare is more than just application—it is a conscious self-care ritual. Watch how our light, fast-absorbing formulas seamlessly melt into the skin, bringing back its natural health and radiance.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { title: 'Cruelty-Free & Vegan', desc: 'No animal testing, ever. Fully plant-derived luxury.' },
                    { title: 'Crafted for Indian Climate', desc: 'Non-sticky, lightweight, and sweat-proof formulas.' },
                    { title: 'Dermatologist Approved', desc: 'Rigorous safety trials for sensitive and combination skin.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs flex-shrink-0 mt-0.5">✦</div>
                      <div>
                        <h4 className="font-body font-semibold text-sm text-obsidian">{feat.title}</h4>
                        <p className="font-body text-xs text-taupe mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
            
            <div className="lg:col-span-7">
              <FadeUp delay={0.2}>
                <div className="relative aspect-video rounded-card overflow-hidden shadow-luxury border-4 border-beige/40 bg-obsidian group">
                  <video
                    src="/Skincare Ritual.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ALL PRODUCTS GRID
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-ivory">
        <div className="container-lanan">
          <FadeUp className="text-center mb-10">
            <p className="section-label mb-2">The Full Collection</p>
            <h2 className="section-title">
              Every <em className="italic text-gold">Ritual</em>, Complete
            </h2>
            <div className="divider-gold mt-3" />
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {DEMO_PRODUCTS.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <FadeUp className="text-center mt-10">
            <Link href="/shop" className="btn-gold">
              Browse All Products
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          INGREDIENTS SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-white">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">What's Inside Matters</p>
            <h2 className="section-title">
              Ingredient <em className="italic text-gold">Transparency</em>
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-lg mx-auto">
              We believe you deserve to know exactly what goes on your skin. No hidden ingredients, no vague claims.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <FadeUp delay={0.1}>
                <div className="relative aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-beige/40">
                  <Image
                    src="/Ingredient Transparency Image.jpeg"
                    alt="LANAN Ingredient Transparency"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </FadeUp>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INGREDIENTS.map((ingredient, i) => (
                  <FadeUp key={ingredient.name} delay={i * 0.07}>
                    <div className="group flex gap-4 items-start p-5 rounded-card border border-beige hover:border-gold/40 hover:shadow-gold transition-all duration-300 bg-white hover:bg-ivory/50">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                        {ingredient.icon}
                      </div>
                      <div>
                        <h3 className="font-body font-semibold text-sm text-obsidian mb-1">{ingredient.name}</h3>
                        <p className="text-xs font-body text-taupe leading-relaxed">{ingredient.benefit}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>

          <FadeUp className="text-center mt-10">
            <Link href="/ingredients" className="btn-outline-gold">
              Learn About Our Ingredients
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BEFORE & AFTER RESULTS SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-ivory/60 border-t border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 lg:order-2">
              <FadeUp>
                <span className="section-label mb-3">Proven Efficacy</span>
                <h2 className="section-title mb-6">
                  Transformative <em className="italic text-gold">Real Results</em>
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-8">
                  No filter, no compromise. Our active botanical formulas are clinically balanced to deliver noticeable changes in texture, hyperpigmentation, and skin elasticity within 28 days of daily ritual application.
                </p>
                
                {/* Stats list */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-2xl lg:text-3xl text-gold font-medium">94%</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Faded Spots</p>
                  </div>
                  <div className="bg-white p-4 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-2xl lg:text-3xl text-gold font-medium">98%</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Deep Hydration</p>
                  </div>
                  <div className="bg-white p-4 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-2xl lg:text-3xl text-gold font-medium">91%</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Refined Pores</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/shop" className="btn-gold">
                    Start Your Skin Journey
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </FadeUp>
            </div>

            <div className="lg:col-span-6 lg:order-1">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white">
                  <Image
                    src="/BeforeAfter Style Concern.jpeg"
                    alt="LANAN Skin Before & After Comparison"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-obsidian/85 backdrop-blur-sm text-gold text-[10px] sm:text-xs font-body font-semibold tracking-widest px-4 py-2 rounded-pill uppercase">
                    Unretouched 4-Week Skin Journey
                  </div>
                </div>
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RITUAL FEATURE SECTION (Full-width Editorial)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Morning Ritual',
                desc: 'Start with our gentle cleanser, follow with the niacinamide toner, and seal in moisture with Velvet Hydra. Finish with Rose Dew SPF 40.',
                image: '/Sunscreen.jpeg',
                tag: 'AM',
              },
              {
                title: 'Evening Ritual',
                desc: 'Double cleanse, apply the Radiance Revival Serum to target pigmentation, and layer on Midnight Repair Night Cream for deep overnight renewal.',
                image: '/Serum Bottle.jpeg',
                tag: 'PM',
              },
              {
                title: 'Weekly Ritual',
                desc: 'Treat yourself to the Saffron Glow Mask every Sunday. 15 minutes of indulgence for a week of radiance.',
                image: '/Saffron Face Mask.jpeg',
                tag: '7D',
              },
            ].map((ritual, i) => (
              <FadeUp key={ritual.title} delay={i * 0.1}>
                <div className="group card-luxury overflow-hidden cursor-pointer">
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={ritual.image}
                      alt={ritual.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge-gold">{ritual.tag} Ritual</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-lg text-obsidian mb-2">{ritual.title}</h3>
                    <p className="text-xs font-body text-taupe leading-relaxed">{ritual.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          REVIEWS SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-white">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">What Customers Say</p>
            <h2 className="section-title">
              Real Results,{' '}
              <em className="italic text-gold">Real People</em>
            </h2>
            <div className="divider-gold mt-3" />
          </FadeUp>

          {/* Overall Rating */}
          <FadeUp>
            <div className="flex flex-col items-center mb-10">
              <div className="flex items-end gap-4">
                <span className="font-heading text-7xl font-light text-obsidian leading-none">4.8</span>
                <div className="pb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-xs font-body text-taupe mt-1">Based on 612 reviews</p>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Carousel */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
              {DEMO_REVIEWS.map((review, i) => (
                <FadeUp key={review.id} delay={i * 0.07}>
                  <div className="glass-card p-6 h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} size={13} className="text-gold fill-gold" />
                      ))}
                    </div>
                    {/* Text */}
                    <p className="font-body text-sm text-charcoal leading-relaxed flex-1 mb-4">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-3 pt-3 border-t border-beige/60">
                      <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold font-mono flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-body font-semibold text-obsidian">{review.name}</p>
                        <p className="text-[10px] font-body text-taupe">{review.location}</p>
                      </div>
                      {review.verified && (
                        <span className="ml-auto text-[9px] font-body font-semibold text-success-green bg-success-green/10 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-body text-gold/80 mt-2">✦ {review.product}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          NEWSLETTER SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-section bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-luxury" />
        <div className="container-lanan relative z-10">
          <FadeUp>
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6">
                <Heart size={24} className="text-gold" />
              </div>
              <p className="section-label mb-3">Join the LANAN Circle</p>
              <h2 className="section-title mb-4">
                Get 15% Off Your{' '}
                <em className="italic text-gold">First Order</em>
              </h2>
              <p className="font-body text-taupe text-sm mb-8 max-w-md mx-auto">
                Subscribe for exclusive offers, skincare tips, new product launches, and a
                welcome discount just for joining.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input-luxury flex-1 text-sm"
                />
                <button className="btn-gold whitespace-nowrap">
                  Get 15% Off
                </button>
              </div>

              <p className="text-[11px] font-body text-taupe/60 mt-3">
                No spam, ever. Unsubscribe anytime. 💛
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TRUST SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white border-t border-beige">
        <div className="container-lanan">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck size={22} className="text-gold" />, title: 'Secure Payments', desc: 'Razorpay encrypted checkout' },
              { icon: <Truck size={22} className="text-gold" />, title: 'Fast Delivery', desc: 'Pan India 3-7 business days' },
              { icon: <Leaf size={22} className="text-gold" />, title: 'Skin-Safe Promise', desc: 'No harmful chemicals' },
              { icon: <Heart size={22} className="text-gold" />, title: 'Easy Returns', desc: '7-day hassle-free returns' },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.07}>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-body font-semibold text-sm text-obsidian">{item.title}</h3>
                  <p className="text-xs font-body text-taupe">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
