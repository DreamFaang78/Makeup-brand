'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Lazy Skincare Ritual Video Component
// Defer video network payload until scrolled into view with accessible controls
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

export default function LazyRitualVideo() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load video stream only when within 300px of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-card overflow-hidden shadow-luxury border-4 border-white bg-obsidian group"
    >
      {inView ? (
        <video
          src="/skincare-ritual-video.mp4"
          poster="/skincare-concern-ingredient-section.jpeg"
          autoPlay
          loop
          muted
          playsInline
          controls
          preload="metadata"
          aria-label="LANAN daily skincare ritual formulation and application demonstration"
          title="LANAN Daily Skincare Ritual"
          className="w-full h-full object-cover"
        >
          <track
            kind="captions"
            srcLang="en"
            label="English"
            src="data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00:01.000%20--%3E%2000:00:10.000%0ALANAN%20Daily%20Skincare%20Ritual%20demonstration"
            default
          />
          Your browser does not support HTML5 video.
        </video>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setInView(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setInView(true);
            }
          }}
          className="relative w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
          aria-label="Play LANAN daily skincare ritual demonstration video"
        >
          <Image
            src="/skincare-concern-ingredient-section.jpeg"
            alt="LANAN Daily Skincare Ritual Preview"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            loading="lazy"
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-obsidian/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gold/90 text-obsidian flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
              <Play size={24} className="ml-1 fill-obsidian" />
            </div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
