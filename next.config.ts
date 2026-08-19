import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imágenes del hero y banners
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // Imágenes de productos legacy (lib/products.ts)
      { protocol: 'https', hostname: 'imgproxy.treinta.co', pathname: '/**' },
      // Amazon S3 (origen de las imágenes de Treinta)
      { protocol: 'https', hostname: '*.amazonaws.com', pathname: '/**' },
      // Por si el admin sube imágenes desde otros CDNs comunes
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
    ],
  },
}

export default nextConfig
