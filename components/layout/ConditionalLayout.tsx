'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { PageTransition } from '@/components/ui/PageTransition'
import { useCartStore } from '@/store/cart'

// Rutas donde el carrito debe cerrarse automáticamente si está abierto
const CLOSE_CART_ON = ['/checkout', '/confirmacion', '/admin']

export function ConditionalLayout({ children, navbar }: { children: React.ReactNode; navbar?: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isCatalogo = pathname.startsWith('/catalogo')
  const closeCart = useCartStore(s => s.closeCart)

  // Cerrar el carrito cada vez que el usuario navega a una ruta incompatible
  useEffect(() => {
    const shouldClose = CLOSE_CART_ON.some(route => pathname.startsWith(route))
    if (shouldClose) closeCart()
  }, [pathname, closeCart])

  if (isAdmin || isCatalogo) {
    return <>{children}</>
  }

  return (
    <>
      {navbar ?? <Navbar />}
      <main className="flex-1">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  )
}
