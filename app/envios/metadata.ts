import type { Metadata } from 'next'

const BASE = 'https://puntonorteshop.com'

export const metadata: Metadata = {
  title: 'Envíos a Toda Venezuela — Punto Norte',
  description: 'Enviamos a toda Venezuela desde Barcelona, Anzoátegui. Conoce tiempos de entrega, costos y zonas de cobertura. Envío express disponible. Pago por Zelle y Pago Móvil.',
  keywords: [
    'envios venezuela', 'envio ropa venezuela', 'delivery ropa venezuela',
    'envio barcelona anzoategui', 'envio express venezuela', 'como llega mi pedido venezuela',
    'mrw zoom venezuela ropa', 'envio tienda online venezuela',
  ],
  alternates: { canonical: `${BASE}/envios` },
  openGraph: {
    title: 'Envíos a Toda Venezuela — Punto Norte',
    description: 'Enviamos a todo el país. Conoce tiempos, costos y zonas de cobertura.',
    url: `${BASE}/envios`,
  },
}
