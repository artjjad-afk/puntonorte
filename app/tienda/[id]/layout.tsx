import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params

  try {
    // Buscar por slug en la API real — no en datos estáticos
    const res = await fetch(`${BASE}/api/products/${id}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return {
        title: 'Producto no encontrado | Punto Norte',
        description: 'Este producto no está disponible. Visita nuestra tienda para ver más opciones.',
      }
    }

    const product = await res.json()

    return {
      title: `${product.name} | Punto Norte`,
      description: `${product.description?.slice(0, 140)}... Disponible en Punto Norte. Envíos a toda Venezuela.`,
      keywords: [
        product.name,
        product.category,
        'moda Venezuela',
        'Punto Norte',
        'comprar online Venezuela',
      ],
      alternates: {
        canonical: `${BASE}/tienda/${product.slug}`,
      },
      openGraph: {
        title: `${product.name} — Punto Norte`,
        description: `${product.description?.slice(0, 120)}...`,
        images: product.images?.[0]
          ? [{ url: product.images[0], width: 600, height: 800, alt: product.name }]
          : [],
        url: `${BASE}/tienda/${product.slug}`,
        siteName: 'Punto Norte',
        locale: 'es_VE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} — Punto Norte`,
        description: product.description?.slice(0, 120),
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    }
  } catch {
    return {
      title: 'Punto Norte — Tienda Online Venezuela',
      description: 'Ropa, accesorios y perfumes de calidad premium con envíos a toda Venezuela.',
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
