'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Luxury Homepage Hero Video Component
// Seamless, silent, ambient video playback with accessible poster & motion fallback
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroVideoProps {
  primarySrc?: string;
  fallbackSrc?: string;
  posterSrc?: string;
  className?: string;
}

export default function HeroVideo({
  primarySrc = '/skincare-ritual.mp4',
  fallbackSrc = '/product-hero.mp4',
  posterSrc = '/luxury-skincare-crafted-for-your-everyday-ritual.jpeg',
  className = '',
}: HeroVideoProps) {
  const [videoSrc, setVideoSrc] = useState<string>(primarySrc);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Handle video source fallback on error
  const handleVideoError = () => {
    if (videoSrc === primarySrc && fallbackSrc && fallbackSrc !== primarySrc) {
      setVideoSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`relative w-full max-w-[480px] lg:max-w-none mx-auto aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-obsidian group isolate ${className}`}
    >
      {/* Ambient Hero Video */}
      {!hasError && !prefersReducedMotion ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={handleVideoError}
          aria-label="LANAN Luxury Skincare Everyday Indian Skin Ritual video"
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 pointer-events-none"
        >
          Your browser does not support HTML5 video.
        </video>
      ) : (
        /* Static Poster Fallback (High-res artwork) */
        <Image
          src={posterSrc}
          alt="LANAN Everyday Luxury Skincare Ritual"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 45vw"
          className="object-cover group-hover:scale-102 transition-transform duration-700"
        />
      )}

      {/* Warm Ambient Gradient Overlay at base for enhanced contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-obsidian/10 to-transparent pointer-events-none z-[1]" />

      {/* Floating Product Badge with 16% Discount */}
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10"
      >
        <Link
          href="/products/lanan-glutathione-face-serum-30-ml"
          className="group/badge flex items-center gap-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-card p-2.5 sm:p-3 shadow-luxury border border-gold/30 hover:border-gold/60 transition-all duration-300"
          aria-label="View LANAN Glutathione Face Serum with 16% discount"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-ivory flex-shrink-0 border border-beige/40">
            <Image
              src="/lanan-glutathione-face-serum.jpeg"
              alt="LANAN Glutathione Face Serum"
              width={36}
              height={36}
              className="w-full h-full object-contain p-0.5 group-hover/badge:scale-105 transition-transform"
            />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-body font-semibold text-obsidian leading-tight group-hover/badge:text-gold-dark transition-colors">
              Glutathione Serum
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-obsidian">₹755</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-taupe/60 line-through">₹899</span>
              <span className="text-[8px] sm:text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full bg-[#5B1924] text-[#F7F0E7] shadow-xs">
                SAVE 16%
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Bottom Promotional Overlay: The Radiant Ritual */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-4 z-10">
        <div className="bg-obsidian/85 hover:bg-obsidian/95 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-gold/30 flex items-center justify-between text-ivory transition-colors">
          <div className="min-w-0 pr-2">
            <p className="text-[9px] sm:text-[10px] font-body uppercase tracking-widest text-gold font-medium truncate">
              The Radiant Ritual
            </p>
            <p className="text-[11px] sm:text-xs font-heading font-light tracking-wide text-ivory truncate">
              Glutathione, Niacinamide & SPF 50
            </p>
          </div>
          <Link
            href="/shop"
            className="text-[11px] sm:text-xs font-body text-gold hover:text-gold-light flex items-center gap-1 font-medium transition-colors flex-shrink-0 group/link"
            aria-label="Discover The Radiant Ritual formulations"
          >
            <span>Discover</span>
            <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

