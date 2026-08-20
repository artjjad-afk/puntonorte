'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  ExternalLink,
  LogOut,
  ChevronRight,
  Store,
  TrendingUp,
} from 'lucide-react'

const NAV = [
  {
    group: 'Principal',
    items: [
      { href: '/admin',           label: 'Dashboard',  icon: LayoutDashboard, exact: true  },
      { href: '/admin/pedidos',   label: 'Pedidos',    icon: ShoppingBag,     exact: false },
    ],
  },
  {
    group: 'Catálogo',
    items: [
      { href: '/admin/productos',  label: 'Productos',   icon: Package, exact: false },
      { href: '/admin/categorias', label: 'Categorías',  icon: Tag,     exact: false },
    ],
  },
]

export function AdminSidebarNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* igualmente redirigimos */ }
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      <style>{`
        /* ── Sidebar ── */
        .pn-sidebar {
          width: ${collapsed ? '72px' : '240px'};
          min-height: 100vh;
          background: rgba(15,20,33,0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          transition: width .3s cubic-bezier(.16,1,.3,1);
          z-index: 20;
        }

        /* Filo superior de luz */
        .pn-sidebar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent);
          pointer-events: none;
        }

        /* ── Logo area ── */
        .pn-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '20px 0' : '20px 18px'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .pn-sidebar-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f97316, #c1692b);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(249,115,22,0.35);
        }
        .pn-sidebar-logo-text {
          display: ${collapsed ? 'none' : 'flex'};
          flex-direction: column;
          line-height: 1.1;
          overflow: hidden;
        }
        .pn-sidebar-logo-name {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .pn-sidebar-logo-sub {
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(148,163,184,0.6);
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        /* ── Navigation ── */
        .pn-sidebar-nav {
          flex: 1;
          padding: 12px 0;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .pn-sidebar-nav::-webkit-scrollbar { width: 0; }

        .pn-nav-group {
          padding: ${collapsed ? '8px 0' : '8px 0'};
        }
        .pn-nav-group-label {
          display: ${collapsed ? 'none' : 'block'};
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(100,116,139,0.7);
          padding: 0 18px;
          margin-bottom: 4px;
        }

        /* ── Nav item ── */
        .pn-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '10px 0' : '9px 14px'};
          margin: 2px ${collapsed ? '8px' : '8px'};
          border-radius: 10px;
          border: 1px solid transparent;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: rgba(148,163,184,0.85);
          transition: all .2s ease;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }
        .pn-nav-item:hover {
          color: #f1f5f9;
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        .pn-nav-item.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06));
          border-color: rgba(249,115,22,0.30);
          font-weight: 600;
          box-shadow: 0 2px 12px rgba(249,115,22,0.12);
        }
        /* Borde izquierdo activo */
        .pn-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(to bottom, #f97316, #fb923c);
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 8px rgba(249,115,22,0.6);
        }
        /* Iconos */
        .pn-nav-icon {
          display: grid;
          place-items: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        /* Label — oculto en modo colapsado */
        .pn-nav-label {
          display: ${collapsed ? 'none' : 'block'};
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* Chevron — solo en modo expandido y no activo */
        .pn-nav-chevron {
          display: ${collapsed ? 'none' : 'block'};
          margin-left: auto;
          opacity: 0;
          transition: opacity .2s, transform .2s;
        }
        .pn-nav-item:hover .pn-nav-chevron { opacity: 1; transform: translateX(2px); }

        /* Tooltip para modo colapsado */
        .pn-nav-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(15,20,33,0.98);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f1f5f9;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: opacity .15s ease;
          font-family: var(--font-display);
        }
        ${collapsed ? '.pn-nav-item:hover .pn-nav-tooltip { opacity: 1; }' : ''}

        /* ── Toggle button ── */
        .pn-sidebar-toggle {
          position: absolute;
          top: 22px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1e2a45;
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(148,163,184,0.8);
          transition: all .2s;
          z-index: 30;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .pn-sidebar-toggle:hover {
          background: #253352;
          color: #f1f5f9;
          border-color: rgba(249,115,22,0.4);
        }

        /* ── Footer ── */
        .pn-sidebar-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: ${collapsed ? '12px 8px' : '12px 8px'};
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }

        /* ── Divider ── */
        .pn-sidebar-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 4px 16px;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .pn-sidebar { display: none; }
        }
      `}</style>

      <aside className="pn-sidebar">

        {/* Botón colapsar */}
        <button
          className="pn-sidebar-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <ChevronRight
            size={13}
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform .3s' }}
          />
        </button>

        {/* Logo */}
        <div className="pn-sidebar-logo">
          <div className="pn-sidebar-logo-mark">
            <Store size={18} color="#fff" strokeWidth={2} />
          </div>
          <div className="pn-sidebar-logo-text">
            <span className="pn-sidebar-logo-name">Punto Norte</span>
            <span className="pn-sidebar-logo-sub">Admin Panel</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="pn-sidebar-nav">
          {NAV.map(group => (
            <div key={group.group} className="pn-nav-group">
              <span className="pn-nav-group-label">{group.group}</span>
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`pn-nav-item${active ? ' active' : ''}`}
                  >
                    <span className="pn-nav-icon">
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.75} />
                    </span>
                    <span className="pn-nav-label">{label}</span>
                    {!active && <ChevronRight size={13} className="pn-nav-chevron" />}
                    <span className="pn-nav-tooltip">{label}</span>
                  </Link>
                )
              })}
              <div className="pn-sidebar-divider" />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="pn-sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-nav-item"
            style={{ textDecoration: 'none' }}
          >
            <span className="pn-nav-icon"><ExternalLink size={16} strokeWidth={1.75} /></span>
            <span className="pn-nav-label" style={{ fontSize: '12px' }}>Ver tienda</span>
            <span className="pn-nav-tooltip">Ver tienda</span>
          </a>

          <button
            onClick={handleLogout}
            className="pn-nav-item"
            style={{
              background: 'none', border: '1px solid transparent',
              cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              textAlign: 'left', color: 'rgba(148,163,184,0.85)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f87171'
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(148,163,184,0.85)'
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <span className="pn-nav-icon"><LogOut size={16} strokeWidth={1.75} /></span>
            <span className="pn-nav-label" style={{ fontSize: '12px' }}>Cerrar sesión</span>
            <span className="pn-nav-tooltip">Cerrar sesión</span>
          </button>

          {/* Stats del sistema */}
          {!collapsed && (
            <div style={{
              margin: '8px 6px 0',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.06)',
              border: '1px solid rgba(249,115,22,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.06em' }}>
                  SISTEMA ACTIVO
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} color="rgba(249,115,22,0.8)" />
                <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.6)', fontFamily: 'var(--font-mono)' }}>
                  puntonorteshop.com
                </span>
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  )
}
