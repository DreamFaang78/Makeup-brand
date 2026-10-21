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
  primarySrc = '/videos/lanan-hero-video.mp4',
  fallbackSrc = '/product-hero.mp4',
  posterSrc = '/luxury-skincare-crafted-for-your-everyday-ritual.jpeg',
  className = '',
}: HeroVideoProps) {
  const [videoSrc, setVideoSrc] = useState<string>(primarySrc);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
      // Gracefully attempt fallback video asset if primary is missing or fails
      setVideoSrc(fallbackSrc);
    } else {
      // If both fail, cleanly fall back to high-res static poster
      setHasError(true);
    }
  };

  const handlePlaying = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative aspect-[4/5] rounded-card overflow-hidden shadow-luxury border-4 border-white bg-obsidian group ${className}`}
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
          onPlaying={handlePlaying}
          aria-label="LANAN Luxury Skincare Everyday Indian Skin Ritual video"
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
        >
          <track
            kind="captions"
            srcLang="en"
            label="English"
            src="data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00:01.000%20--%3E%2000:00:10.000%0ALANAN%20Everyday%20Luxury%20Skincare%20Ritual"
            default
          />
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

      {/* Warm Ambient Gradient Overlay at base */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/45 via-transparent to-transparent pointer-events-none" />

      {/* Floating Product Badge with 16% Discount */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 -right-2 sm:right-4 bg-white/95 backdrop-blur-md rounded-card p-3 shadow-luxury border border-gold/25 z-10"
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
              <span className="text-[11px] font-mono font-bold text-obsidian">₹755</span>
              <span className="text-[10px] font-mono text-taupe/60 line-through">₹899</span>
              <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full bg-[#5B1924] text-[#F7F0E7]">
                SAVE 16%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Caption Pill */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-obsidian/85 backdrop-blur-md rounded-xl p-3 border border-gold/25 flex items-center justify-between text-ivory">
          <div>
            <p className="text-[10px] font-body uppercase tracking-widest text-gold font-medium">The Radiant Ritual</p>
            <p className="text-xs font-heading font-light tracking-wide text-ivory">Glutathione, Niacinamide & SPF 50</p>
          </div>
          <Link
            href="/shop"
            className="text-[11px] font-body text-gold hover:underline flex items-center gap-1 font-medium transition-colors"
          >
            Discover <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
