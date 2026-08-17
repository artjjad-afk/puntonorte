import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — Punto Norte',
  description: 'Resolvemos tus dudas sobre pedidos, pagos, envíos, cambios y devoluciones en Punto Norte. Todo lo que necesitas saber para comprar con confianza en Venezuela.',
  keywords: [
    'preguntas frecuentes tienda venezuela', 'como comprar online venezuela',
    'pago movil tienda ropa', 'zelle compra ropa venezuela', 'cambios ropa venezuela',
    'devolucion ropa online venezuela', 'dudas compra online venezuela',
  ],
  alternates: { canonical: `${BASE}/faq` },
  openGraph: {
    title: 'Preguntas Frecuentes — Punto Norte Venezuela',
    description: 'Todo lo que necesitas saber para comprar con confianza en Punto Norte.',
    url: `${BASE}/faq`,
  },
}
