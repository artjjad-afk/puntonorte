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
    sitemap: 'https://puntonorteshop.com/sitemap.xml',
    host: 'https://puntonorteshop.com',
  }
}
