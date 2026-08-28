'use client'
import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  Package, ShoppingBag, DollarSign, Clock,
  CheckCircle, XCircle, TrendingUp, AlertCircle,
  ArrowRight, Zap, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'

/* ── Types ── */
interface Order {
  id: number
  customerName: string
  total: number
  status: string
  createdAt: string
  paymentMethod: string
}
interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Order[]
  statusCounts: Record<string, number>
}

// Estados que cuentan como ingreso real (venta concretada)
const PAID_STATUSES = ['confirmed', 'shipped', 'delivered']

/* ── Status config ── */
const STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(245,158,11,0.15)',  icon: <Clock size={11} /> },
  confirmed: { label: 'Confirmado', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', icon: <CheckCircle size={11} /> },
  shipped:   { label: 'Enviado',    color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', icon: <TrendingUp size={11} /> },
  delivered: { label: 'Entregado',  color: '#4ade80', bg: 'rgba(74,222,128,0.15)', icon: <CheckCircle size={11} /> },
  cancelled: { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.15)', icon: <XCircle size={11} /> },
}

/* ── Número animado ── */
function AnimNum({ to, prefix = '', decimals = 0 }: { to: number; prefix?: string; decimals?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const dur = 1400
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(ease * to)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to])
  return <>{prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val)}</>
}

