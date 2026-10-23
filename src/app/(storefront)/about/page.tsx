// ─────────────────────────────────────────────────────────────────────────────
// LANAN — About Page
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Heart, Shield, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About LANAN — Premium Indian Skincare',
  description: 'LANAN is a premium skincare brand by Ma Tara Neelsarashwati, crafted for modern Indian skin. Discover our story, values, and commitment to clean beauty.',
  alternates: {
    canonical: `${BRAND.website}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-pattern-luxury" />
        <div className="container-lanan relative z-10 text-center">
          <p className="section-label mb-3">Our Story</p>
          <h1 className="font-heading font-light text-obsidian mb-4">
            About <span className="text-gradient-gold">LANAN</span>
          </h1>
          <p className="font-body text-taupe max-w-xl mx-auto text-base leading-relaxed">
            Luxury skincare, crafted for the modern Indian woman. Born from a deep belief
            that self-care is not a luxury — it's a ritual.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-section bg-white overflow-hidden">
        <div className="container-lanan">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-3">The Beginning</p>
              <h2 className="section-title mb-5">
                Skincare That Truly{' '}
                <em className="italic text-gold">Understands You</em>
              </h2>
              <div className="space-y-4 font-body text-charcoal text-sm leading-relaxed">
                <p>
                  LANAN was born from a simple observation: most skincare brands either target
                  Western skin tones or offer budget products that compromise on quality. Indian
                  skin — with its beautiful diversity of tones, textures, and challenges — deserved better.
                </p>
                <p>
                  We set out to create a brand that felt luxurious without being out of reach.
                  Formulas that actually work on Indian skin. Ingredients chosen for their efficacy,
                  not just their marketing appeal.
                </p>
                <p>
                  Every LANAN product is designed to become a ritual — a daily act of self-care
                  that makes you feel calm, confident, and radiant.
                </p>
              </div>
            </div>
            <div className="relative max-w-lg mx-auto lg:max-w-none w-full">
              <div className="aspect-square rounded-card overflow-hidden bg-[#FAF6F0] border border-gold/20 shadow-sm relative">
                <Image
                  src="/images/lanan-complete-skincare-kit.png"
                  alt="LANAN Complete Skincare Kit featuring Face Wash, Face Toner, Glutathione Face Serum, and Face Moisturizer"
                  width={1254}
                  height={1254}
                  className="w-full h-full object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
              </div>
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-20 sm:w-24 h-20 sm:h-24 border-t-2 border-r-2 border-gold/50 rounded-tr-card pointer-events-none" />
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-20 sm:w-24 h-20 sm:h-24 border-b-2 border-l-2 border-gold/50 rounded-bl-card pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-section bg-ivory">
        <div className="container-lanan">
          <div className="text-center mb-10">
            <p className="section-label mb-2">What We Stand For</p>
            <h2 className="section-title">Our Core <em className="italic text-gold">Values</em></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Leaf size={20} />, title: 'Clean Formulas', desc: 'No parabens, no sulfates, no artificial fragrances. Just effective, safe ingredients.' },
              { icon: <Shield size={20} />, title: 'Ingredient Transparency', desc: 'We list every ingredient and explain why it\'s in your product.' },
              { icon: <Heart size={20} />, title: 'Made for Indian Skin', desc: 'Formulated specifically for Indian climate, skin tones, and concerns.' },
              { icon: <Sparkles size={20} />, title: 'Luxury Made Accessible', desc: 'Premium quality at prices that respect your budget.' },
            ].map((value) => (
              <div key={value.title} className="card-luxury p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-body font-semibold text-sm text-obsidian mb-2">{value.title}</h3>
                <p className="font-body text-xs text-taupe leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Entity */}
      <section className="py-12 bg-white border-t border-beige">
        <div className="container-lanan">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label mb-3">Legal Entity</p>
            <h2 className="font-heading text-xl text-obsidian mb-4">{BRAND.fullName}</h2>
            <p className="font-body text-sm text-taupe leading-relaxed mb-3">
              LANAN is the brand name operated by {BRAND.fullName}, a registered proprietary firm.
            </p>
            <p className="font-body text-xs text-taupe">
              {BRAND.address}<br />
              Phone: {BRAND.phoneFormatted} | Email: {BRAND.email} | {BRAND.supportEmail}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-obsidian text-center">
        <div className="container-lanan">
          <h2 className="font-heading text-2xl text-gold mb-3">Ready to Begin Your Ritual?</h2>
          <p className="font-body text-ivory/60 text-sm mb-6">Explore our complete skincare collection.</p>
          <Link href="/shop" className="btn-gold">
            Shop LANAN <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
