import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BRAND.website; // https://www.lvbrilanan.in

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/account/', '/checkout/success'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
