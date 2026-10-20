'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Client Overlays Component
// Code-split interactive drawers, modals, and consent widgets so they are not
// bundled into the initial SSR or critical rendering path.
// ─────────────────────────────────────────────────────────────────────────────

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/layout/CartDrawer'), { ssr: false });
const AIPopup = dynamic(() => import('@/components/layout/AIPopup'), { ssr: false });
const AIChatbot = dynamic(() => import('@/components/layout/AIChatbot'), { ssr: false });
const AuthModal = dynamic(() => import('@/components/layout/AuthModal'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/layout/CookieConsent'), { ssr: false });
const WhatsAppButton = dynamic(() => import('@/components/layout/WhatsAppButton'), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <AIPopup />
      <AIChatbot />
      <WhatsAppButton />
      <AuthModal />
      <CookieConsent />
    </>
  );
}
