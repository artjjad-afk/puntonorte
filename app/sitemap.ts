import { MetadataRoute } from 'next'

const BASE = 'https://puntonorteshop.com'

// Sitemap dinámico: incluye productos reales de la base de datos
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/tienda`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${BASE}/nosotros`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/como-comprar`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/envios`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/faq`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
  ]

  // Páginas de categoría — Google las indexa individualmente
  const categoryPages: MetadataRoute.Sitemap = [
    'dama', 'caballero', 'accesorios', 'perfumes', 'cargadores',
  ].map(cat => ({
    url: `${BASE}/tienda?cat=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Productos dinámicos desde la base de datos
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${BASE}/api/products?all=true`, {
      next: { revalidate: 3600 }, // revalida cada hora
    })
    if (res.ok) {
      const products = await res.json()
      if (Array.isArray(products)) {
        productPages = products
          .filter((p: { active?: boolean; slug?: string }) => p.active !== false && p.slug)
          .map((p: { slug: string; updatedAt?: string }) => ({
            url: `${BASE}/tienda/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          }))
      }
    }
  } catch {
    // Si falla la API, el sitemap sigue funcionando con las páginas estáticas
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
