import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/analytics/MetaPixel';
import ClientOverlays from '@/components/layout/ClientOverlays';

// Self-host Google font subsets at build time — zero external HTTP roundtrips or render-blocking stylesheets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-jb',
  weight: ['400', '500'],
});

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
    <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable}`}>
      <head>
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
                telephone: '+91-9235170198',
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
                'https://www.facebook.com/people/Lanan-Skin-Care/61593584686254/',
                'https://www.facebook.com/share/193HQx1gQa/',
              ],
            }),
          }}
        />
      </head>
      <body className="font-body bg-ivory text-obsidian antialiased">
        <MetaPixel />
        <Providers>
          <Navbar />
          <main className="pt-[116px] lg:pt-[128px] min-h-screen">
            {children}
          </main>
          <Footer />
          <ClientOverlays />
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
