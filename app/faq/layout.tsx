import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Resolvemos tus dudas sobre pedidos, pagos, envíos y productos de Punto Norte.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
