import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  title: 'Cómo Comprar — Guía Paso a Paso | Punto Norte',
  description: 'Aprende a comprar en Punto Norte en 6 simples pasos. Elige tu producto, paga por Zelle o Pago Móvil y recibe en casa. Envíos a toda Venezuela desde Barcelona, Anzoátegui.',
  keywords: [
    'como comprar online venezuela', 'comprar ropa pago movil', 'comprar ropa zelle venezuela',
    'guia compra online venezuela', 'pasos comprar tienda online venezuela',
    'pagar zelle tienda ropa venezuela', 'comprar ropa whatsapp venezuela',
  ],
  alternates: { canonical: `${BASE}/como-comprar` },
  openGraph: {
    title: 'Cómo Comprar en Punto Norte — Guía Fácil',
    description: 'Compra en 6 simples pasos. Paga por Zelle, Pago Móvil o Efectivo. Envíos a toda Venezuela.',
    url: `${BASE}/como-comprar`,
  },
}
