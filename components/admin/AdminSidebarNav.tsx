'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  ExternalLink, LogOut, ChevronRight, Store,
  TrendingUp, Zap,
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
      { href: '/admin/productos',  label: 'Productos',  icon: Package, exact: false },
      { href: '/admin/categorias', label: 'Categorías', icon: Tag,     exact: false },
    ],
  },
]

export function AdminSidebarNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* redirigimos igual */ }
    router.push('/admin/login')
    router.refresh()
  }

  const W = collapsed ? 72 : 240

  return (
    <>
      <style>{`
        .pn-sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          margin: 1px 8px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: rgba(148,163,184,0.85);
          transition: color .2s;
          position: relative;
          cursor: pointer;
          white-space: nowrap;
          z-index: 1;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          background: none;
          border: none;
          width: calc(100% - 16px);
          font-family: var(--font-display, 'Space Grotesk', sans-serif);
        }
        .pn-sb-item:hover { color: #f1f5f9; }
        .pn-sb-item.active { color: #fff; font-weight: 600; }

        .pn-sb-label { overflow: hidden; text-overflow: ellipsis; }

        /* Tooltip colapsado */
        .pn-sb-tip {
          position: absolute;
          left: calc(100% + 14px);
          top: 50%; transform: translateY(-50%);
          background: rgba(15,20,33,0.98);
          border: 1px solid rgba(255,255,255,0.14);
          color: #f1f5f9;
          font-size: 12px; font-weight: 600;
          padding: 6px 12px; border-radius: 8px;
          white-space: nowrap; pointer-events: none;
          opacity: 0; z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: opacity .15s ease;
          font-family: var(--font-display);
        }
        .pn-sb-item:hover .pn-sb-tip { opacity: 1; }

        /* Divider */
        .pn-sb-div {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 6px 16px;
        }

        /* Group label */
        .pn-sb-group-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(100,116,139,0.6);
          padding: 0 20px; margin-bottom: 3px;
        }

        /* Toggle button */
        .pn-sb-toggle {
          position: absolute; top: 22px; right: -13px;
          width: 26px; height: 26px; border-radius: 50%;
          background: #1e2a45; border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(148,163,184,0.8);
          transition: all .2s; z-index: 30;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        .pn-sb-toggle:hover {
          background: #253352; color: #f97316;
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 0 12px rgba(249,115,22,0.25);
        }
      `}</style>

      <motion.aside
        animate={{ width: W }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          minHeight: '100vh',
          background: 'rgba(11,15,25,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        {/* Filo superior naranja */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Botón colapsar */}
        <button className="pn-sb-toggle" onClick={() => setCollapsed(c => !c)}>
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <ChevronRight size={13} />
          </motion.div>
        </button>

        {/* ── Logo ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 10, padding: collapsed ? '20px 0' : '18px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {/* Icono con glow animado */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: 'linear-gradient(135deg, #f97316, #c1692b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
            }}
          >
            <Store size={19} color="#fff" strokeWidth={2} />
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, overflow: 'hidden' }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
                  Punto Norte
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(148,163,184,0.55)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  ADMIN PANEL
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navegación ── */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(group => (
            <div key={group.group} style={{ padding: '8px 0' }}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="pn-sb-group-label"
                    style={{ display: 'block' }}
                  >
                    {group.group}
                  </motion.span>
                )}
              </AnimatePresence>

              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact)
                const hovered = hoveredHref === href

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`pn-sb-item${active ? ' active' : ''}`}
                    onMouseEnter={() => setHoveredHref(href)}
                    onMouseLeave={() => setHoveredHref(null)}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  >
                    {/* Fondo hover con motion */}
                    {hovered && !active && (
                      <motion.div
                        layoutId="hoverBg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        style={{
                          position: 'absolute', inset: 0, borderRadius: 10,
                          background: 'rgba(255,255,255,0.06)',
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* Fondo activo con motion — se desliza entre items */}
                    {active && (
                      <motion.div
                        layoutId="activeBg"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        style={{
                          position: 'absolute', inset: 0, borderRadius: 10,
                          background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))',
                          border: '1px solid rgba(249,115,22,0.28)',
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* Borde izquierdo activo */}
                    {active && (
                      <motion.div
                        layoutId="activeBar"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        style={{
                          position: 'absolute', left: 0, top: '18%', bottom: '18%',
                          width: 3, borderRadius: '0 3px 3px 0',
                          background: 'linear-gradient(to bottom, #f97316, #fb923c)',
                          boxShadow: '0 0 10px rgba(249,115,22,0.7)',
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Icono */}
                    <motion.span
                      animate={{ scale: active ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, flexShrink: 0, zIndex: 1 }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.25 : 1.75}
                        color={active ? '#fb923c' : undefined}
                      />
                    </motion.span>

                    {/* Label */}
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18 }}
                          className="pn-sb-label"
                          style={{ zIndex: 1 }}
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip (solo colapsado) */}
                    {collapsed && <span className="pn-sb-tip">{label}</span>}
                  </Link>
                )
              })}

              <div className="pn-sb-div" />
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 8px',
          display: 'flex', flexDirection: 'column', gap: 2,
          flexShrink: 0,
        }}>
          {/* Ver tienda */}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="pn-sb-item"
            onMouseEnter={() => setHoveredHref('web')}
            onMouseLeave={() => setHoveredHref(null)}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, flexShrink: 0 }}>
              <ExternalLink size={15} strokeWidth={1.75} />
            </span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                  style={{ fontSize: 12 }}
                >
                  Ver tienda
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && <span className="pn-sb-tip">Ver tienda</span>}
          </a>

          {/* Logout */}
          <motion.button
            whileHover={{ color: '#f87171' }}
            onClick={handleLogout}
            className="pn-sb-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, flexShrink: 0 }}>
              <LogOut size={15} strokeWidth={1.75} />
            </span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                  style={{ fontSize: 12 }}
                >
                  Cerrar sesión
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && <span className="pn-sb-tip">Cerrar sesión</span>}
          </motion.button>

          {/* Badge sistema activo */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
                style={{
                  margin: '6px 6px 0',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(249,115,22,0.06)',
                  border: '1px solid rgba(249,115,22,0.14)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
                  />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(148,163,184,0.65)', letterSpacing: '0.08em' }}>
                    SISTEMA ACTIVO
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <TrendingUp size={11} color="rgba(249,115,22,0.7)" />
                  <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', fontFamily: 'var(--font-mono)' }}>
                    puntonorteshop.com
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}
