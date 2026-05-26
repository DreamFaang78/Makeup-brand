'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Ingredients Page
// Premium ingredient glossary with hover-expand cards & brand storytelling
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Droplets, Sparkles, Sun, Leaf, FlaskConical, Wind,
  ArrowRight, Shield, Zap, Heart, Star, Eye, Waves,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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

/* ── Ingredient Data ── */
const HERO_INGREDIENTS = [
  {
    icon: <Droplets size={28} />,
    name: "Hyaluronic Acid",
    tagline: "Your skin's built-in reservoir — turned up to maximum.",
    benefit: "Deep hydration & plumping",
    color: "from-blue-50 to-cyan-50",
    accent: "#5BA4CF",
    story:
      "Think of it less like a moisturiser and more like a magnet. Hyaluronic Acid draws water molecules from the air itself and locks them deep within the skin's layers. A single molecule can hold up to 1,000 times its own weight in water — and you can feel exactly that difference within days. Fine lines soften. That tight, papery feeling disappears. What remains is skin that feels genuinely nourished — not just coated.",
    benefits: ["Plumps fine lines without heaviness", "Works in humid and dry climates alike", "Weightless — layers seamlessly under everything", "Suitable for every skin type, including oily"],
    foundIn: ["Velvet Hydra Serum", "Cloud Moisturiser"],
    science: "Molecular weight matters here. We use both high and low molecular weight HA — large molecules sit on the surface, small ones penetrate deeper layers.",
  },
  {
    icon: <Sparkles size={28} />,
    name: "Niacinamide",
    tagline: "The quiet overachiever your skin has been waiting for.",
    benefit: "Brightening & pore refinement",
    color: "from-amber-50 to-yellow-50",
    accent: "#C9A96E",
    story:
      "Niacinamide doesn't announce itself — it just works. Also called Vitamin B3, it handles a surprisingly wide range of skin concerns simultaneously: it nudges your pores to appear smaller, tells your skin to slow down oil production, and quietly fades those stubborn dark spots left behind by old breakouts. The skin barrier — your first defence against the world — gets measurably stronger with continued use. The result is a complexion that looks like it simply takes care of itself.",
    benefits: ["Visibly tightens enlarged pores", "Reduces excess oil without stripping", "Fades post-breakout pigmentation", "Reinforces the skin barrier over time"],
    foundIn: ["Glass Skin Elixir", "Clarity Toner"],
    science: "At 5–10% concentration, Niacinamide inhibits melanosome transfer — the process that deposits pigment in the skin, reducing the appearance of dark spots.",
  },
  {
    icon: <Sun size={28} />,
    name: "Saffron Extract",
    tagline: "Ancient radiance. Scientifically understood.",
    benefit: "Radiance & even tone",
    color: "from-yellow-50 to-orange-50",
    accent: "#D4A843",
    story:
      "Saffron has been pressed into golden skin pastes for centuries across South Asia. Modern science has now named exactly what our grandmothers always sensed: it's a potent antioxidant, a mild skin-brightener, and an anti-inflammatory — all at once. In our formulations, Saffron Extract works at the surface level to tackle dullness and uneven tone, while its free-radical neutralising properties quietly protect against daily environmental stress. The warmth it imparts to the complexion isn't theatrical. It's just your skin, finally unobscured.",
    benefits: ["Evens out stubborn hyperpigmentation", "Adds a natural, warm luminosity", "Neutralises free radical damage", "Anti-inflammatory — calms reactive skin"],
    foundIn: ["Saffron Glow Serum", "Radiance Revival Mask"],
    science: "Safranal and crocin — saffron's active compounds — have been studied for their ability to inhibit tyrosinase, the enzyme responsible for melanin production.",
  },
  {
    icon: <Leaf size={28} />,
    name: "Aloe Vera",
    tagline: "Nothing soothes a troubled skin like something that grew in the wild.",
    benefit: "Soothing & barrier repair",
    color: "from-green-50 to-emerald-50",
    accent: "#5C9E72",
    story:
      "Aloe Vera's reputation is well-earned and then some. Beneath its fleshy leaves sits a gel that contains over 75 active compounds — vitamins A, C, E, and B12; a library of enzymes; amino acids; and a suite of minerals. Together they reduce redness almost instantly, accelerate the skin's own healing processes, and provide hydration that feels cool and immediate without any film or stickiness. It makes a formula gentler without making it weaker. We use cold-processed leaf extract to ensure none of those active compounds are destroyed before they reach your skin.",
    benefits: ["Instant calm for red, irritated skin", "Speeds up surface-level skin repair", "Delivers vitamins directly to the epidermis", "Non-comedogenic — never clogs pores"],
    foundIn: ["Cloud Moisturiser", "Calming Cleanse Gel"],
    science: "Aloe contains acemannan — a polysaccharide that boosts fibroblast activity, the cells responsible for producing collagen and skin repair.",
  },
  {
    icon: <FlaskConical size={28} />,
    name: "Vitamin C",
    tagline: "The glow ingredient. No metaphor needed.",
    benefit: "Antioxidant & luminosity",
    color: "from-orange-50 to-red-50",
    accent: "#E8884F",
    story:
      "Vitamin C does two things that very few ingredients can do at once: it protects and it corrects. It neutralises the oxidative stress from UV exposure, pollution, and screen time — the daily invisible damage that accumulates into dullness and early ageing. Simultaneously, it tells your skin to produce more collagen, the protein responsible for firmness and that plump, alive quality. Over weeks, uneven patches lighten. Texture smooths. Lines soften. The overall impression is a complexion that appears well-rested — even when you aren't. We stabilise our Vitamin C in a derivative form to ensure it stays active in the formula long after you've opened the bottle.",
    benefits: ["Brightens and evens skin tone over time", "Boosts natural collagen production", "Shields against UV and pollution damage", "Firms and tightens the overall complexion"],
    foundIn: ["Vitamin C Radiance Serum", "Glow Boost Moisturiser"],
    science: "L-Ascorbic Acid stimulates collagen synthesis by activating prolyl and lysyl hydroxylases — the enzymes that stabilise the collagen triple helix structure.",
  },
  {
    icon: <Wind size={28} />,
    name: "Peptides",
    tagline: "The message your skin has been waiting to receive.",
    benefit: "Firming & anti-ageing",
    color: "from-purple-50 to-pink-50",
    accent: "#9B7BD4",
    story:
      "Peptides are short chains of amino acids — essentially fragments of protein. But what makes them remarkable is what they communicate: when applied topically, certain peptides send the skin a signal that collagen has broken down and needs to be rebuilt. The skin responds by doing exactly that. The result, with consistent use, is measurably firmer skin. Not dramatically or overnight — but the kind of improvement that makes you look at an old photo and notice something has changed for the better. We blend Matrixyl 3000 with copper peptides for a formulation that works on multiple levels simultaneously.",
    benefits: ["Rebuilds collagen from the inside out", "Firms and lifts over consistent use", "Reduces the depth of expression lines", "Supports elastin production for resilience"],
    foundIn: ["Youth Peptide Serum", "Firming Night Cream"],
    science: "Palmitoyl tripeptide-1 and tetrapeptide-7 (Matrixyl 3000) have been clinically shown to reduce wrinkle depth by up to 45% over 60 days.",
  },
  {
    icon: <Waves size={28} />,
    name: "Ceramides",
    tagline: "The walls that keep good things in and bad things out.",
    benefit: "Barrier protection & repair",
    color: "from-slate-50 to-gray-50",
    accent: "#8B9BAE",
    story:
      "Ceramides are lipids — fats, essentially — that make up roughly half of your skin's outermost layer. They're the mortar between the bricks of your skin cells. When ceramide levels are depleted (by over-cleansing, harsh actives, ageing, or environmental exposure), moisture escapes and irritants get in. You feel it as tightness, flaking, or sensitivity. Replenishing ceramides is one of the most direct ways to restore a compromised barrier. Our formulas use synthetic ceramides that are structurally identical to those your skin produces naturally — so they integrate seamlessly rather than sitting on the surface.",
    benefits: ["Restores a damaged or sensitised skin barrier", "Locks moisture in for 24-hour hydration", "Reduces sensitivity and reactive flare-ups", "Protects against environmental aggressors"],
    foundIn: ["Barrier Repair Cream", "Sensitive Skin Shield"],
    science: "Skin ceramides decrease by approximately 30% by age 30. Topical ceramide application has been shown to restore transepidermal water loss (TEWL) within 4 weeks.",
  },
  {
    icon: <Shield size={28} />,
    name: "Bakuchiol",
    tagline: "Retinol's calmer, kinder, plant-born cousin.",
    benefit: "Cell renewal without irritation",
    color: "from-rose-50 to-pink-50",
    accent: "#C97B9A",
    story:
      "Retinol is powerful — but it demands a lot from your skin: redness, peeling, and weeks of sensitivity before results appear. Bakuchiol delivers the same regenerative outcomes through a different mechanism, without any of that. Derived from the Psoralea corylifolia plant — used in Ayurvedic medicine for centuries — it speeds up cell turnover, reduces fine lines, and improves skin texture with a gentleness that lets you use it nightly from day one. It's especially meaningful for those who've wanted retinol's results but found their skin couldn't tolerate it. Now it can.",
    benefits: ["Accelerates skin cell renewal gently", "Safe to use every night without buildup", "No photosensitivity — suitable for daytime too", "Pregnancy-safe alternative to retinol"],
    foundIn: ["Bakuchiol Renewal Serum", "Gentle Night Treatment"],
    science: "A 2019 clinical trial published in the British Journal of Dermatology found Bakuchiol equivalent to 0.5% retinol in reducing wrinkle depth and hyperpigmentation.",
  },
  {
    icon: <Eye size={28} />,
    name: "Caffeine",
    tagline: "Your morning ritual, rewritten for your skin.",
    benefit: "De-puffing & circulation",
    color: "from-amber-50 to-yellow-50",
    accent: "#8B6E52",
    story:
      "The same molecule that clears your head in the morning is quietly one of the most effective topical actives for under-eye concerns. Caffeine constricts blood vessels beneath the skin's surface, reducing the pooling of fluid that causes puffiness. Simultaneously, it boosts microcirculation — meaning dark circles caused by poor blood flow lighten visibly with regular use. It's also a potent antioxidant, neutralising the oxidative stress that accelerates the thinning of delicate under-eye skin. The result is eyes that look genuinely awake — not just dusted with highlighter.",
    benefits: ["Reduces morning puffiness within minutes", "Lightens dark circles over consistent use", "Antioxidant protection for delicate eye skin", "Stimulates microcirculation for brightness"],
    foundIn: ["Bright Eyes Concentrate", "De-Puff Eye Gel"],
    science: "Topical caffeine at 3% has been shown to reduce fat cell accumulation and improve lymphatic drainage in the periorbital area, measured via ultrasound imaging.",
  },
  {
    icon: <Heart size={28} />,
    name: "Turmeric Extract",
    tagline: "The golden root that goes deeper than skin.",
    benefit: "Anti-inflammatory & glow",
    color: "from-yellow-50 to-amber-50",
    accent: "#C9A340",
    story:
      "Turmeric has been pressed into skin pastes at weddings, used in daily ubtans, and trusted across generations — not out of ritual alone, but because it genuinely works. The active compound, curcumin, is one of the most well-studied anti-inflammatory and antioxidant agents in natural skincare. It calms acne inflammation, reduces post-breakout redness, and over time evens out the overall skin tone. We use a purified, skin-optimised extract that delivers curcumin's benefits without the characteristic staining — so you get all of the glow, none of the yellow tint.",
    benefits: ["Calms acne-related inflammation rapidly", "Reduces redness and post-breakout marks", "Powerful antioxidant — fights daily skin stress", "Brightens dull skin tone with regular use"],
    foundIn: ["Golden Glow Serum", "Brightening Ubtan Mask"],
    science: "Curcumin inhibits NF-κB signalling pathways — one of the primary triggers of skin inflammation — making it clinically effective for inflammatory skin conditions.",
  },
  {
    icon: <Zap size={28} />,
    name: "Retinal (Retinaldehyde)",
    tagline: "One step from retinol. Ten steps ahead in gentleness.",
    benefit: "Accelerated skin renewal",
    color: "from-violet-50 to-purple-50",
    accent: "#7B6FD4",
    story:
      "Retinaldehyde sits in a precise position in the Vitamin A family: it's one conversion step away from retinoic acid (prescription-strength retinol) but significantly less irritating than retinol itself. What this means in practice is that you get results that work faster than retinol — typically within 4 weeks instead of 12 — with a fraction of the peeling and redness. Cell turnover accelerates. Collagen production ramps up. Pigmentation fades. Texture refines. It's the kind of ingredient that earns your trust quietly, one morning mirror check at a time.",
    benefits: ["Faster results than standard retinol", "Significantly reduced irritation risk", "Effective for texture, lines, and pigmentation", "Suitable for those who have tried and quit retinol"],
    foundIn: ["Advanced Renewal Complex", "Night Renewal Concentrate"],
    science: "Retinaldehyde converts to retinoic acid in a single enzymatic step versus retinol's two steps, making it 11x more potent than retinol gram-for-gram.",
  },
  {
    icon: <Star size={28} />,
    name: "Kojic Acid",
    tagline: "The precision tool for stubborn spots.",
    benefit: "Targeted brightening",
    color: "from-teal-50 to-green-50",
    accent: "#4DA8A0",
    story:
      "Kojic Acid is derived from the fermentation process of certain fungi — specifically during sake and miso production in Japan. It's one of the most direct and well-evidenced ingredients for addressing stubborn hyperpigmentation. It works by blocking tyrosinase — the enzyme your skin uses to produce melanin — at the source. Sun spots, melasma patches, and post-acne marks all respond to it with consistent use. Paired with Vitamin C or Niacinamide in our formulations, its brightening effect is amplified considerably. It's for skin that has given up on being even-toned — and deserves a reason to try again.",
    benefits: ["Directly targets stubborn hyperpigmentation", "Effective on melasma and sun-damage marks", "Works synergistically with Vitamin C", "Gentler than hydroquinone with comparable results"],
    foundIn: ["Even Tone Serum", "Spot Correction Treatment"],
    science: "Kojic Acid chelates copper ions required for tyrosinase activity, effectively switching off melanin overproduction at a biochemical level.",
  },
];

