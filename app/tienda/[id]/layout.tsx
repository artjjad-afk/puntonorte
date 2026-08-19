import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

const BASE = 'https://puntonorteshop.com'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params

  try {
    // Consulta directa a la DB — no depende de que el servidor HTTP esté corriendo
    const isNumeric = /^\d+$/.test(id)
    const product = await prisma.product.findFirst({
      where: isNumeric ? { id: parseInt(id) } : { slug: id, active: true },
      select: {
        name: true, slug: true, description: true,
        category: true, images: true,
      },
    })

    if (!product) {
      return {
        title: 'Producto no encontrado | Punto Norte',
        description: 'Este producto no está disponible. Visita nuestra tienda para ver más opciones.',
      }
    }

    const images = JSON.parse(product.images || '[]') as string[]
    const desc = product.description?.slice(0, 140)

    return {
      title: `${product.name} | Punto Norte`,
      description: `${desc}... Disponible en Punto Norte. Envíos a toda Venezuela.`,
      keywords: [product.name, product.category, 'moda Venezuela', 'Punto Norte', 'comprar online Venezuela'],
      alternates: { canonical: `${BASE}/tienda/${product.slug}` },
      openGraph: {
        title: `${product.name} — Punto Norte`,
        description: `${product.description?.slice(0, 120)}...`,
        images: images[0] ? [{ url: images[0], width: 600, height: 800, alt: product.name }] : [],
        url: `${BASE}/tienda/${product.slug}`,
        siteName: 'Punto Norte',
        locale: 'es_VE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} — Punto Norte`,
        description: product.description?.slice(0, 120),
        images: images[0] ? [images[0]] : [],
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
