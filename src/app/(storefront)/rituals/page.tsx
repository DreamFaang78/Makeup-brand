'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Skincare Rituals Page
// Guided morning, evening, and weekly rituals, with an interactive skin advisor
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Sparkles, Droplets, Sun, Moon, Calendar, ChevronRight,
  ArrowRight, ShoppingBag, Check, Heart, Info, RefreshCw,
  HelpCircle, CheckCircle2, ShieldCheck, Flame, Star
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ProductCardData } from '@/types/product';

/* ── Animation helpers ── */
function FadeUp({
  children, delay = 0, className = '',
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Daily Ritual Steps Configuration ──
const MORNING_RITUAL = {
  title: 'Morning (AM) Protection Ritual',
  subtitle: 'Awaken, hydrate, and shield.',
  description: 'Designed to defend your skin against environmental aggressors, pollution, and UV radiation, while providing lightweight, breathable moisture for the Indian climate.',
  colorTheme: 'from-amber-500/10 via-amber-500/5 to-transparent',
  accentColor: '#C9A96E',
  icon: <Sun size={24} className="text-gold" />,
  steps: [
    {
      step: '01',
      action: 'Cleanse',
      title: 'Purify with Petal Soft Foam',
      desc: 'Wash away overnight sebum and buildup. Pump 1-2 puffs of cleanser onto damp skin, massage gently in circular motions, and rinse with cool water.',
      productSlug: 'petal-soft-cleansing-foam',
      duration: '1 Min'
    },
    {
      step: '02',
      action: 'Tone',
      title: 'Balance with Niacinamide Clarity Toner',
      desc: 'Splash a small amount onto your palms and gently pat into your skin. This tightens pores, regulates oiliness, and prepares the skin to receive active nutrients.',
      productSlug: 'niacinamide-clarity-toner',
      duration: '30 Sec'
    },
    {
      step: '03',
      action: 'Treat',
      title: 'Brighten with Radiance Revival Serum',
      desc: 'Apply 3-4 drops of the serum to your face and neck. Press (do not rub) it into the skin to target hyperpigmentation and reveal a golden, even glow.',
      productSlug: 'radiance-revival-serum',
      duration: '1 Min'
    },
    {
      step: '04',
      action: 'Hydrate',
      title: 'Seal with Velvet Hydra Moisturiser',
      desc: 'Massage a dime-sized amount onto the face to lock in 72-hour moisture. Its lightweight gel-cream formula feels weightless and stays sweat-proof.',
      productSlug: 'velvet-hydra-moisturiser',
      duration: '1 Min'
    },
    {
      step: '05',
      action: 'Protect',
      title: 'Shield with Rose Dew SPF 40',
      desc: 'Apply a generous amount (two-finger rule) as the final step. Protects against UV rays without leaving a white cast or clogging your pores.',
      productSlug: 'rose-dew-spf40-sunscreen',
      duration: '1 Min'
    }
  ]
};

const EVENING_RITUAL = {
  title: 'Evening (PM) Restorative Ritual',
  subtitle: 'Decompress, repair, and renew.',
  description: 'A deeply restorative sequence focused on cell regeneration, barrier repair, and intensive hydration while your body rests overnight.',
  colorTheme: 'from-indigo-950/20 via-indigo-900/5 to-transparent',
  accentColor: '#9B7465',
  icon: <Moon size={24} className="text-taupe" />,
  steps: [
    {
      step: '01',
      action: 'Double Cleanse',
      title: 'Cleanse with Petal Soft Foam',
      desc: 'Wash away the day’s pollution, makeup, sweat, and sunscreen. Lather well and rinse with lukewarm water to unclog pores deeply.',
      productSlug: 'petal-soft-cleansing-foam',
      duration: '2 Mins'
    },
    {
      step: '02',
      action: 'Tone & Refine',
      title: 'Prep with Niacinamide Clarity Toner',
      desc: 'Pat gently onto the face and neck. It calms any daytime redness and helps active ingredients in your evening treatments penetrate deeper.',
      productSlug: 'niacinamide-clarity-toner',
      duration: '30 Sec'
    },
    {
      step: '03',
      action: 'Targeted Repair',
      title: 'Renew with Radiance Revival Serum',
      desc: 'Press 3-4 drops into dry skin. The concentrated active botanicals work in synergy with overnight repair cycles to fade dark spots and uneven tone.',
      productSlug: 'radiance-revival-serum',
      duration: '1 Min'
    },
    {
      step: '04',
      action: 'Overnight Seal',
      title: 'Nourish with Midnight Repair Night Cream',
      desc: 'Smooth a rich layer over the face. It delivers intensive lipids and active anti-aging complexes to repair a compromised skin barrier.',
      productSlug: 'midnight-repair-night-cream',
      duration: '1.5 Mins'
    },
    {
      step: '05',
      action: 'Specialist Care',
      title: 'Revitalize with Golden Hour Eye Cream',
      desc: 'Dot gently around the orbital bone using your ring finger. It targets under-eye dark circles, morning puffiness, and fine expression lines.',
      productSlug: 'golden-hour-eye-cream',
      duration: '1 Min'
    }
  ]
};

const WEEKLY_RITUAL = {
  title: 'Weekly Sunday Glow Ritual',
  subtitle: 'Indulge, detoxify, and pamper.',
  description: 'A luxurious weekend ritual that deeply cleanses, extracts impurities, and infuses skin with precious Indian Saffron for a healthy, radiant week ahead.',
  colorTheme: 'from-amber-600/10 via-amber-600/5 to-transparent',
  accentColor: '#D4A843',
  icon: <Calendar size={24} className="text-yellow-600" />,
  steps: [
    {
      step: '01',
      action: 'Cleanse',
      title: 'Prepare with Petal Soft Foam',
      desc: 'Begin with a clean canvas. Wash with warm water to open pores for the nourishing mask treatment.',
      productSlug: 'petal-soft-cleansing-foam',
      duration: '1 Min'
    },
    {
      step: '02',
      action: 'Weekly Mask',
      title: 'Indulge in Saffron Glow Face Mask',
      desc: 'Apply an even layer over the face, avoiding the eye area. Inhale the relaxing aroma and rest for 15 minutes as the active saffron and clay purify and brighten.',
      productSlug: 'saffron-glow-face-mask',
      duration: '15 Mins'
    },
    {
      step: '03',
      action: 'Balance',
      title: 'Refresh with Niacinamide Clarity Toner',
      desc: 'After rinsing the mask off, pat toner onto your skin to calm and tighten pores immediately.',
      productSlug: 'niacinamide-clarity-toner',
      duration: '30 Sec'
    },
    {
      step: '04',
      action: 'Infuse Hydration',
      title: 'Deeply Nourish with Velvet Hydra Gel',
      desc: 'Lock in the saffron glow with a generous layer of moisturiser. Massage gently until fully absorbed.',
      productSlug: 'velvet-hydra-moisturiser',
      duration: '2 Mins'
    }
  ]
};

// ── Advisor Quiz Data ──
const QUIZ_STEPS = [
  {
    id: 'skin-type',
    question: 'How does your skin feel in the afternoon?',
    options: [
      { value: 'dry', label: 'Dry & Tight', desc: 'Flaky patches or feels stretched' },
      { value: 'oily', label: 'Oily & Shiny', desc: 'Excess grease, especially in the T-zone' },
      { value: 'combination', label: 'Combination', desc: 'Oily nose/forehead, dry cheeks' },
      { value: 'sensitive', label: 'Sensitive', desc: 'Prone to redness, burning, or irritation' }
    ]
  },
  {
    id: 'skin-concern',
    question: 'What is your primary skin concern?',
    options: [
      { value: 'pigmentation', label: 'Hyperpigmentation', desc: 'Dark spots, sun damage, or uneven tone' },
      { value: 'hydration', label: 'Dryness / Dehydration', desc: 'Lack of plumpness and overall dullness' },
      { value: 'acne', label: 'Acne & Large Pores', desc: 'Breakouts, blackheads, and visible pores' },
      { value: 'anti-aging', label: 'Fine Lines & Wrinkles', desc: 'Loss of elasticity or firmness' }
    ]
  }
];

export default function RitualsPage() {
  const [activeTab, setActiveTab] = useState<'am' | 'pm' | 'weekly'>('am');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizStepIdx, setQuizStepIdx] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

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
      quantity: 1,
      image_url: product.images[0]?.url || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const getProductBySlug = (slug: string) => {
    return DEMO_PRODUCTS.find((p) => p.slug === slug);
  };

  // Get active ritual configuration
  const getActiveRitual = () => {
    switch (activeTab) {
      case 'am':
        return MORNING_RITUAL;
      case 'pm':
        return EVENING_RITUAL;
      case 'weekly':
        return WEEKLY_RITUAL;
    }
  };

  const currentRitual = getActiveRitual();

  // Handle quiz option selection
  const handleQuizSelect = (value: string) => {
    const currentStep = QUIZ_STEPS[quizStepIdx];
    const newAnswers = { ...quizAnswers, [currentStep.id]: value };
    setQuizAnswers(newAnswers);

    if (quizStepIdx < QUIZ_STEPS.length - 1) {
      setQuizStepIdx(quizStepIdx + 1);
    } else {
      setShowQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizStepIdx(0);
    setShowQuizResult(false);
  };

  // Get recommended products based on quiz answers
  const getRecommendedProducts = () => {
    const skinType = quizAnswers['skin-type'];
    const concern = quizAnswers['skin-concern'];

    if (!skinType || !concern) return [];

    // Filter products matching skin type or skin concern
    return DEMO_PRODUCTS.filter((prod) => {
      const typeMatch = prod.skin_types.includes(skinType as any) || prod.skin_types.includes('all');
      const concernMatch = prod.skin_concerns.includes(concern as any);
      return typeMatch && concernMatch;
    }).slice(0, 3); // Max 3 items
  };

  // If filtered products is empty, get fallback products
  const getFinalRecommendations = () => {
    const matched = getRecommendedProducts();
    if (matched.length > 0) return matched;

    // Fallback: Return Cleanser, Serum, and Moisturiser
    const fallbackSlugs = ['petal-soft-cleansing-foam', 'radiance-revival-serum', 'velvet-hydra-moisturiser'];
    return fallbackSlugs.map((slug) => getProductBySlug(slug)).filter(Boolean) as ProductCardData[];
  };

  const recommendedSet = getFinalRecommendations();

  // Add all recommended products to cart
  const addSetToCart = () => {
    if (recommendedSet.length === 0) return;

    recommendedSet.forEach((product) => {
      const primaryVariant = product.variants[0];
      addItem({
        product_id: product.id,
        variant_id: primaryVariant?.id || null,
        product_name: product.name,
        product_slug: product.slug,
        variant_name: primaryVariant?.name || null,
        unit_price: primaryVariant?.price ?? product.sale_price ?? product.base_price,
        quantity: 1,
        image_url: product.images[0]?.url || '',
      });
    });

    toast.success('Successfully added all recommended items to your cart!');
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-obsidian pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-pattern-luxury opacity-20" />
        {/* Glowing background circles */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #9B7465 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="container-lanan relative z-10 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={12} className="text-gold" />
              <span className="text-gold text-[10px] font-body font-medium tracking-widest uppercase">
                Sacred Skincare Sequences
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="font-heading text-4xl lg:text-6xl text-ivory font-light leading-none mb-6">
              Skincare is a <br />
              <span className="text-gradient-gold italic">Conscious Ritual.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-taupe/80 text-sm lg:text-base font-body leading-relaxed max-w-xl mx-auto">
              Our formulas are crafted to work in alignment. Discover step-by-step rituals tailored for morning defense, evening recovery, and weekly rejuvenation, balanced carefully for Indian skin and climate.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          TAB BEDROOM / NAVIGATION
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-beige sticky top-[72px] z-30">
        <div className="container-lanan">
          <div className="flex justify-center gap-4 lg:gap-8 py-4">
            {[
              { id: 'am', label: 'Morning (AM)', icon: <Sun size={14} /> },
              { id: 'pm', label: 'Evening (PM)', icon: <Moon size={14} /> },
              { id: 'weekly', label: 'Weekly Glow', icon: <Calendar size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-body font-semibold uppercase tracking-wider transition-all duration-300 border',
                  activeTab === tab.id
                    ? 'bg-obsidian text-ivory border-obsidian'
                    : 'bg-ivory text-taupe border-beige hover:border-gold/40 hover:text-gold'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          EDITORIAL STEP-BY-STEP SEQUENCE
      ════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 bg-white relative">
        <div className="container-lanan max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45 }}
              className="grid lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Ritual Details & Philosophy */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                    {currentRitual.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-body font-bold text-gold uppercase tracking-widest block">
                      Sequence
                    </span>
                    <h2 className="font-heading text-2xl text-obsidian font-light">
                      {currentTabName(activeTab)}
                    </h2>
                  </div>
                </div>

                <p className="font-body text-xs text-taupe leading-relaxed">
                  {currentRitual.description}
                </p>

                <div className="bg-ivory rounded-2xl p-5 border border-beige/60 space-y-4">
                  <h4 className="font-body font-semibold text-xs text-obsidian flex items-center gap-2">
                    <Info size={14} className="text-gold" />
                    Pro Application Tip
                  </h4>
                  <p className="text-[11px] font-body text-taupe leading-relaxed">
                    Always apply products from thinnest consistency (toner, serum) to thickest (moisturiser, oil/night cream). Wait 30-60 seconds between steps to allow each formula to absorb completely.
                  </p>
                </div>
              </div>

              {/* Right Column: Step timeline */}
              <div className="lg:col-span-8 space-y-8 relative">
                {/* Timeline vertical bar */}
                <div className="absolute top-4 bottom-4 left-6 w-[2px] bg-beige/40 pointer-events-none hidden md:block" />

                {currentRitual.steps.map((step, idx) => {
                  const matchedProduct = getProductBySlug(step.productSlug);

                  return (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="group relative grid md:grid-cols-[60px_1fr] gap-6 items-start"
                    >
                      {/* Timeline Dot & Number */}
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-gold/40 bg-white group-hover:border-gold group-hover:bg-gold/5 transition-all duration-300 flex-shrink-0 mx-auto md:mx-0">
                        <span className="font-heading text-sm text-gold font-bold">{step.step}</span>
                      </div>

                      {/* Content block */}
                      <div className="card-luxury p-6 bg-ivory/30 border border-beige/60 group-hover:border-gold/30 hover:bg-white transition-all duration-300">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-body font-bold text-gold uppercase tracking-wider bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full">
                            {step.action}
                          </span>
                          <span className="text-[10px] font-mono text-taupe flex items-center gap-1">
                            ⏱ {step.duration}
                          </span>
                        </div>

                        <h3 className="font-heading text-lg text-obsidian font-light mb-2">
                          {step.title}
                        </h3>
                        <p className="text-xs font-body text-taupe leading-relaxed mb-4">
                          {step.desc}
                        </p>

                        {/* Integrated product match */}
                        {matchedProduct && (
                          <div className="bg-white p-3.5 rounded-xl border border-beige/60 hover:border-gold/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 relative bg-ivory rounded-lg overflow-hidden flex-shrink-0 border border-beige/20">
                                <Image
                                  src={matchedProduct.images[0]?.url || ''}
                                  alt={matchedProduct.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-xs font-body font-bold text-obsidian leading-snug">
                                  {matchedProduct.name}
                                </h4>
                                <span className="text-[10px] font-mono text-gold font-medium mt-0.5 block">
                                  {formatPrice(matchedProduct.sale_price ?? matchedProduct.base_price)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                              <Link
                                href={`/products/${matchedProduct.slug}`}
                                className="flex-1 sm:flex-none text-center px-4 py-2 rounded-full border border-beige hover:border-gold text-[10px] font-body font-semibold uppercase tracking-wider text-taupe hover:text-gold transition-colors whitespace-nowrap"
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => handleAddToCart(matchedProduct)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gold text-obsidian hover:bg-gold/90 px-4 py-2 rounded-full text-[10px] font-body font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                              >
                                <ShoppingBag size={11} />
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          INTERACTIVE SKIN ADVISOR (THE QUIZ)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-ivory/60 border-t border-b border-beige relative overflow-hidden">
        {/* Background visual accents */}
        <div className="absolute inset-0 bg-pattern-luxury opacity-10 pointer-events-none" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #9B7465 0%, transparent 70%)' }}
        />

        <div className="container-lanan max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <span className="text-[11px] font-body font-semibold tracking-widest uppercase text-gold block mb-2">
              Skin Advisor
            </span>
            <h2 className="section-title">
              Find Your <em className="italic text-gold">Skincare Match</em>
            </h2>
            <div className="divider-gold mt-3 mx-auto" />
            <p className="font-body text-xs text-taupe mt-4 max-w-md mx-auto">
              Answer 2 simple questions to find the ideal sequence of products formulated specifically for your skin type and concerns.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-beige p-6 md:p-10 shadow-luxury">
            <AnimatePresence mode="wait">
              {!showQuizResult ? (
                <motion.div
                  key={`step-${quizStepIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step counter */}
                  <div className="flex justify-between items-center text-[10px] font-body font-bold text-taupe uppercase tracking-wider">
                    <span>Question {quizStepIdx + 1} of {QUIZ_STEPS.length}</span>
                    <span className="text-gold">Advisor Tool</span>
                  </div>

                  <h3 className="font-heading text-xl lg:text-2xl text-obsidian font-light leading-tight">
                    {QUIZ_STEPS[quizStepIdx].question}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    {QUIZ_STEPS[quizStepIdx].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuizSelect(opt.value)}
                        className="group flex flex-col items-start p-5 rounded-2xl border border-beige bg-ivory/20 hover:border-gold/40 hover:bg-gold/5 text-left transition-all duration-300"
                      >
                        <span className="font-body font-semibold text-sm text-obsidian group-hover:text-gold transition-colors">
                          {opt.label}
                        </span>
                        <span className="text-xs font-body text-taupe mt-1.5 leading-relaxed">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold mx-auto mb-4 animate-bounce">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-[10px] font-body font-bold text-gold uppercase tracking-wider block">
                      Recommendations Ready
                    </span>
                    <h3 className="font-heading text-2xl lg:text-3xl text-obsidian font-light mt-1">
                      Your Customized Routine
                    </h3>
                    <p className="text-xs font-body text-taupe mt-2">
                      Optimized for <strong className="text-obsidian font-semibold capitalize">{quizAnswers['skin-type']}</strong> skin facing <strong className="text-obsidian font-semibold capitalize">{quizAnswers['skin-concern']}</strong> concerns.
                    </p>
                  </div>

                  {/* Matched product list */}
                  <div className="space-y-4 pt-4">
                    {recommendedSet.map((prod, idx) => (
                      <div
                        key={prod.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-beige/60 bg-ivory/20 gap-4"
                      >
                        <div className="flex gap-4 items-center">
                          <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-[11px] font-bold text-gold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="w-12 h-12 relative bg-white rounded-xl overflow-hidden flex-shrink-0 border border-beige/40">
                            <Image
                              src={prod.images[0]?.url || ''}
                              alt={prod.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-body font-bold text-obsidian">{prod.name}</h4>
                            <p className="text-[10px] font-body text-taupe leading-none mt-0.5">{prod.tagline}</p>
                            <span className="text-[10px] font-mono text-gold mt-1 block">
                              {formatPrice(prod.sale_price ?? prod.base_price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 w-full sm:w-auto self-end sm:self-center">
                          <Link
                            href={`/products/${prod.slug}`}
                            className="btn-outline-gold text-[10px] py-2 px-4 flex-1 sm:flex-initial text-center uppercase tracking-wider"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="btn-gold text-[10px] py-2 px-4 flex-1 sm:flex-initial uppercase tracking-wider"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* One-click Add all */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-beige/40">
                    <button
                      onClick={addSetToCart}
                      className="btn-gold flex-1 justify-center py-4 px-6 text-xs uppercase tracking-wider"
                    >
                      <ShoppingBag size={14} />
                      Add Complete Ritual to Cart
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="btn-outline-gold py-4 px-6 text-xs justify-center uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} />
                      Retake Quiz
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RITUALS TRUST & ETHICS REASONS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-lanan max-w-4xl text-center">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mx-auto mb-6">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-heading text-3xl font-light text-obsidian leading-tight">
            Designed for Efficacy, Crafted with Love
          </h2>
          <p className="text-xs font-body text-taupe leading-relaxed max-w-xl mx-auto mt-4">
            Skincare is a personal journey that relies heavily on consistency. By pairing active botanicals with clinically active compounds, our rituals target specific concerns while keeping the overall skin lipid barrier resilient and hydrated.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12 text-left">
            {[
              { title: 'Dermatologically Safe', desc: 'Tested thoroughly across diverse skin profiles to guarantee safety and prevent irritation.' },
              { title: 'Clean & Safe', desc: 'Free of parabens, sulphates, artificial colorants, and mineral oils.' },
              { title: 'Climate Engineered', desc: 'Light, sweat-resistant, fast-absorbing formulations suited for Indian humidity.' }
            ].map((feat, idx) => (
              <div key={idx} className="bg-ivory/40 p-5 rounded-2xl border border-beige/60">
                <span className="text-gold text-xs font-bold font-mono">0{idx + 1} //</span>
                <h4 className="font-heading text-base text-obsidian mt-2">{feat.title}</h4>
                <p className="text-xs font-body text-taupe mt-1.5 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Utility to display tab name
function currentTabName(tab: 'am' | 'pm' | 'weekly') {
  switch (tab) {
    case 'am':
      return 'Morning Sequence';
    case 'pm':
      return 'Evening Sequence';
    case 'weekly':
      return 'Weekly Glow Sequence';
  }
}
