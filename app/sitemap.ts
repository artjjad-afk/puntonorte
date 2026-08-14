import { MetadataRoute } from 'next'
import { products } from '@/lib/products'

const BASE = 'https://puntonorte.shop'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE}/tienda`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE}/nosotros`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE}/como-comprar`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE}/envios`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  const categoryPages = ['dama', 'caballero', 'accesorios', 'perfumes', 'cargadores'].map(cat => ({
    url: `${BASE}/tienda?cat=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productPages = products.map(p => ({
    url: `${BASE}/tienda/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
