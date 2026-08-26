'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  ExternalLink, LogOut, Store, Moon, Sun,
  ChevronLeft, ChevronRight, Zap,
} from 'lucide-react'

const NAV = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true  },
  { href: '/admin/productos',  label: 'Productos',  icon: Package,         exact: false },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag,             exact: false },
  { href: '/admin/banners',    label: 'Ofertas',    icon: Zap,             exact: false },
  { href: '/admin/pedidos',    label: 'Pedidos',    icon: ShoppingBag,     exact: false },
]

/* ── Canvas de efectos visuales ── */
function SidebarFX() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let raf: number
    let visible = true
    let t = 0
    let last = 0
    const FPS = 30

    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', () => { visible = document.visibilityState === 'visible' })

    // Estrellas
    type Star = { x:number; y:number; r:number; alpha:number; speed:number; phase:number }
    const stars: Star[] = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.7,
      speed: 0.003 + Math.random() * 0.008,
      phase: Math.random() * Math.PI * 2,
    }))

    // Rayos de luz (líneas diagonales brillantes)
    type Ray = { x:number; speed:number; width:number; alpha:number; hue:number; offset:number }
    const rays: Ray[] = Array.from({ length: 5 }, (_, i) => ({
      x: (i / 5) + Math.random() * 0.2,
      speed: 0.0003 + Math.random() * 0.0005,
      width: 20 + Math.random() * 40,
      alpha: 0.03 + Math.random() * 0.05,
      hue: i % 2 === 0 ? 25 : 210, // naranja o azul
      offset: Math.random() * Math.PI * 2,
    }))

    // Partículas flotantes
    type Particle = { x:number; y:number; vx:number; vy:number; r:number; alpha:number; hue:number }
    const particles: Particle[] = Array.from({ length: 15 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -0.0002 - Math.random() * 0.0003,
      r: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      hue: Math.random() < 0.6 ? 25 : 210,
    }))

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible || now - last < 1000 / FPS) return
      last = now
      t += 0.016

      const W = c.width, H = c.height
      ctx.clearRect(0, 0, W, H)

      // ── Rayos de luz diagonales ──
      for (const ray of rays) {
        ray.x += ray.speed
        if (ray.x > 1.3) ray.x = -0.3
        const pulse = 0.7 + Math.sin(t * 0.5 + ray.offset) * 0.3
        const x = ray.x * W
        const grad = ctx.createLinearGradient(x - ray.width, 0, x + ray.width, H)
        grad.addColorStop(0, 'transparent')
        grad.addColorStop(0.5, `hsla(${ray.hue}, 90%, 65%, ${ray.alpha * pulse})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      // ── Orb de luz naranja en la esquina superior ──
      const orbR = Math.min(W, H) * 0.5
      const orbPulse = 0.6 + Math.sin(t * 0.4) * 0.2
      const orbGrad = ctx.createRadialGradient(W * 0.1, H * 0.05, 0, W * 0.1, H * 0.05, orbR)
      orbGrad.addColorStop(0, `rgba(249,115,22,${0.12 * orbPulse})`)
      orbGrad.addColorStop(0.5, `rgba(249,115,22,${0.04 * orbPulse})`)
      orbGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = orbGrad
      ctx.fillRect(0, 0, W, H)

      // ── Orb azul en esquina inferior ──
      const orbGrad2 = ctx.createRadialGradient(W * 0.9, H * 0.95, 0, W * 0.9, H * 0.95, orbR * 0.7)
      orbGrad2.addColorStop(0, `rgba(59,130,246,${0.08 * orbPulse})`)
      orbGrad2.addColorStop(1, 'transparent')
      ctx.fillStyle = orbGrad2
      ctx.fillRect(0, 0, W, H)

      // ── Estrellas ──
      for (const s of stars) {
        s.phase += s.speed
        const a = s.alpha * (0.5 + Math.sin(s.phase) * 0.5)
        const x = s.x * W, y = s.y * H

        // Glow de la estrella
        const sg = ctx.createRadialGradient(x, y, 0, x, y, s.r * 4)
        sg.addColorStop(0, `rgba(255,255,255,${a * 0.8})`)
        sg.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, s.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = sg
        ctx.fill()

        // Punto central
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fill()

        // Cruz de luz en estrellas grandes
        if (s.r > 1.2) {
          ctx.save()
          ctx.globalAlpha = a * 0.5
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 0.5
          const len = s.r * 6
          ctx.beginPath()
          ctx.moveTo(x - len, y); ctx.lineTo(x + len, y)
          ctx.moveTo(x, y - len); ctx.lineTo(x, y + len)
          ctx.stroke()
          ctx.restore()
        }
      }

      // ── Partículas flotantes ──
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random() }

        const px = p.x * W, py = p.y * H
        const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3)
        pg.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${p.alpha})`)
        pg.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(px, py, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

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
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',      }}
    >
      {/* ── Canvas de efectos ── */}
      <SidebarFX />
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
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '16px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        minHeight: 64,
        position: 'relative', zIndex: 1,
        gap: 8,
      }}>
        {/* Logo — oculto cuando colapsa */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', minWidth: 0 }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #f97316, #c1692b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(249,115,22,0.4)',
              }}>
                <Store size={18} color="#fff" strokeWidth={2.2} />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 15, fontWeight: 700,
                color: '#f1f5f9', letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}>
                PUNTO NORTE
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón colapsar — siempre visible */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.90 }}
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#f97316',
            boxShadow: '0 0 10px rgba(249,115,22,0.2)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.28)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(249,115,22,0.5)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.15)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(249,115,22,0.2)'
          }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ChevronRight size={15} />
          </motion.div>
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
        position: 'relative', zIndex: 1,
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
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
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
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px', position: 'relative', zIndex: 1 }} />

      {/* ── Footer — acciones ── */}
      <div style={{ padding: '8px 0 12px', flexShrink: 0, position: 'relative', zIndex: 1 }}>

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
