import { prisma } from '@/lib/db'
import { Navbar, type NavLink } from './Navbar'
import { parseSubcategories } from '@/lib/subcategories'

// Server Component — carga categorías desde DB sin fetch HTTP
// Elimina el delay del navbar porque los datos llegan en el primer render
export async function NavbarServer() {
  let initialLinks: NavLink[] = [
    { href: '/tienda', label: 'Tienda' }
  ]

  try {
    const cats = await prisma.category.findMany({
      where: { active: true, showInNav: true },
      orderBy: { order: 'asc' },
      select: { slug: true, name: true, subcategories: true },
      take: 6,
    })

    if (cats.length > 0) {
      initialLinks = [
        { href: '/tienda', label: 'Tienda' },
        ...cats.map(c => {
          const subs = parseSubcategories(c.subcategories)
          return {
            href: `/tienda?cat=${c.slug}`,
            label: c.name,
            subs: subs.map(s => ({ href: `/tienda?cat=${c.slug}&sub=${s.slug}`, label: s.name })),
          }
        })
      ]
    }
  } catch {
    // Si falla la DB, el navbar muestra solo "Tienda" — no rompe la página
  }

  return <Navbar initialLinks={initialLinks} />
}
