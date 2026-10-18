'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Meta Ads Pixel Client Component
// Loads Pixel using next/script (afterInteractive) and tracks route changes
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, Suspense } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { META_PIXEL_ID, trackPageView, hasMarketingConsent } from '@/lib/metaPixel';

/**
 * Route-change PageView listener wrapped in Suspense for App Router
 */
function MetaPixelPageViewListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string>('');

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    if (!hasMarketingConsent()) return;

    const queryString = searchParams?.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    // Guard against duplicate triggers for identical URL
    if (url === lastUrlRef.current) return;
    lastUrlRef.current = url;

    trackPageView(url);
  }, [pathname, searchParams]);

  // Synchronize when user grants consent dynamically via modal
  useEffect(() => {
    const handleConsent = (e: Event) => {
      const customEvent = e as CustomEvent<{ status: string }>;
      if (customEvent.detail?.status === 'granted') {
        const queryString = searchParams?.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;
        lastUrlRef.current = url;
        trackPageView(url);
      }
    };

    window.addEventListener('lanan_consent_changed', handleConsent);
    return () => window.removeEventListener('lanan_consent_changed', handleConsent);
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      {/* ── Meta Pixel Base Script ── */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            try {
              var consent = localStorage.getItem('lanan_cookie_consent');
              if (consent === 'granted') {
                fbq('consent', 'grant');
              } else {
                fbq('consent', 'revoke');
              }
            } catch (e) {
              fbq('consent', 'revoke');
            }

            fbq('init', '${META_PIXEL_ID}');
          `,
        }}
      />

      {/* ── Noscript Fallback ── */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* ── Route Change / Initial PageView Tracker ── */}
      <Suspense fallback={null}>
        <MetaPixelPageViewListener />
      </Suspense>
    </>
  );
}
