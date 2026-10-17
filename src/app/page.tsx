'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Skincare Storefront Homepage
// Fully redesigned to match premium Indian skincare aesthetic
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Star, ShieldCheck, Leaf, Truck, Sparkles,
  Droplets, FlaskConical, Sun, Wind, Heart,
  Camera, CheckCircle2, RotateCcw, Check,
} from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import LazyRitualVideo from '@/components/media/LazyRitualVideo';
import { DEMO_PRODUCTS, DEMO_REVIEWS } from '@/lib/data/products';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';

/* ── Animation helpers ── */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section 4: Authentic Trust & Brand Metrics ── */
const TRUST_METRICS = [
  { value: '100%', label: 'Cruelty-Free & Dermatologist Tested', detail: 'Zero animal testing, safe for sensitive Indian skin' },
  { value: '₹599', label: 'Free Pan-India Delivery', detail: 'Dispatched in eco-conscious packaging with tracked delivery' },
  { value: '4-Step', label: 'Curated Daily Skin Rituals', detail: 'Cleanse, tone, treat, and broad-spectrum SPF protection' },
  { value: 'Zero', label: 'White Cast & Heavy Residue', detail: 'Lightweight botanical formulas tailored for warm climates' },
];

/* ── Section 5: Skin Concerns ── */
const SKIN_CONCERNS = [
  {
    label: 'Pigmentation',
    href: '/shop?concern=pigmentation',
    desc: 'Fade dark spots & even out melanin synthesis',
    tag: 'Glutathione + Niacinamide',
  },
  {
    label: 'Hydration',
    href: '/shop?concern=hydration',
    desc: 'Quench deep dryness & restore moisture barrier',
    tag: 'Hyaluronic Acid + Ceramides',
  },
  {
    label: 'Acne & Pores',
    href: '/shop?concern=acne',
    desc: 'Clarify excess sebum & unclog congested pores',
    tag: 'Salicylic Acid 2%',
  },
  {
    label: 'Anti-Aging',
    href: '/shop?concern=anti-aging',
    desc: 'Smooth fine lines & promote skin elasticity',
    tag: 'Peptides + Antioxidants',
  },
  {
    label: 'Brightening',
    href: '/shop?concern=brightening',
    desc: 'Revitalize dullness for a luminous golden glow',
    tag: 'Saffron + Vitamin C',
  },
  {
    label: 'Dark Circles',
    href: '/shop?concern=dark-circles',
    desc: 'Nourish delicate under-eye skin & diminish fatigue',
    tag: 'Caffeine + Botanical Extracts',
  },
];

/* ── Section 11: Ingredients Data ── */
const INGREDIENTS = [
  {
    icon: <Droplets size={20} />,
    name: 'Hyaluronic Acid',
    benefit: 'Deep cellular hydration & plumping',
    details: 'A multi-molecular humectant that attracts up to 1000x its weight in water, infusing parched skin with enduring moisture.',
  },
  {
    icon: <Sparkles size={20} />,
    name: 'Niacinamide (Vitamin B3)',
    benefit: 'Barrier repair & pore refinement',
    details: 'Clinically proven to balance sebum production, visibly minimize enlarged pores, and restore barrier resilience.',
  },
  {
    icon: <Sun size={20} />,
    name: 'Kashmiri Saffron Extract',
    benefit: 'Golden radiance & tone illumination',
    details: 'Harvested by hand, rich in crocin and antioxidants that combat environmental stressors while imparting a natural luminescence.',
  },
  {
    icon: <Leaf size={20} />,
    name: 'Aloe Vera Gel',
    benefit: 'Instant soothing & cooling relief',
    details: 'Packed with vitamins and anti-inflammatory enzymes to calm heat-stressed skin without greasiness or sticky residue.',
  },
  {
    icon: <FlaskConical size={20} />,
    name: 'Stabilized Vitamin C',
    benefit: 'Antioxidant defense & spot fading',
    details: 'Neutralizes free radicals from UV and pollution while visibly evening hyperpigmentation and boosting natural radiance.',
  },
  {
    icon: <Wind size={20} />,
    name: 'Signal Peptides',
    benefit: 'Firming & elasticity reinforcement',
    details: 'Bio-mimetic amino acid chains that encourage dermal renewal, smoothing texture and fine expression lines.',
  },
];

