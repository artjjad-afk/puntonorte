import type { Metadata } from 'next'
import { getBySlug } from '@/lib/products'

const BASE = 'https://puntonorte.shop'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const product = getBySlug(id)

  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  return {
    title: product.name,
    description: `${product.description} Disponible en Punto Norte. Envíos a toda Venezuela.`,
    keywords: `${product.name}, ${product.category}, moda Venezuela, Punto Norte`,
    openGraph: {
      title: `${product.name} — Punto Norte`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          width: 600,
          height: 800,
          alt: product.name,
        },
      ],
      url: `${BASE}/tienda/${product.slug}`,
      siteName: 'Punto Norte',
      locale: 'es_VE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — Punto Norte`,
      description: product.description,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `${BASE}/tienda/${product.slug}`,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
