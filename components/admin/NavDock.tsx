'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  ExternalLink, LogOut, Compass, ChevronRight,
} from 'lucide-react'

const LINKS = [
  { href: '/admin',            label: 'Panel',      code: 'DSH', icon: LayoutDashboard, exact: true,  color: '#c1692b', rgb: '193,105,43' },
  { href: '/admin/productos',  label: 'Productos',  code: 'PRD', icon: Package,          exact: false, color: '#3b8bff', rgb: '59,139,255' },
  { href: '/admin/pedidos',    label: 'Pedidos',    code: 'ORD', icon: ShoppingBag,      exact: false, color: '#25d366', rgb: '37,211,102' },
  { href: '/admin/categorias', label: 'Categorías', code: 'CAT', icon: Tag,              exact: false, color: '#f59e0b', rgb: '245,158,11' },
]

export function NavDock() {
  const pathname  = usePathname()
  const router    = useRouter()
  const dockRef   = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const trackEdge = (e: React.MouseEvent<HTMLElement>) => {
    const el = dockRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width)  * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top)  / r.height) * 100}%`)
  }
  const resetEdge = () => {
    const el = dockRef.current
    if (!el) return
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '0%')
  }

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* igualmente redirigimos */ }
    router.push('/admin/login')
    router.refresh()
  }

  const activeLink = LINKS.find(l => isActive(l.href, l.exact))

  return (
    <>
      <style>{`
        /* ── Dock container ── */
        .pn-dock {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          border-radius: 22px;
          background: rgba(10,10,12,0.85);
          backdrop-filter: blur(40px) saturate(140%);
          -webkit-backdrop-filter: blur(40px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.4),
            0 20px 60px rgba(0,0,0,0.6),
            0 4px 12px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transition: box-shadow .4s ease;
        }
        .pn-dock::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 22px;
          padding: 1px;
          background: var(--edge-glow);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: .5;
          transition: opacity .3s;
        }
        .pn-dock:hover::before { opacity: 1; }

        /* ── Separador ── */
        .pn-sep {
          width: 1px; height: 28px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
          flex-shrink: 0;
          margin: 0 2px;
        }

        /* ── Item base ── */
        .pn-item {
          position: relative;
          display: flex; align-items: center; gap: 0;
          height: 44px;
          padding: 0 12px;
          border-radius: 16px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-decoration: none;
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .04em;
          color: rgba(232,229,226,0.45);
          white-space: nowrap;
          overflow: hidden;
          transition:
            color        .2s ease,
            background   .2s ease,
            border-color .25s ease,
            transform    .25s cubic-bezier(.34,1.56,.64,1);
        }
        .pn-item:hover {
          color: rgba(232,229,226,0.9);
          background: rgba(255,255,255,0.07);
          transform: translateY(-2px);
        }

        /* Label — aparece al hover del dock */
        .pn-item .pn-label {
          max-width: 0; opacity: 0; margin-left: 0;
          transition:
            max-width .35s cubic-bezier(.16,1,.3,1),
            opacity   .2s ease,
            margin-left .35s cubic-bezier(.16,1,.3,1);
          overflow: hidden;
        }
        .pn-dock:hover .pn-item .pn-label,
        .pn-item.is-active .pn-label {
          max-width: 90px; opacity: 1; margin-left: 7px;
        }

        /* Icono */
        .pn-item .pn-icon {
          display: grid; place-items: center;
          width: 22px; height: 22px; flex-shrink: 0;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .pn-item:hover .pn-icon { transform: scale(1.12); }

        /* ── Estado ACTIVO — el color se gana, no se decora ── */
        .pn-item.is-active {
          border-color: rgba(var(--item-rgb), 0.30);
          background: rgba(var(--item-rgb), 0.10);
          color: var(--item-color);
          transform: translateY(-2px);
        }
        /* Glow bajo el item activo */
        .pn-item.is-active::after {
          content: '';
          position: absolute; bottom: -8px; left: 50%;
          transform: translateX(-50%);
          width: 60%; height: 12px;
          background: radial-gradient(ellipse, rgba(var(--item-rgb),.5) 0%, transparent 70%);
          pointer-events: none;
          border-radius: 50%;
          filter: blur(4px);
        }
        /* Punto testigo arriba */
        .pn-item.is-active .pn-dot {
          position: absolute; top: 6px; right: 8px;
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--item-color);
          box-shadow: 0 0 8px var(--item-color), 0 0 2px var(--item-color);
          animation: pn-blink 2.4s ease-in-out infinite;
        }

        /* ── Botón peligroso (logout) ── */
        .pn-item.is-danger:hover {
          color: #f87171;
          background: rgba(239,68,68,0.10);
          border-color: rgba(239,68,68,0.25);
          box-shadow: 0 0 20px rgba(239,68,68,0.15);
        }

        /* ── Brand / reloj ── */
        .pn-brand {
          display: flex; align-items: center; gap: 8px;
          padding: 0 10px 0 8px;
          height: 44px;
          border-right: none;
          flex-shrink: 0;
        }
        .pn-brand-mark {
          width: 30px; height: 30px; border-radius: 9px;
          background: rgba(193,105,43,0.12);
          border: 1px solid rgba(193,105,43,0.25);
          display: grid; place-items: center;
          color: #c1692b;
          box-shadow: 0 0 16px rgba(193,105,43,0.2);
          flex-shrink: 0;
        }
        .pn-brand-meta {
          display: flex; flex-direction: column; line-height: 1.1; gap: 1px;
        }
        .pn-brand-name {
          font-family: var(--font-display, 'Space Grotesk', sans-serif);
          font-size: 12px; font-weight: 700;
          color: rgba(232,229,226,0.75);
          letter-spacing: .03em;
        }
        .pn-brand-time {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: rgba(232,229,226,0.3);
          letter-spacing: .06em;
        }
        .pn-pulse {
          width: 5px; height: 5px; border-radius: 50%;
          background: #25d366;
          box-shadow: 0 0 8px #25d366;
          animation: pn-blink 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }

        /* ── Tooltip ── */
        .pn-tip {
          position: absolute;
          bottom: calc(100% + 14px); left: 50%;
          transform: translateX(-50%) translateY(6px);
          padding: 5px 10px;
          border-radius: 8px;
          background: rgba(12,12,14,0.96);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(232,229,226,0.8);
          font-size: 10px; letter-spacing: .12em;
          text-transform: uppercase;
          white-space: nowrap;
          pointer-events: none; opacity: 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: opacity .15s ease, transform .15s ease;
          z-index: 60;
        }
        /* Solo mostrar tip cuando el dock NO está en hover (labels colapsadas) */
        .pn-dock:not(:hover) .pn-item:hover .pn-tip { opacity: 1; transform: translateX(-50%) translateY(0); }

        /* ── Animaciones ── */
        @keyframes pn-blink {
          0%,55% { opacity:1; }
          60%,100% { opacity:.25; }
        }
        @keyframes pn-rise {
          from { opacity:0; transform:translateX(-50%) translateY(16px) scale(.94); }
          to   { opacity:1; transform:translateX(-50%) translateY(0)     scale(1); }
        }
        .pn-dock { animation: pn-rise .55s cubic-bezier(.22,1,.36,1) both; }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .pn-dock { left:12px; right:12px; transform:none; bottom:12px; justify-content:space-around; }
          .pn-brand-meta { display:none; }
          .pn-dock:hover .pn-item .pn-label { max-width:0; opacity:0; margin-left:0; }
        }
      `}</style>

      <nav
        ref={dockRef}
        className="pn-dock edge-react"
        onMouseMove={trackEdge}
        onMouseLeave={resetEdge}
        aria-label="Navegación admin"
      >
        {/* Brand */}
        <div className="pn-brand">
          <span className="pn-brand-mark"><Compass size={15} strokeWidth={1.75} /></span>
          <span className="pn-brand-meta">
            <span className="pn-brand-name">PUNTO NORTE</span>
            <span className="pn-brand-time">{time}</span>
          </span>
          <span className="pn-pulse" />
        </div>

        <div className="pn-sep" />

        {/* Nav links */}
        {LINKS.map(({ href, label, code, icon: Icon, exact, color, rgb }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`pn-item${active ? ' is-active' : ''}`}
              style={{ '--item-color': color, '--item-rgb': rgb } as React.CSSProperties}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="pn-icon"><Icon size={18} strokeWidth={1.75} /></span>
              <span className="pn-label">{label}</span>
              {active && <span className="pn-dot" />}
              <span className="pn-tip">{code}</span>
            </Link>
          )
        })}

        <div className="pn-sep" />

        {/* Acciones sistema */}
        <Link href="/" target="_blank" className="pn-item"
          onMouseEnter={() => setHovered('web')}
          onMouseLeave={() => setHovered(null)}>
          <span className="pn-icon"><ExternalLink size={16} strokeWidth={1.75} /></span>
          <span className="pn-label">Tienda</span>
          <span className="pn-tip">WEB</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="pn-item is-danger"
          style={{ background: 'none', border: '1px solid transparent', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          onMouseEnter={() => setHovered('exit')}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="pn-icon"><LogOut size={16} strokeWidth={1.75} /></span>
          <span className="pn-label">Salir</span>
          <span className="pn-tip">EXIT</span>
        </button>
      </nav>
    </>
  )
}