/* ── Tooltip área ── */
function AreaTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(15,20,33,0.98)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, margin: '0 0 3px', letterSpacing: 1 }}>{label}</p>
      <p style={{ color: '#f97316', fontSize: 17, fontWeight: 800, margin: 0 }}>${payload[0].value.toFixed(2)}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [chartData, setChartData] = useState<Array<{ day: string; ingresos: number }>>([])
  const [time, setTime]         = useState('')

  /* Reloj */
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  /* Datos */
  useEffect(() => {
    Promise.all([
      fetch('/api/products?all=true').then(r => r.ok ? r.json() : []),
      fetch('/api/orders').then(r => r.ok ? r.json() : []),
    ]).then(([products, orders]) => {
      setStats({
        totalProducts:  products.length,
        activeProducts: products.filter((p: { active: boolean }) => p.active).length,
        totalOrders:    orders.length,
        pendingOrders:  orders.filter((o: Order) => o.status === 'pending').length,
        // Ingresos = solo pedidos pagados (confirmado / enviado / entregado)
        totalRevenue:   orders.filter((o: Order) => PAID_STATUSES.includes(o.status)).reduce((a: number, o: Order) => a + o.total, 0),
        recentOrders:   orders.slice(0, 6),
        // Conteo por estado sobre TODOS los pedidos (para la dona y la distribución)
        statusCounts:   orders.reduce((acc: Record<string, number>, o: Order) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {}),
      })
      /* Gráfica últimos 7 días */
      const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      const today = new Date().getDay()
      setChartData(Array.from({ length: 7 }, (_, i) => {
        const dayIdx = (today - 6 + i + 7) % 7
        const day_orders = orders.filter((o: Order) => {
          if (!PAID_STATUSES.includes(o.status)) return false
          const diff = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86400000)
          return diff === 6 - i
        })
        return {
          day: days[dayIdx],
          ingresos: day_orders.reduce((a: number, o: Order) => a + o.total, 0),
        }
      }))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  /* Datos para el pie de estados */
  const pieData = stats ? [
    { name: 'Pendiente',  value: stats.statusCounts['pending']   ?? 0, color: '#fbbf24' },
    { name: 'Confirmado', value: stats.statusCounts['confirmed'] ?? 0, color: '#4ade80' },
    { name: 'Enviado',    value: stats.statusCounts['shipped']   ?? 0, color: '#60a5fa' },
    { name: 'Entregado',  value: stats.statusCounts['delivered'] ?? 0, color: '#a78bfa' },
    { name: 'Cancelado',  value: stats.statusCounts['cancelled'] ?? 0, color: '#f87171' },
  ].filter(d => d.value > 0) : []

  const totalPie = pieData.reduce((a, d) => a + d.value, 0)

  return (
    <div style={{ padding: '24px 28px 100px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)' }}>
      <style>{`
        .dash-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, box-shadow .25s;
        }
        .dash-card:hover {
          border-color: rgba(255,255,255,0.14);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .dash-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.25), transparent);
          pointer-events: none;
        }
        .status-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 100px;
          font-size: 11px; font-weight: 700;
        }
        .bar-fill {
          height: 6px; border-radius: 3px;
          transition: width 1.4s cubic-bezier(.16,1,.3,1);
        }
        /* Tarjetas-botón: toda la tarjeta es clickeable */
        .stat-link { text-decoration: none; }
        .stat-arrow { color: rgba(148,163,184,0.3); transition: color .2s, transform .2s; }
        .stat-link:hover .stat-arrow { transform: translate(2px,-2px); }
        .stat-link.orange:hover .stat-arrow { color: #f97316; }
        .stat-link.amber:hover  .stat-arrow { color: #fbbf24; }
        .stat-link.blue:hover   .stat-arrow { color: #60a5fa; }
        @media(max-width:1100px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:768px) {
          .dash-top-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:480px) {
          .dash-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
            />
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              SISTEMA ACTIVO · {time}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>
            Panel de Control
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 13, margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            Punto Norte · Barcelona, Anzoátegui
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/categorias" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.8)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            Categorías
          </Link>
          <Link href="/admin/productos/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: 'linear-gradient(135deg,#f97316,#c1692b)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 18px rgba(249,115,22,0.4)' }}>
            <Zap size={14} /> Nuevo producto
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ZONA SUPERIOR: Hero banner + mini cards
          ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="dash-top-grid">

        {/* ── Banner hero: Ingresos del mes ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dash-card"
          style={{ padding: '28px 28px 24px', background: 'linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(15,20,33,0.95) 60%)', gridColumn: 'span 1' }}
        >
          {/* Orb decorativo */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.2), transparent 70%)', pointerEvents: 'none' }} />

          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-mono)' }}>
            Ingresos totales
          </p>
          <div style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
            $<span style={{ color: '#f97316' }}>
              {loading ? '—' : <AnimNum to={stats?.totalRevenue ?? 0} decimals={2} />}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)', margin: '0 0 20px' }}>
            {stats?.totalOrders ?? 0} pedidos registrados
          </p>

          {/* Mini gráfica de área */}
          <div style={{ height: 80, marginLeft: -8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="ingresos" stroke="#f97316" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
                <Tooltip content={<AreaTip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Link href="/admin/pedidos" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14, color: '#f97316', fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
            Ver todos los pedidos <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* ── Mini cards apiladas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Productos activos */}
          <Link href="/admin/productos" className="stat-link orange" style={{ flex: 1, display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="dash-card"
            style={{ flex: 1, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(249,115,22,0.2)' }}>
              <Package size={22} color="#f97316" strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', margin: '0 0 3px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Productos activos</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                {loading ? '—' : `${stats?.activeProducts ?? 0}`}
                <span style={{ fontSize: 14, color: 'rgba(148,163,184,0.4)', fontWeight: 500 }}> / {stats?.totalProducts ?? 0}</span>
              </p>
            </div>
            <span className="stat-arrow" style={{ display: 'inline-flex', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </span>
          </motion.div>
          </Link>

          {/* Pedidos pendientes */}
          <Link href="/admin/pedidos" className="stat-link amber" style={{ flex: 1, display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="dash-card"
            style={{ flex: 1, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(245,158,11,0.2)' }}>
              <AlertCircle size={22} color="#fbbf24" strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', margin: '0 0 3px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Pendientes</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                {loading ? '—' : (stats?.pendingOrders ?? 0)}
                <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginLeft: 8 }}>por confirmar</span>
              </p>
            </div>
            <span className="stat-arrow" style={{ display: 'inline-flex', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </span>
          </motion.div>
          </Link>

          {/* Total pedidos */}
          <Link href="/admin/pedidos" className="stat-link blue" style={{ flex: 1, display: 'flex' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="dash-card"
            style={{ flex: 1, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(96,165,250,0.2)' }}>
              <ShoppingBag size={22} color="#60a5fa" strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', margin: '0 0 3px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Total pedidos</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                {loading ? '—' : <AnimNum to={stats?.totalOrders ?? 0} />}
              </p>
            </div>
            <span className="stat-arrow" style={{ display: 'inline-flex', flexShrink: 0 }}>
              <ArrowUpRight size={18} />
            </span>
          </motion.div>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ZONA MEDIA: Estadísticas pie + barras de estado
          ══════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="dash-top-grid">

        {/* Panel circular de estados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="dash-card"
          style={{ padding: '24px 24px' }}
        >
          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-mono)' }}>
            Estado de pedidos
          </p>

          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Gráfica circular */}
              <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                      paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div style={{ background: 'rgba(15,20,33,0.98)', border: `1px solid ${d.color}40`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                            <span style={{ color: d.color, fontWeight: 700 }}>{d.name}: {d.value}</span>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Número central */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{totalPie}</span>
                  <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>TOTAL</span>
                </div>
              </div>

              {/* Leyenda */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
                      <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, color: 'rgba(148,163,184,0.3)' }}>
              <ShoppingBag size={32} strokeWidth={1} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, margin: 0, fontFamily: 'var(--font-mono)' }}>Sin pedidos aún</p>
            </div>
          )}
        </motion.div>

        {/* Barras de estado de pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="dash-card"
          style={{ padding: '24px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Distribución
            </p>
            <Link href="/admin/pedidos" style={{ fontSize: 11, color: '#f97316', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(STATUS).map(([key, st]) => {
              const count  = stats?.statusCounts[key] ?? 0
              const total  = stats?.totalOrders ?? 0
              const pct    = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: st.color }}>{st.icon}</span> {st.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                      style={{ height: '100%', borderRadius: 3, background: st.color, boxShadow: `0 0 8px ${st.color}` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          ZONA INFERIOR: Pedidos recientes
          ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="dash-card"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(249,115,22,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} color="#f97316" strokeWidth={1.75} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Pedidos recientes</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.45)', fontFamily: 'var(--font-mono)' }}>{stats?.totalOrders ?? 0} en total</p>
            </div>
          </div>
          <Link href="/admin/pedidos" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f97316', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(148,163,184,0.3)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', animation: 'spin .8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando...</p>
          </div>
        ) : !stats?.recentOrders?.length ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'rgba(148,163,184,0.25)' }}>
            <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>Sin pedidos todavía</p>
            <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Aparecerán aquí cuando los clientes compren</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 90px 100px 110px 80px', gap: 12, padding: '10px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['#', 'Cliente', 'Total', 'Método', 'Estado', 'Fecha'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(100,116,139,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{h}</span>
              ))}
            </div>

            {/* Filas */}
            {stats.recentOrders.map((o, i) => {
              const st = STATUS[o.status] || STATUS.pending
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '50px 1fr 90px 100px 110px 80px',
                    gap: 12, padding: '13px 22px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center',
                    transition: 'background .18s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 12, color: 'rgba(100,116,139,0.6)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>#{o.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{o.customerName}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316', fontFamily: 'var(--font-mono)', filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.4))' }}>${o.total.toFixed(2)}</span>
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', fontFamily: 'var(--font-mono)' }}>{o.paymentMethod}</span>
                  <span className="status-pill" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30`, width: 'fit-content' }}>
                    {st.icon} {st.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(100,116,139,0.6)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(o.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ── Acciones rápidas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }} className="dash-top-grid">
        {[
          { href: '/admin/productos/nuevo', label: 'Nuevo producto',   icon: Package,     color: '#f97316', desc: 'Agrega al catálogo' },
          { href: '/admin/pedidos',         label: 'Gestionar pedidos', icon: ShoppingBag, color: '#60a5fa', desc: 'Ver y actualizar' },
          { href: '/admin/categorias',      label: 'Categorías',        icon: DollarSign,  color: '#fbbf24', desc: 'Organizar tienda' },
        ].map((a, i) => {
          const Icon = a.icon
          return (
            <motion.div key={a.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
              <Link href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.13)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = '' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `rgba(${a.color === '#f97316' ? '249,115,22' : a.color === '#60a5fa' ? '96,165,250' : '251,191,36'},0.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{a.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.45)', fontFamily: 'var(--font-mono)' }}>{a.desc}</p>
                </div>
                <ArrowRight size={14} color="rgba(148,163,184,0.2)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
