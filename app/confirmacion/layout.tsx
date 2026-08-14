import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Pedido Confirmado',
  description: 'Tu pedido ha sido recibido exitosamente.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