/* ── Category filter pills ── */
const CATEGORIES = ['All', 'Hydration', 'Brightening', 'Anti-Ageing', 'Soothing', 'Repair'];
const CATEGORY_MAP: Record<string, string[]> = {
  Hydration: ['Hyaluronic Acid', 'Ceramides', 'Aloe Vera'],
  Brightening: ['Vitamin C', 'Niacinamide', 'Saffron Extract', 'Kojic Acid', 'Turmeric Extract'],
  'Anti-Ageing': ['Peptides', 'Retinal (Retinaldehyde)', 'Bakuchiol', 'Vitamin C'],
  Soothing: ['Aloe Vera', 'Turmeric Extract', 'Ceramides', 'Bakuchiol'],
  Repair: ['Ceramides', 'Peptides', 'Bakuchiol', 'Retinal (Retinaldehyde)'],
};

/* ── Individual ingredient card ── */
function IngredientCard({ item, index }: { item: typeof HERO_INGREDIENTS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="group relative bg-white rounded-2xl border border-beige hover:border-gold/40 transition-all duration-500 overflow-hidden cursor-default"
      style={{
        boxShadow: expanded
          ? '0 8px 40px rgba(201,169,110,0.12), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Gradient top bar */}
      <motion.div
        className={`h-1 w-full bg-gradient-to-r ${item.color}`}
        animate={{ opacity: expanded ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start gap-4 mb-3">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${item.accent}18`, color: item.accent }}
            animate={{ scale: expanded ? 1.08 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {item.icon}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-obsidian font-medium text-lg leading-tight mb-0.5">
              {item.name}
            </h3>
            <span
              className="text-[11px] font-body font-semibold tracking-widest uppercase"
              style={{ color: item.accent }}
            >
              {item.benefit}
            </span>
          </div>
        </div>

        {/* Tagline — always visible */}
        <p className="text-sm font-body text-charcoal leading-relaxed italic mb-0">
          "{item.tagline}"
        </p>

        {/* Expanded content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-beige/60 space-y-4">
                {/* Story paragraph */}
                <p className="text-sm font-body text-taupe leading-relaxed">
                  {item.story}
                </p>

                {/* Benefits list */}
                <div>
                  <p className="text-[11px] font-body font-semibold tracking-widest uppercase text-obsidian mb-2">
                    What it does
                  </p>
                  <ul className="space-y-1.5">
                    {item.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-body text-charcoal">
                        <span
                          className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.accent }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The Science */}
                <div className="bg-ivory/80 rounded-xl p-3 border border-beige/60">
                  <p className="text-[10px] font-body font-semibold tracking-widest uppercase text-taupe mb-1">
                    The Science
                  </p>
                  <p className="text-xs font-body text-charcoal leading-relaxed">
                    {item.science}
                  </p>
                </div>

                {/* Found in */}
                {item.foundIn.length > 0 && (
                  <div>
                    <p className="text-[10px] font-body font-semibold tracking-widest uppercase text-taupe mb-2">
                      Found in
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.foundIn.map((product, i) => (
                        <Link
                          key={i}
                          href="/shop"
                          className="text-[11px] font-body px-2.5 py-1 rounded-full border transition-colors duration-200"
                          style={{
                            borderColor: `${item.accent}40`,
                            color: item.accent,
                            backgroundColor: `${item.accent}08`,
                          }}
                        >
                          {product}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-3 right-3 text-[10px] font-body font-medium tracking-widest uppercase"
        style={{ color: item.accent }}
        animate={{ opacity: expanded ? 0 : 0.6 }}
        transition={{ duration: 0.2 }}
      >
        Hover to explore ↑
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page Component
───────────────────────────────────────────────────────────────────────────── */
export default function IngredientsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? HERO_INGREDIENTS
    : HERO_INGREDIENTS.filter((i) => CATEGORY_MAP[activeCategory]?.includes(i.name));

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-obsidian pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A96E 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #9B7465 0%, transparent 70%)' }}
        />
        {/* Gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="container-lanan relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 mb-6">
              <FlaskConical size={12} className="text-gold" />
              <span className="text-gold text-[11px] font-body font-medium tracking-widest uppercase">
                Ingredient Glossary
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="font-heading text-4xl lg:text-6xl text-ivory font-light leading-tight mb-6 max-w-3xl">
              Every ingredient<br />
              <span className="text-gold italic">earns its place.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-taupe/80 text-base lg:text-lg font-body leading-relaxed max-w-xl">
              We don&apos;t list ingredients to fill space on a label. Each one was chosen for a reason,
              tested for a purpose, and used at a concentration that actually does what it claims.
              Here&apos;s the full story behind what&apos;s in your formula.
            </p>
          </FadeUp>

          {/* Stats row */}
          <FadeUp delay={0.3} className="mt-12">
            <div className="flex flex-wrap gap-8">
              {[
                { value: '12', label: 'Active ingredients' },
                { value: '0', label: 'Harmful fillers' },
                { value: '100%', label: 'Transparency' },
                { value: '3rd party', label: 'Lab tested' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl text-gold font-medium">{stat.value}</p>
                  <p className="text-xs font-body text-taupe/70 tracking-wider uppercase mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Our Promise Banner ── */}
      <section className="bg-white border-b border-beige">
        <div className="container-lanan py-8">
          <div className="flex flex-wrap gap-6 justify-between items-center">
            {[
              { icon: <Shield size={16} className="text-gold" />, text: 'No parabens. No sulphates. No shortcuts.' },
              { icon: <Leaf size={16} className="text-gold" />, text: 'Ethically sourced. Responsibly formulated.' },
              { icon: <FlaskConical size={16} className="text-gold" />, text: 'Every batch third-party lab tested.' },
              { icon: <Heart size={16} className="text-gold" />, text: '100% cruelty-free. Always.' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {item.icon}
                <span className="text-sm font-body text-charcoal">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro Philosophy ── */}
      <section className="container-lanan py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <span className="text-[11px] font-body font-semibold tracking-widest uppercase text-gold block mb-4">
              Our Philosophy
            </span>
            <h2 className="font-heading text-3xl lg:text-4xl text-obsidian font-light leading-tight mb-6">
              Less noise. More results.
            </h2>
            <p className="text-charcoal font-body leading-relaxed text-base">
              The skincare industry has a habit of making the simple sound complicated, and the complicated sound like magic.
              We prefer a different approach: choose fewer ingredients, understand them deeply, and use them at concentrations
              that have actually been studied. Every formula at LANAN starts with a question — not &quot;what&apos;s trending?&quot; but
              &quot;what does this skin genuinely need?&quot; The ingredients below are our answers.
            </p>
            <p className="text-taupe font-body leading-relaxed text-sm mt-4 italic">
              Hover over any ingredient to read the full story — what it is, why it works, and where to find it.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Filter Pills ── */}
      <section className="container-lanan pb-6">
        <FadeUp>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-body font-medium tracking-wider uppercase transition-all duration-250 border ${
                  activeCategory === cat
                    ? 'bg-obsidian text-ivory border-obsidian'
                    : 'bg-white text-charcoal border-beige hover:border-gold/40 hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ── Ingredient Grid ── */}
      <section className="container-lanan pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((item, i) => (
              <IngredientCard key={item.name} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-taupe font-body">
            No ingredients in this category yet.
          </div>
        )}
      </section>

      {/* ── What We Never Use ── */}
      <section className="bg-obsidian py-16 lg:py-20">
        <div className="container-lanan">
          <FadeUp className="text-center mb-12">
            <span className="text-[11px] font-body font-semibold tracking-widest uppercase text-gold block mb-3">
              Our No-List
            </span>
            <h2 className="font-heading text-3xl text-ivory font-light">
              What we deliberately leave out.
            </h2>
            <p className="text-taupe/70 text-sm font-body mt-4 max-w-xl mx-auto">
              A formula&apos;s integrity is also defined by what&apos;s absent. These are the common
              industry shortcuts we&apos;ve chosen not to take.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Parabens', reason: 'Potential hormone disruption' },
              { name: 'Sulphates', reason: 'Strip natural skin oils' },
              { name: 'Mineral Oil', reason: 'Clogs pores, no benefit' },
              { name: 'Artificial Fragrance', reason: 'Common irritant allergen' },
              { name: 'Formaldehyde', reason: 'Known skin sensitiser' },
              { name: 'Hydroquinone', reason: 'Potentially harmful long-term' },
            ].map((item, i) => (
              <FadeUp key={item.name} delay={i * 0.07}>
                <div className="group bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-gold/30 hover:bg-white/8 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-400 text-sm font-bold">✕</span>
                  </div>
                  <p className="text-ivory text-xs font-body font-semibold mb-1">{item.name}</p>
                  <p className="text-taupe/60 text-[10px] font-body leading-tight">{item.reason}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ivory py-16 lg:py-20 border-t border-beige">
        <div className="container-lanan text-center">
          <FadeUp>
            <h2 className="font-heading text-3xl lg:text-4xl text-obsidian font-light mb-4">
              See the ingredients in action.
            </h2>
            <p className="text-taupe font-body mb-8 max-w-md mx-auto">
              Every formula tells you exactly what&apos;s inside and why. No hidden fillers, no mystery blends.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/shop" className="btn-gold inline-flex items-center gap-2">
                Shop All Products
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-obsidian text-obsidian text-sm font-body font-medium hover:bg-obsidian hover:text-ivory transition-all duration-300"
              >
                Our Story
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
