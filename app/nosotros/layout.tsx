import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce la historia de Punto Norte. Tienda de moda y accesorios en Barcelona, Anzoátegui. Envíos a toda Venezuela.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