function IngredientCard({ ingredient }: { ingredient: (typeof INGREDIENTS)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col p-5 rounded-card border border-beige/60 hover:border-gold/40 hover:shadow-luxury transition-all duration-300 bg-white hover:bg-ivory/50 cursor-pointer overflow-hidden min-h-[110px]"
    >
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
          {ingredient.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-semibold text-sm text-obsidian mb-1">{ingredient.name}</h3>
          <p className="text-xs font-body text-taupe leading-relaxed">{ingredient.benefit}</p>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: hovered ? 'auto' : 0, opacity: hovered ? 1 : 0, marginTop: hovered ? 12 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="pt-2.5 border-t border-beige/60 text-[11px] font-body text-taupe leading-relaxed">
          {ingredient.details}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Homepage Component
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(DEMO_PRODUCTS);
        }
      })
      .catch((err) => {
        console.error('Error fetching homepage products:', err);
        if (isMounted) setProducts(DEMO_PRODUCTS);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const bestsellers = useMemo(() => {
    const featured = products.filter((p) => p.is_bestseller);
    return featured.length > 0 ? featured : products.slice(0, 4);
  }, [products]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!newsletterConsent) {
      toast.error('Please accept our privacy policy to subscribe');
      return;
    }
    setNewsletterSubmitted(true);
    toast.success('Welcome to the LANAN Circle! Your 15% discount code is LANAN15');
  };

  return (
    <div className="w-full overflow-hidden bg-ivory">

      {/* ════════════════════════════════════════════════════════════
          SECTION 3: HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[82vh] lg:min-h-[88vh] flex items-center overflow-hidden bg-gradient-hero border-b border-beige/40">
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 bg-pattern-luxury opacity-40 pointer-events-none" />
        <div
          className="absolute top-10 right-0 w-[550px] h-[550px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A45D 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #A97867 0%, transparent 70%)' }}
        />

        <div className="container-lanan relative z-10 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Column: Editorial Headline & Actions - Immediate SSR Render for Instant FCP & LCP */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gold/30 rounded-pill px-4 py-1.5 mb-6 shadow-xs">
                <Sparkles size={13} className="text-gold" />
                <span className="text-gold-dark text-xs font-body font-semibold tracking-widest uppercase">
                  Luxury Skincare Rituals
                </span>
              </div>

              <h1 className="font-heading font-light text-obsidian mb-6 leading-[1.08] tracking-tight">
                Luxury Skincare,{' '}
                <em className="italic text-taupe font-serif">Crafted for</em>
                <br />
                <span className="text-gradient-gold">Your Everyday</span>
                <br />
                <em className="italic text-obsidian font-serif">Indian Skin</em> Ritual
              </h1>

              <p className="font-body text-taupe text-base lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Formulated with high-potency botanicals and dermatologist-proven actives to heal,
                hydrate, and protect in Indian heat and humidity. Gentle luxury for everyday confidence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <Link href="/shop" className="btn-gold text-sm px-8 py-4">
                  Shop LANAN
                  <ArrowRight size={16} />
                </Link>
                <Link href="/rituals" className="btn-outline-gold text-sm px-8 py-4">
                  Explore Our Ritual
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-beige/60 flex flex-wrap gap-6 justify-center lg:justify-start">
                {[
                  { icon: <ShieldCheck size={15} />, text: '100% Cruelty-Free' },
                  { icon: <Truck size={15} />, text: 'Free Shipping Above ₹599' },
                  { icon: <Leaf size={15} />, text: 'Dermatologist Tested' },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 text-taupe text-xs font-body">
                    <span className="text-gold">{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Visual with Real Product Artwork & Floating Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white group">
                <Image
                  src="/luxury-skincare-crafted-for-your-everyday-ritual.jpeg"
                  alt="LANAN Everyday Luxury Skincare Ritual"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 45vw"
                  className="object-cover group-hover:scale-102 transition-transform duration-700"
                />

                {/* Warm Gradient Overlay at base */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Product Badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 -right-2 sm:right-4 bg-white/95 backdrop-blur-md rounded-card p-3 shadow-luxury border border-gold/25"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-ivory flex-shrink-0 border border-beige/40">
                      <Image
                        src="/lanan-glutathione-face-serum.jpeg"
                        alt="LANAN Glutathione Face Serum"
                        width={36}
                        height={36}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-body font-semibold text-obsidian">Glutathione Serum</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-taupe/60 line-through">₹899</span>
                        <span className="text-[11px] font-mono font-bold text-obsidian">₹737</span>
                        <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full bg-[#5B1924] text-[#F7F0E7]">
                          SAVE 18%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom caption pill */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-obsidian/85 backdrop-blur-md rounded-xl p-3 border border-gold/25 flex items-center justify-between text-ivory">
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-widest text-gold">The Radiant Ritual</p>
                      <p className="text-xs font-heading">Glutathione, Niacinamide & SPF 50</p>
                    </div>
                    <Link
                      href="/shop"
                      className="text-[11px] font-body text-gold hover:underline flex items-center gap-1"
                    >
                      Discover <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4: TRUST STRIP & AUTHENTIC METRICS
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-beige/60 py-10">
        <div className="container-lanan">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {TRUST_METRICS.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.08}>
                <div className="text-center p-4 rounded-xl border border-transparent hover:border-beige/50 transition-colors">
                  <p className="font-heading text-3xl lg:text-4xl text-gold font-light mb-1">{stat.value}</p>
                  <p className="text-xs font-body font-semibold text-obsidian tracking-wide mb-1">{stat.label}</p>
                  <p className="text-[11px] font-body text-taupe leading-relaxed">{stat.detail}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 5: SHOP BY SKIN CONCERN
      ════════════════════════════════════════════════════════════ */}
      <section id="concerns" className="py-16 lg:py-20 bg-ivory border-b border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left: Skin Concern Cards & Selector */}
            <div className="lg:col-span-7">
              <FadeUp>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <p className="section-label">Targeted Formulations</p>
                </div>
                <h2 className="section-title mb-5">
                  Shop by <em className="italic text-gold font-serif">Skin Concern</em>
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-8 max-w-xl">
                  Every complexion is distinct. Choose your targeted primary concern below to discover
                  clean, clinically balanced rituals designed to heal and strengthen your skin barrier.
                </p>
              </FadeUp>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SKIN_CONCERNS.map((concern, i) => (
                  <FadeUp key={concern.label} delay={i * 0.05}>
                    <Link
                      href={concern.href}
                      className="group flex flex-col p-4 rounded-xl bg-white border border-beige/70 hover:border-gold/40 hover:shadow-luxury transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body font-semibold text-sm text-obsidian group-hover:text-gold transition-colors">
                          {concern.label}
                        </span>
                        <ArrowRight size={14} className="text-taupe group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-[11px] font-body text-taupe leading-relaxed mb-2">{concern.desc}</p>
                      <span className="text-[10px] font-mono text-gold-dark bg-gold/10 px-2 py-0.5 rounded-md self-start">
                        {concern.tag}
                      </span>
                    </Link>
                  </FadeUp>
                ))}
              </div>
            </div>

            {/* Right: Editorial Image */}
            <div className="lg:col-span-5">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white">
                  <Image
                    src="/skincare-concern-ingredient-section.jpeg"
                    alt="LANAN Skin Concern Editorial"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 text-ivory">
                    <p className="text-[10px] font-body font-semibold tracking-widest uppercase text-gold">Dermatologist Formulated</p>
                    <p className="font-heading text-xl font-light">Custom care for hyperpigmentation, texture & UV defense</p>
                  </div>
                </div>
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 6: BESTSELLERS
      ════════════════════════════════════════════════════════════ */}
      <section id="bestsellers" className="py-16 lg:py-24 bg-white border-b border-beige/40">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">Customer Favourites</p>
            <h2 className="section-title">
              Our <em className="italic text-gold font-serif">Bestsellers</em>
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-md mx-auto">
              Tried, trusted, and celebrated for genuine, noticeable skin transformations across India.
            </p>
          </FadeUp>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-luxury p-3 md:p-4 bg-white/70 animate-pulse space-y-3">
                  <div className="aspect-square bg-beige/40 rounded-card" />
                  <div className="h-3 w-16 bg-beige/50 rounded" />
                  <div className="h-4 w-3/4 bg-beige/60 rounded" />
                  <div className="h-3 w-1/3 bg-beige/40 rounded" />
                </div>
              ))}
            </div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch">
              {bestsellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/60 border border-beige/60 max-w-md mx-auto">
              <Sparkles className="mx-auto text-gold mb-3" size={28} />
              <p className="font-heading text-lg text-obsidian font-light">Formulations Loading</p>
              <p className="text-xs font-body text-taupe mt-1">Our curated rituals are being updated.</p>
            </div>
          )}

          <FadeUp className="text-center mt-12">
            <Link href="/shop" className="btn-outline-gold text-sm px-8 py-3.5">
              View All Formulations
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 7: FREE AI SKIN SCAN SECTION
      ════════════════════════════════════════════════════════════ */}
      <section id="ai-scan" className="py-20 lg:py-24 bg-obsidian text-ivory relative overflow-hidden">
        {/* Background ambient gold glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #C9A45D 0%, transparent 65%)' }}
          />
        </div>

        <div className="container-lanan relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: Copy & Explanation */}
            <div className="lg:col-span-7">
              <FadeUp>
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-pill px-4 py-1.5 mb-6">
                  <Sparkles size={12} className="text-gold animate-pulse" />
                  <span className="text-gold text-xs font-body font-semibold tracking-widest uppercase">
                    100% Free AI Skin Analysis
                  </span>
                </div>

                <h2 className="font-heading font-light text-ivory leading-tight mb-5 text-3xl sm:text-4xl lg:text-5xl">
                  Discover Your{' '}
                  <em className="italic text-gold font-serif">True Skin</em>{' '}
                  Profile in 30 Seconds
                </h2>

                <p className="font-body text-ivory/70 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                  Uncertain of your exact skin type or barrier needs? Upload 4 close-up photos (Front,
                  Forehead, Left Cheek, Right Cheek). Our AI — powered by Google Gemini Vision —
                  evaluates pigmentation, sebum activity, and hydration levels, recommending your tailored LANAN routine.
                </p>

                {/* Features checklist */}
                <div className="space-y-3.5 mb-9">
                  {[
                    { icon: '🔬', text: 'Identifies skin classification — Dry, Oily, Combination, or Sensitive' },
                    { icon: '📊', text: 'Analyzes visible pigmentation, pore activity & hydration balance' },
                    { icon: '🌿', text: 'Matches recommendations to authentic, clinically proven LANAN formulations' },
                    { icon: '🔒', text: 'Real-time ephemeral processing — photographs are never stored on disk' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <span className="text-base leading-none">{f.icon}</span>
                      <span className="text-xs sm:text-sm font-body text-ivory/80">{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5">
                  <Link
                    href="/skin-analysis"
                    className="btn-gold text-sm px-8 py-4"
                    id="homepage-start-ai-analysis-btn"
                  >
                    <Sparkles size={15} />
                    Start Free Skin Analysis
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/shop"
                    className="btn-outline-gold border-ivory/25 text-ivory hover:bg-ivory/10 text-sm px-8 py-4"
                  >
                    Browse All Products
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Right: Interactive 4-Photo Scan Mockup */}
            <div className="lg:col-span-5">
              <FadeUp delay={0.2}>
                <div className="relative bg-white/5 border border-gold/25 rounded-[2.5rem] p-3 max-w-sm mx-auto shadow-luxury-lg">
                  <div className="bg-gradient-to-br from-[#090807] to-[#171513] rounded-[2rem] overflow-hidden border border-white/5">

                    {/* Top bar */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-gold animate-pulse" />
                        <span className="text-xs font-body font-semibold text-ivory">LANAN AI Scanner</span>
                      </div>
                      <span className="text-[9px] font-mono text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                        FREE
                      </span>
                    </div>

                    {/* 2x2 Photo Slots Grid */}
                    <div className="grid grid-cols-2 gap-2.5 p-4">
                      {[
                        { label: 'Front Profile', img: '/hero-banner-model.jpeg', active: true },
                        { label: 'Forehead Zone', img: '/product-in-hand.jpeg', active: true },
                        { label: 'Left Cheek', img: '/before-after-style-concern.jpeg', active: true },
                        { label: 'Right Cheek', img: null, active: false },
                      ].map((slot, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 flex flex-col items-center justify-center group"
                        >
                          {slot.img ? (
                            <>
                              <Image
                                src={slot.img}
                                alt={slot.label}
                                fill
                                sizes="(max-width: 640px) 140px, 160px"
                                loading="lazy"
                                className="object-cover opacity-75"
                              />
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs">
                                <Check size={11} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full border border-dashed border-gold/40 flex items-center justify-center mb-1">
                                <Camera size={14} className="text-gold/70" />
                              </div>
                              <span className="text-[8px] font-body text-ivory/50">Ready</span>
                            </>
                          )}
                          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
                            <span className="bg-obsidian/85 text-ivory/80 text-[7px] font-body px-2 py-0.5 rounded-full">
                              {slot.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="px-5 pb-3">
                      <div className="flex justify-between text-[8px] font-body text-ivory/50 mb-1.5">
                        <span>Guided Photo Calibration</span>
                        <span className="text-gold">3 of 4 Ready</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gold to-amber-300 rounded-full w-3/4" />
                      </div>
                    </div>

                    {/* Results Preview Card */}
                    <div className="mx-4 mb-4 bg-gold/10 border border-gold/25 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={11} className="text-gold" />
                          <span className="text-[8px] font-body font-semibold text-gold uppercase tracking-wider">
                            Real-time Diagnostic
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-ivory/60">Profile: Combination</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Pigmentation Sensitivity', pct: 62 },
                          { name: 'Hydration Resilience', pct: 44 },
                        ].map((c) => (
                          <div key={c.name}>
                            <div className="flex justify-between text-[7px] font-body text-ivory/60 mb-0.5">
                              <span>{c.name}</span>
                              <span className="text-gold">{c.pct}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gold rounded-full" style={{ width: `${c.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 8: OUR STORY
      ════════════════════════════════════════════════════════════ */}
      <section id="story" className="py-20 lg:py-24 bg-white border-b border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Editorial Image Side */}
            <div className="lg:col-span-6">
              <FadeUp>
                <div className="relative">
                  <div className="aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white">
                    <Image
                      src="/premium-story-section.jpeg"
                      alt="LANAN Editorial Brand Story"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {/* Decorative gold corner brackets */}
                  <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-gold/50 rounded-tl-card pointer-events-none" />
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-gold/50 rounded-br-card pointer-events-none" />
                </div>
              </FadeUp>
            </div>

            {/* Story Text Side */}
            <div className="lg:col-span-6">
              <FadeUp delay={0.2}>
                <p className="section-label mb-2">Our Philosophy</p>
                <h2 className="section-title mb-6">
                  Skincare That Understands{' '}
                  <em className="italic text-gold font-serif">Indian Skin</em>
                </h2>
                <div className="space-y-4 text-taupe font-body text-sm leading-relaxed mb-8">
                  <p>
                    LANAN was founded upon a clear principle: Indian skin is uniquely rich in melanin,
                    subject to intense UV radiation, monsoon humidity, and urban environmental stress.
                    Global formulations rarely address our specific barrier requirements.
                  </p>
                  <p>
                    We bridge age-old botanical wisdom with clinical dermatological science. Every ingredient—from
                    Kashmiri Saffron and Glutathione to Salicylic Acid and Ceramide NP—is selected at optimal
                    clinical dosages that deliver results without inflammation.
                  </p>
                  <p>
                    Every LANAN formulation is a conscious ritual: a moment of calm, nourishment, and
                    uncompromising care for your daily life.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/about" className="btn-gold text-sm px-7 py-3.5">
                    Our Full Story
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/ingredients" className="btn-outline-gold text-sm px-7 py-3.5">
                    Explore Ingredients
                  </Link>
                </div>
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 9: SKIN RITUAL REEL
      ════════════════════════════════════════════════════════════ */}
      <section id="ritual-reel" className="py-20 lg:py-24 bg-ivory border-b border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5">
              <FadeUp>
                <p className="section-label mb-2">Skin Ritual Reel</p>
                <h2 className="section-title mb-6">
                  Experience the <em className="italic text-gold font-serif">LANAN</em> Glow
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-6">
                  Skincare is an act of daily self-honoring. Watch how our featherlight, rapid-absorbing
                  textures melt into the skin, replenishing hydration without heaviness or shine.
                </p>
                <div className="space-y-3.5">
                  {[
                    { title: '100% Cruelty-Free & Vegan', desc: 'Plant-derived luxury with no animal testing, ever.' },
                    { title: 'Optimized for Indian Weather', desc: 'Non-comedogenic, non-sticky, and sweat-resistant.' },
                    { title: 'Dermatologist Evaluated', desc: 'Gentle, balanced actives for combination and sensitive barriers.' },
                  ].map((feat, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs flex-shrink-0 mt-0.5">
                        ✦
                      </div>
                      <div>
                        <h3 className="font-body font-semibold text-sm text-obsidian">{feat.title}</h3>
                        <p className="font-body text-xs text-taupe mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            <div className="lg:col-span-7">
              <FadeUp delay={0.2}>
                <LazyRitualVideo />
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 10: COMPLETE COLLECTION
      ════════════════════════════════════════════════════════════ */}
      <section id="collection" className="py-20 lg:py-24 bg-white border-b border-beige/40">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">The Complete Range</p>
            <h2 className="section-title">
              Every <em className="italic text-gold font-serif">Ritual</em>, Complete
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-md mx-auto">
              Explore our complete collection of cleansers, toners, serums, moisturisers, and broad-spectrum sunscreens.
            </p>
          </FadeUp>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-luxury p-3 md:p-4 bg-white/70 animate-pulse space-y-3">
                  <div className="aspect-square bg-beige/40 rounded-card" />
                  <div className="h-3 w-16 bg-beige/50 rounded" />
                  <div className="h-4 w-3/4 bg-beige/60 rounded" />
                  <div className="h-3 w-1/3 bg-beige/40 rounded" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/60 border border-beige/60 max-w-md mx-auto">
              <Sparkles className="mx-auto text-gold mb-3" size={28} />
              <p className="font-heading text-lg text-obsidian font-light">Collection Updating</p>
              <p className="text-xs font-body text-taupe mt-1">Discover our full range once items are published.</p>
            </div>
          )}

          <FadeUp className="text-center mt-12">
            <Link href="/shop" className="btn-gold text-sm px-8 py-3.5">
              Browse All Products in Shop
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 11: INGREDIENTS TRANSPARENCY
      ════════════════════════════════════════════════════════════ */}
      <section id="ingredients" className="py-20 lg:py-24 bg-ivory border-b border-beige/40">
        <div className="container-lanan">
          <FadeUp className="text-center mb-14">
            <p className="section-label mb-2">What&apos;s Inside Matters</p>
            <h2 className="section-title">
              Ingredient <em className="italic text-gold font-serif">Transparency</em>
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-lg mx-auto">
              We believe you deserve full honesty about what touches your skin. No hidden fillers,
              no unverified marketing claims.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Visual */}
            <div className="lg:col-span-5">
              <FadeUp delay={0.1}>
                <div className="relative aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white">
                  <Image
                    src="/ingredient-transparency-image.jpeg"
                    alt="LANAN Verified Active Ingredients"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 text-ivory">
                    <p className="text-[10px] font-body font-semibold tracking-widest uppercase text-gold">Clean & Proven</p>
                    <p className="font-heading text-lg font-light">Salicylic Acid, Niacinamide, Saffron & Glutathione</p>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Cards Grid */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INGREDIENTS.map((ingredient) => (
                  <FadeUp key={ingredient.name} delay={0.08}>
                    <IngredientCard ingredient={ingredient} />
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>

          <FadeUp className="text-center mt-12">
            <Link href="/ingredients" className="btn-outline-gold text-sm px-8 py-3.5">
              Learn About Our Formulation Standards
              <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 12: RESULTS SECTION (AUTHENTIC CAMPAIGN VISUAL)
      ════════════════════════════════════════════════════════════ */}
      <section id="results" className="py-20 lg:py-24 bg-white border-b border-beige/40">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Text Side */}
            <div className="lg:col-span-6 lg:order-2">
              <FadeUp>
                <p className="section-label mb-2">Verified Real Care</p>
                <h2 className="section-title mb-6">
                  Transformative <em className="italic text-gold font-serif">Skin Journeys</em>
                </h2>
                <p className="font-body text-taupe text-sm leading-relaxed mb-6">
                  True skin transformation requires consistency, barrier nourishment, and daily photoprotection.
                  Our formulas work synergistically to support cellular renewal and diminish hyperpigmentation over a 4-week daily routine.
                </p>

                {/* Authentic dermatological pillars */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-ivory/60 p-3.5 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-lg lg:text-xl text-gold font-semibold">4 Weeks</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Renewal Cycle</p>
                  </div>
                  <div className="bg-ivory/60 p-3.5 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-lg lg:text-xl text-gold font-semibold">SPF 50</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Broad Spectrum</p>
                  </div>
                  <div className="bg-ivory/60 p-3.5 rounded-card border border-beige/60 text-center">
                    <p className="font-heading text-lg lg:text-xl text-gold font-semibold">Clean</p>
                    <p className="text-[10px] font-body text-taupe mt-1 uppercase tracking-wider">Non-Comedogenic</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/shop" className="btn-gold text-sm px-8 py-3.5">
                    Start Your Skin Journey
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Image Side */}
            <div className="lg:col-span-6 lg:order-1">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[4/3] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-white">
                  <Image
                    src="/before-after-style-concern.jpeg"
                    alt="LANAN Skin Journey"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
          SECTION 13: MORNING, EVENING & TARGETED ROUTINES
      ════════════════════════════════════════════════════════════ */}
      <section id="routines" className="py-20 lg:py-24 bg-ivory border-b border-beige/40">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">Curated Regimens</p>
            <h2 className="section-title">
              Complete <em className="italic text-gold font-serif">Daily Rituals</em>
            </h2>
            <div className="divider-gold mt-3" />
            <p className="font-body text-taupe text-sm mt-4 max-w-md mx-auto">
              Carefully staged regimens designed to layer seamlessly for maximum efficacy and barrier health.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Morning Awakening Ritual',
                tag: 'AM ROUTINE',
                desc: 'Cleanse with LANAN Face Wash, hydrate skin with Glutathione Face Toner, and shield with Sunscreen SPF 50 PA++++.',
                image: '/lanan-sunscreen-spf-50.jpeg',
                link: '/shop?category=sunscreen',
                steps: ['1. Gentle Cleanser', '2. Hydrating Toner', '3. SPF 50 PA++++ Shield'],
              },
              {
                title: 'Evening Barrier Repair Ritual',
                tag: 'PM ROUTINE',
                desc: 'Wash away daytime pollutants with LANAN Face Wash, balance with Glutathione Toner, and treat with Glutathione Face Serum.',
                image: '/lanan-glutathione-face-serum.jpeg',
                link: '/shop?category=serums',
                steps: ['1. Clarifying Wash', '2. Toning Essence', '3. Radiance Serum'],
              },
              {
                title: 'Targeted Radiance Ritual',
                tag: 'DAILY REGIMEN',
                desc: 'A complete botanical regimen featuring 2% Salicylic Acid, Niacinamide, Hyaluronic Acid, and Glutathione for healthy, luminous skin.',
                image: '/lanan-face-wash.jpeg',
                link: '/shop',
                steps: ['1. Salicylic Wash', '2. Niacinamide Prep', '3. Nourishing Moisturiser'],
              },
            ].map((ritual, i) => (
              <FadeUp key={ritual.title} delay={i * 0.1}>
                <div className="group card-luxury bg-white rounded-card overflow-hidden border border-beige/60 hover:border-gold/40 hover:shadow-luxury transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-[16/10] overflow-hidden relative bg-ivory">
                    <Image
                      src={ritual.image}
                      alt={ritual.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3.5 left-3.5">
                      <span className="badge-gold shadow-xs">{ritual.tag}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-heading text-xl text-obsidian mb-2">{ritual.title}</h3>
                    <p className="text-xs font-body text-taupe leading-relaxed mb-4">{ritual.desc}</p>
                    <div className="space-y-1.5 pt-3 border-t border-beige/60 mb-6">
                      {ritual.steps.map((st) => (
                        <p key={st} className="text-[11px] font-body text-charcoal/80 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-gold flex-shrink-0" />
                          {st}
                        </p>
                      ))}
                    </div>
                    <Link
                      href={ritual.link}
                      className="mt-auto text-xs font-body font-semibold text-gold hover:text-gold-dark inline-flex items-center gap-1.5 group-hover:underline"
                    >
                      Shop This Ritual <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 14: CUSTOMER REVIEWS
      ════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="py-20 lg:py-24 bg-white border-b border-beige/40">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-2">Verified Testimonials</p>
            <h2 className="section-title">
              Real Results,{' '}
              <em className="italic text-gold font-serif">Real People</em>
            </h2>
            <div className="divider-gold mt-3" />
          </FadeUp>

          {/* Aggregate Rating */}
          <FadeUp>
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-end gap-3.5">
                <span className="font-heading text-6xl lg:text-7xl font-light text-obsidian leading-none">4.8</span>
                <div className="pb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-xs font-body text-taupe mt-1">Verified customer ratings across India</p>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {DEMO_REVIEWS.map((review, i) => (
              <FadeUp key={review.id} delay={i * 0.08}>
                <div className="bg-ivory/50 rounded-card p-6 border border-beige/60 hover:border-gold/30 hover:shadow-luxury transition-all h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={13} className="text-gold fill-gold" />
                    ))}
                  </div>
                  {/* Text */}
                  <p className="font-body text-xs sm:text-sm text-charcoal leading-relaxed flex-1 mb-5">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3.5 border-t border-beige/60">
                    <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold font-mono flex-shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-body font-semibold text-obsidian">{review.name}</p>
                      <p className="text-[10px] font-body text-taupe">{review.location}</p>
                    </div>
                    {review.verified && (
                      <span className="ml-auto text-[9px] font-body font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-body text-gold-dark mt-2 truncate">✦ {review.product}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 15: NEWSLETTER SIGNUP
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-gradient-hero relative overflow-hidden border-b border-beige/40">
        <div className="absolute inset-0 bg-pattern-luxury opacity-40 pointer-events-none" />
        <div className="container-lanan relative z-10">
          <FadeUp>
            <div className="max-w-xl mx-auto text-center">
              <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6 text-gold">
                <Heart size={22} />
              </div>
              <p className="section-label mb-2">Join the LANAN Circle</p>
              <h2 className="section-title mb-4">
                Receive 15% Off Your{' '}
                <em className="italic text-gold font-serif">First Ritual</em>
              </h2>
              <p className="font-body text-taupe text-sm mb-8 leading-relaxed">
                Subscribe for private invitations to seasonal launches, customized skincare tips, and a welcome privilege.
              </p>

              {newsletterSubmitted ? (
                <div className="p-6 rounded-2xl bg-white border border-gold/40 shadow-luxury text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Check size={18} />
                  </div>
                  <h3 className="font-heading text-xl text-obsidian mb-1">Welcome to LANAN</h3>
                  <p className="text-xs font-body text-taupe mb-3">
                    Use code <span className="font-mono font-bold text-gold">LANAN15</span> at checkout for 15% off.
                  </p>
                  <Link href="/shop" className="btn-gold text-xs px-6 py-2.5">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="input-luxury flex-1 text-sm bg-white"
                    />
                    <button type="submit" className="btn-gold whitespace-nowrap text-sm py-3 px-6">
                      Get 15% Off
                    </button>
                  </div>
                  <label className="flex items-center justify-center gap-2 text-[11px] font-body text-taupe cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      className="rounded border-beige text-gold focus:ring-gold"
                    />
                    <span>I agree to receive personalized skincare updates and agree to the Privacy Policy.</span>
                  </label>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 16: TRUST BAR (SECURE PAYMENTS & PROMISES)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="container-lanan">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck size={22} className="text-gold" />,
                title: 'Cash on Delivery & UPI',
                desc: 'Secure payments via UPI, Cards, Netbanking & COD',
              },
              {
                icon: <Truck size={22} className="text-gold" />,
                title: 'Pan-India Express',
                desc: 'Complimentary shipping on orders above ₹599',
              },
              {
                icon: <Leaf size={22} className="text-gold" />,
                title: 'Dermatologist Safe',
                desc: 'Formulated without harmful sulfates, parabens or harsh scents',
              },
              {
                icon: <RotateCcw size={22} className="text-gold" />,
                title: '7-Day Return Assistance',
                desc: 'Seamless support for damaged or incorrect deliveries',
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.06}>
                <div className="flex flex-col items-center text-center gap-2 p-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-1">
                    {item.icon}
                  </div>
                  <h3 className="font-body font-semibold text-sm text-obsidian">{item.title}</h3>
                  <p className="text-xs font-body text-taupe leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
