import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/checkout', '/confirmacion', '/api/'],
      },
    ],
    sitemap: 'https://puntonorte.shop/sitemap.xml',
    host: 'https://puntonorte.shop',
  }
}
