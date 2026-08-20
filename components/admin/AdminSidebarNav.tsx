'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  ExternalLink, LogOut, Store, Moon, Sun,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true  },
  { href: '/admin/productos',  label: 'Productos',  icon: Package,         exact: false },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag,             exact: false },
  { href: '/admin/pedidos',    label: 'Pedidos',    icon: ShoppingBag,     exact: false },
]

const BOTTOM = [
  { href: '/', label: 'Ver tienda', icon: ExternalLink, external: true },
]

export function AdminSidebarNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(true)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* igualmente redirigimos */ }
    router.push('/admin/login')
    router.refresh()
  }

  const W = collapsed ? 80 : 256

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{
        height: '100vh',
        background: '#1a1d2e',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        zIndex: 20,
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      <style>{`
        .sb-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          border-radius: 0;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: rgba(160,174,192,0.75);
          transition: color .18s, background .18s;
          position: relative;
          cursor: pointer;
          white-space: nowrap;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          font-family: var(--font-display, 'Space Grotesk', sans-serif);
          letter-spacing: 0.01em;
        }
        .sb-item:hover {
          color: #f1f5f9;
          background: rgba(255,255,255,0.05);
        }
        .sb-item.active {
          color: #fff;
          font-weight: 600;
          background: rgba(249,115,22,0.12);
        }
        .sb-tip {
          position: absolute;
          left: calc(100% + 16px);
          top: 50%; transform: translateY(-50%);
          background: #1a1d2e;
          border: 1px solid rgba(255,255,255,0.12);
          color: #f1f5f9;
          font-size: 12px; font-weight: 600;
          padding: 6px 12px; border-radius: 8px;
          white-space: nowrap; pointer-events: none;
          opacity: 0; z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: opacity .15s ease;
          font-family: var(--font-display);
        }
        .sb-item:hover .sb-tip { opacity: 1; }
      `}</style>

      {/* ── Header — Logo + colapsar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        minHeight: 64,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #f97316, #c1692b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
          }}>
            <Store size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16, fontWeight: 700,
                  color: '#f1f5f9', letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                PUNTO NORTE
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Botón colapsar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(148,163,184,0.8)',
            transition: 'color .2s, background .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f97316'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>

      {/* ── Perfil de usuario ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '16px 0' : '16px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '2px solid rgba(249,115,22,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#f97316',
          boxShadow: '0 0 0 3px rgba(249,115,22,0.12)',
          fontFamily: 'var(--font-display)',
        }}>
          A
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                Admin
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.6)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                Punto Norte
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navegación principal ── */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`sb-item${active ? ' active' : ''}`}
              style={{ padding: collapsed ? '13px 0' : '12px 20px', justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              {/* Fondo activo deslizante */}
              {active && (
                <motion.div
                  layoutId="activeBg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(249,115,22,0.1)',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Pill derecho — igual que en la referencia */}
              {active && (
                <motion.div
                  layoutId="activePill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute', right: 0, top: '15%', bottom: '15%',
                    width: 4, borderRadius: '3px 0 0 3px',
                    background: 'linear-gradient(to bottom, #f97316, #fb923c)',
                    boxShadow: '0 0 12px rgba(249,115,22,0.8)',
                    zIndex: 2,
                  }}
                />
              )}

              {/* Icono */}
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, flexShrink: 0, zIndex: 1 }}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.25 : 1.75}
                  color={active ? '#f97316' : undefined}
                />
              </motion.span>

              {/* Label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    style={{ zIndex: 1 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip colapsado */}
              {collapsed && <span className="sb-tip">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />

      {/* ── Footer — acciones ── */}
      <div style={{ padding: '8px 0 12px', flexShrink: 0 }}>

        {/* Modo oscuro toggle */}
        <button
          onClick={() => setDark(d => !d)}
          className="sb-item"
          style={{ padding: collapsed ? '12px 0' : '12px 20px', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, flexShrink: 0 }}>
            {dark ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.16 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
              >
                <span>Modo oscuro</span>
                {/* Toggle pill */}
                <motion.div
                  animate={{ background: dark ? '#f97316' : '#334155' }}
                  style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0 }}
                >
                  <motion.div
                    animate={{ x: dark ? 18 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff' }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && <span className="sb-tip">Modo oscuro</span>}
        </button>

        {/* Ver tienda */}
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="sb-item"
          style={{ padding: collapsed ? '12px 0' : '12px 20px', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, flexShrink: 0 }}>
            <ExternalLink size={18} strokeWidth={1.75} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.16 }}
              >
                Ver tienda
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && <span className="sb-tip">Ver tienda</span>}
        </a>

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          className="sb-item"
          whileHover={{ color: '#f87171' }}
          style={{ padding: collapsed ? '12px 0' : '12px 20px', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, flexShrink: 0 }}>
            <LogOut size={18} strokeWidth={1.75} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.16 }}
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && <span className="sb-tip">Cerrar sesión</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}
