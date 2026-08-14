import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Cómo Comprar',
  description: 'Aprende a comprar en Punto Norte en 6 pasos. Zelle, Pago Móvil y Efectivo. Envíos a toda Venezuela.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
