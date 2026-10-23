import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lanan.in' },
      { protocol: 'https', hostname: 'www.lvbrilanan.in' },
      { protocol: 'https', hostname: 'lvbrilanan.in' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lvbrilanan.com' }],
        destination: 'https://www.lvbrilanan.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lvbrilanan.com' }],
        destination: 'https://www.lvbrilanan.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lvbrilanan.in' }],
        destination: 'https://www.lvbrilanan.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lanan.in' }],
        destination: 'https://www.lvbrilanan.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lanan.in' }],
        destination: 'https://www.lvbrilanan.in/:path*',
        permanent: true,
      },
      {
        source: '/legal',
        destination: '/legal/terms-and-conditions',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

