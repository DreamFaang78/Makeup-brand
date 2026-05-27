import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AIPopup from '@/components/layout/AIPopup';
import AIChatbot from '@/components/layout/AIChatbot';
import AuthModal from '@/components/layout/AuthModal';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://lanan.in'),
  title: {
    default: 'LANAN — Luxury Skincare for Modern Indian Skin',
    template: '%s | LANAN',
  },
  description:
    'Discover LANAN — premium skincare rituals crafted for Indian skin. Shop serums, moisturisers, cleansers, and more. Free shipping above ₹599.',
  keywords: ['skincare', 'Indian skincare', 'luxury skincare', 'LANAN', 'serum', 'moisturiser', 'glow serum'],
  authors: [{ name: 'LANAN', url: 'https://lanan.in' }],
  creator: 'LANAN',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://lanan.in',
    siteName: 'LANAN',
    title: 'LANAN — Luxury Skincare for Modern Indian Skin',
    description: 'Premium skincare rituals crafted for Indian skin.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'LANAN Skincare' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LANAN — Luxury Skincare',
    description: 'Premium skincare rituals crafted for Indian skin.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LANAN',
              legalName: 'Ma Tara Neelsarashwati',
              url: 'https://lanan.in',
              logo: 'https://lanan.in/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-7630888521',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Plot No 36A, Arazi No 1800BA, Sundar Nagar, Panki',
                addressLocality: 'Kanpur',
                addressRegion: 'Uttar Pradesh',
                postalCode: '208020',
                addressCountry: 'IN',
              },
              sameAs: [
                'https://instagram.com/lanan.in',
                'https://facebook.com/lanan.in',
              ],
            }),
          }}
        />
      </head>
      <body className="font-body bg-ivory text-obsidian antialiased">
        <Providers>
          <Navbar />
          <main className="pt-[calc(64px+36px)] lg:pt-[calc(80px+36px)] min-h-screen">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <AIPopup />
          <AIChatbot />
          <AuthModal />
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '12px',
              background: '#0A0A0A',
              color: '#F7F1EA',
              border: '1px solid rgba(201,169,110,0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}
