import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Envíos a toda Venezuela desde Barcelona, Anzoátegui. Tiempos de entrega por zona y proceso de envío.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
