import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BRAND.website; // https://www.lvbrilanan.in
  const now = new Date();

  // Core static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rituals`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ingredients`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/skin-analysis`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trends`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Canonical product detail routes
  const productSlugs = [
    'lanan-face-wash',
    'lanan-face-moisturizer',
    'lanan-sunscreen-spf-50',
    'lanan-glutathione-face-toner',
    'lanan-glutathione-face-serum',
  ];

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Canonical legal compliance policies
  const legalSlugs = [
    'shipping-policy',
    'return-refund-policy',
    'privacy-policy',
    'terms-and-conditions',
    'cancellation-policy',
  ];

  const legalRoutes: MetadataRoute.Sitemap = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...legalRoutes];
}
