import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  title: 'Nosotros — Quiénes Somos | Punto Norte',
  description: 'Conoce Punto Norte, tu tienda de moda y accesorios en Barcelona, Anzoátegui. Más de 500 clientes satisfechos. Ropa de calidad premium con envíos a toda Venezuela.',
  keywords: [
    'punto norte barcelona venezuela', 'tienda moda anzoategui', 'quienes somos punto norte',
    'ropa barcelona anzoategui', 'tienda online barcelona venezuela',
  ],
  alternates: { canonical: `${BASE}/nosotros` },
  openGraph: {
    title: 'Nosotros — Punto Norte | Barcelona, Venezuela',
    description: 'Tu tienda de moda y accesorios en Barcelona, Anzoátegui. Envíos a toda Venezuela.',
    url: `${BASE}/nosotros`,
  },
}
