import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  title: 'Tienda — Ropa, Accesorios y Perfumes en Venezuela',
  description: 'Compra ropa de dama y caballero, accesorios, perfumes y cargadores online en Venezuela. Calidad premium con envíos a todo el país. Pago por Zelle y Pago Móvil.',
  keywords: [
    'tienda ropa venezuela', 'comprar ropa online venezuela', 'ropa dama venezuela',
    'ropa caballero venezuela', 'accesorios moda venezuela', 'perfumes online venezuela',
    'moda barcelona anzoategui', 'ropa online envio venezuela', 'catalogo ropa venezuela',
  ],
  alternates: { canonical: `${BASE}/tienda` },
  openGraph: {
    title: 'Tienda — Punto Norte | Ropa y Accesorios Venezuela',
    description: 'Ropa dama y caballero, accesorios, perfumes. Envíos a toda Venezuela.',
    url: `${BASE}/tienda`,
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
  },
}
