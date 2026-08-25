import { prisma } from '@/lib/db'
import { Navbar } from './Navbar'

// Server Component — carga categorías desde DB sin fetch HTTP
// Elimina el delay del navbar porque los datos llegan en el primer render
export async function NavbarServer() {
  let initialLinks: { href: string; label: string }[] = [
    { href: '/tienda', label: 'Tienda' }
  ]

  try {
    const cats = await prisma.category.findMany({
      where: { active: true, showInNav: true },
      orderBy: { order: 'asc' },
      select: { slug: true, name: true },
      take: 6,
    })

    if (cats.length > 0) {
      initialLinks = [
        { href: '/tienda', label: 'Tienda' },
        ...cats.map(c => ({ href: `/tienda?cat=${c.slug}`, label: c.name }))
      ]
    }
  } catch {
    // Si falla la DB, el navbar muestra solo "Tienda" — no rompe la página
  }

  return <Navbar initialLinks={initialLinks} />
}
