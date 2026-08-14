'use client'

/* ============================================================================
   NAV DOCK · Punto Norte Admin Console
   ----------------------------------------------------------------------------
   Muelle de navegación flotante (reemplaza el sidebar vertical).
   - Vidrio profundo L3, borde de 1px reactivo al cursor.
   - Colapsable: iconos en reposo, etiquetas al hover (micro-interacción).
   - El acento cobre se activa SOLO en la ruta actual.
   Estilos en app/admin/_theme/console.css (clases .dock*).
   ========================================================================== */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Compass, ExternalLink, LogOut,
} from 'lucide-react'

const LINKS = [
  { href: '/admin',            label: 'Panel',      code: 'DSH', icon: LayoutDashboard, exact: true },
  { href: '/admin/productos',  label: 'Productos',  code: 'PRD', icon: Package },
  { href: '/admin/pedidos',    label: 'Pedidos',    code: 'ORD', icon: ShoppingBag },
  { href: '/admin/categorias', label: 'Categorías', code: 'CAT', icon: Tag },
]

export function NavDock() {
  const pathname = usePathname()
  const router = useRouter()
  const dockRef = useRef<HTMLElement>(null)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  // Borde reactivo: proyecta la posición del cursor a variables CSS (--mx/--my)
  // que alimentan el gradiente radial del anillo de 1px.
  const trackEdge = (e: React.MouseEvent<HTMLElement>) => {
    const el = dockRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const resetEdge = () => {
    const el = dockRef.current
    if (!el) return
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '0%')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav
      ref={dockRef}
      className="dock edge-react"
      onMouseMove={trackEdge}
      onMouseLeave={resetEdge}
      aria-label="Navegación de consola"
    >
      {/* Marca / testigo del sistema */}
      <div className="dock-brand">
        <span className="brand-mark"><Compass size={16} strokeWidth={1.75} /></span>
        <span className="brand-meta">
          <span className="brand-name">PUNTO&nbsp;NORTE</span>
          <span className="brand-tag">
            <span className="brand-pulse" style={{ display: 'inline-block', marginRight: 5 }} />
            Consola
          </span>
        </span>
      </div>

      <div className="dock-sep" />

      {/* Rutas principales */}
      <div className="dock-group">
        {LINKS.map(({ href, label, code, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`dock-item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="dock-glyph"><Icon size={18} strokeWidth={1.75} /></span>
              <span className="dock-label">{label}</span>
              <span className="dock-tip">{code}</span>
            </Link>
          )
        })}
      </div>

      <div className="dock-sep" />

      {/* Acciones de sistema */}
      <div className="dock-group">
        <Link href="/" target="_blank" className="dock-item">
          <span className="dock-glyph"><ExternalLink size={17} strokeWidth={1.75} /></span>
          <span className="dock-label">Ver tienda</span>
          <span className="dock-tip">WEB</span>
        </Link>
        <button type="button" onClick={handleLogout} className="dock-item is-danger">
          <span className="dock-glyph"><LogOut size={17} strokeWidth={1.75} /></span>
          <span className="dock-label">Salir</span>
          <span className="dock-tip">EXIT</span>
        </button>
      </div>
    </nav>
  )
}
