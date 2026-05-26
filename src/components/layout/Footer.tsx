'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Footer
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';
import { BRAND } from '@/lib/utils';

// ── Inline SVG Social Icons (lucide-react v0.469+ removed brand icons) ──────
function SvgInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function SvgFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function SvgYoutube() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

// ── Footer link config ───────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Serums', href: '/shop?category=serums' },
    { label: 'Moisturisers', href: '/shop?category=moisturisers' },
    { label: 'Cleansers', href: '/shop?category=cleansers' },
    { label: 'Sunscreen', href: '/shop?category=sunscreen' },
    { label: 'Bestsellers', href: '/shop?filter=bestseller' },
  ],
  Company: [
    { label: 'About LANAN', href: '/about' },
    { label: 'Our Rituals', href: '/rituals' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Admin', href: '/admin/dashboard' },
  ],
  Support: [
    { label: 'Shipping Policy', href: '/legal/shipping-policy' },
    { label: 'Return & Refund', href: '/legal/return-refund-policy' },
    { label: 'Privacy Policy', href: '/legal/privacy-policy' },
    { label: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
    { label: 'Cancellation Policy', href: '/legal/cancellation-policy' },
  ],
};

const SOCIAL = [
  { href: BRAND.socialLinks.instagram, label: 'Instagram', Icon: SvgInstagram },
  { href: BRAND.socialLinks.facebook, label: 'Facebook', Icon: SvgFacebook },
  { href: BRAND.socialLinks.youtube, label: 'YouTube', Icon: SvgYoutube },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="h-px bg-gradient-gold" />

      <div className="container-lanan py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-8">
                <Image
                  src="/lanan logo.png"
                  alt="LANAN Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="font-heading text-2xl tracking-[0.15em] text-gold">LANAN</span>
            </div>

            <p className="text-ivory/60 font-body text-sm leading-relaxed mb-6 max-w-xs">
              Premium skincare rituals crafted for modern Indian skin. Gentle formulas,
              transparent ingredients, and luxury you can feel every day.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mb-8">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-ivory/20 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-ivory/60">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gold/60" />
                <p className="text-xs font-body leading-relaxed">
                  {BRAND.addressLines.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-ivory/60">
                <Phone size={14} className="flex-shrink-0 text-gold/60" />
                <a href={`tel:+91${BRAND.phone}`} className="text-xs font-body hover:text-gold transition-colors">
                  +91 {BRAND.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-ivory/60">
                <Mail size={14} className="flex-shrink-0 text-gold/60" />
                <a href={`mailto:${BRAND.email}`} className="text-xs font-body hover:text-gold transition-colors">
                  {BRAND.email}
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-body font-semibold text-sm text-gold tracking-wider uppercase mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs font-body text-ivory/50 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="mt-14 p-6 lg:p-8 rounded-card bg-white/5 border border-ivory/10">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-xl text-gold mb-1">Join the LANAN Circle</h3>
              <p className="text-xs font-body text-ivory/50">
                Get exclusive offers, skincare tips, and early access to new launches.
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto lg:ml-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 lg:w-64 px-4 py-2.5 rounded-pill bg-white/10 border border-ivory/20 text-xs font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold transition-colors"
              />
              <button className="btn-gold text-xs px-5 py-2.5 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-ivory/30 text-center sm:text-left">
            © {new Date().getFullYear()} LANAN by {BRAND.fullName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-ivory/30 mr-1">Accepted Payments:</span>
            {['UPI', 'RuPay', 'Visa', 'MC', 'EMI'].map((p) => (
              <div
                key={p}
                className="px-2 py-1 rounded bg-white/10 border border-ivory/15 text-[9px] font-mono font-medium text-ivory/50"
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] font-body text-ivory/25">
            {BRAND.fullName} | Skincare products may vary in results. Not intended to diagnose, treat, or cure any skin condition.
          </p>
        </div>
      </div>
    </footer>
  );
}
