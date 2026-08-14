import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora ropa, accesorios, perfumes y cargadores para dama y caballero. Envíos a toda Venezuela.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
