import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Finalizar Compra',
  description: 'Completa tu pedido en Punto Norte de forma segura.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
