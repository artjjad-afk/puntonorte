'use client'
import { useEffect, useState, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import {
  Package, ShoppingBag, DollarSign, Clock,
  CheckCircle, XCircle, TrendingUp, AlertCircle,
  ArrowRight, ArrowUpRight, Zap, Activity,
  Users, Star
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Array<{
    id: number; customerName: string; total: number
    status: string; createdAt: string; paymentMethod: string
  }>
}

const STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={11} /> },
  confirmed: { label: 'Confirmado', color: '#4ade80', bg: 'rgba(37,211,102,0.12)', icon: <CheckCircle size={11} /> },
  shipped:   { label: 'Enviado',    color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', icon: <TrendingUp size={11} /> },
  delivered: { label: 'Entregado',  color: '#4ade80', bg: 'rgba(37,211,102,0.12)', icon: <CheckCircle size={11} /> },
  cancelled: { label: 'Cancelado',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',  icon: <XCircle size={11} /> },
}

/* Tooltip personalizado para el gráfico */
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(16,16,18,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(193,105,43,0.3)', borderRadius: '12px',
      padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: 'rgba(232,229,226,0.5)', fontSize: '11px', margin: '0 0 4px', letterSpacing: '1px' }}>
        {label}
      </p>
      <p style={{ color: '#e88c4a', fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

/* Número animado */
function AnimatedValue({ value, prefix = '', suffix = '' }: {
  value: number | string; prefix?: string; suffix?: string
}) {
  const [display, setDisplay] = useState(0)
  const isNum = typeof value === 'number'

  useEffect(() => {
    if (!isNum) return
    const target = value as number
    const start = Date.now()
    const dur = 1200
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, isNum])

  if (!isNum) return <>{value}</>
  return <>{prefix}{display}{suffix}</>
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<Array<{ day: string; ingresos: number; pedidos: number }>>([])
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/products?all=true').then(r => r.ok ? r.json() : []),
      fetch('/api/orders').then(r => r.ok ? r.json() : []),
    ]).then(([products, orders]) => {
      const activeProducts = products.filter((p: { active: boolean }) => p.active).length
      const totalProducts  = products.length

      setStats({
        totalProducts,
        activeProducts,
        totalOrders:   orders.length,
        pendingOrders: orders.filter((o: { status: string }) => o.status === 'pending').length,
        totalRevenue:  orders.reduce((a: number, o: { total: number }) => a + o.total, 0),
        recentOrders:  orders.slice(0, 8),
      })

      // Construir datos del gráfico — últimos 7 días
      const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      const today = new Date().getDay()
      const data = Array.from({ length: 7 }, (_, i) => {
        const dayIdx = (today - 6 + i + 7) % 7
        const dayOrders = orders.filter((o: { createdAt: string }) => {
          const d = new Date(o.createdAt)
          const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
          return diff === (6 - i)
        })
        return {
          day: days[dayIdx],
          ingresos: dayOrders.reduce((a: number, o: { total: number }) => a + o.total, 0),
          pedidos:  dayOrders.length,
        }
      })
      setChartData(data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const kpis = [
    {
      label: 'Productos',
      value: stats ? `${stats.activeProducts} / ${stats.totalProducts}` : '— / —',
      sub: 'activos / total',
      icon: Package,
      color: '#c1692b',
      glow: 'rgba(193,105,43,0.3)',
      gradient: 'linear-gradient(135deg, rgba(193,105,43,0.15), rgba(193,105,43,0.03))',
      href: '/admin/productos',
      badge: stats?.activeProducts ?? 0,
    },
    {
      label: 'Pedidos',
      value: stats?.totalOrders ?? 0,
      sub: 'en total',
      icon: ShoppingBag,
      color: '#3b8bff',
      glow: 'rgba(59,139,255,0.3)',
      gradient: 'linear-gradient(135deg, rgba(59,139,255,0.15), rgba(59,139,255,0.03))',
      href: '/admin/pedidos',
      badge: stats?.pendingOrders ?? 0,
    },
    {
      label: 'Pendientes',
      value: stats?.pendingOrders ?? 0,
      sub: 'sin confirmar',
      icon: AlertCircle,
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.3)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))',
      href: '/admin/pedidos',
      badge: null,
    },
    {
      label: 'Ingresos',
      value: stats?.totalRevenue ?? 0,
      prefix: '$',
      sub: 'acumulado',
      icon: DollarSign,
      color: '#25d366',
      glow: 'rgba(37,211,102,0.3)',
      gradient: 'linear-gradient(135deg, rgba(37,211,102,0.15), rgba(37,211,102,0.03))',
      href: '/admin/pedidos',
      badge: null,
    },
  ]

  return (
    <>
      <style>{`
        @keyframes kpi-in {
          from { opacity:0; transform:translateY(20px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(1.4); }
        }
        @keyframes sweep-line {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(400%); }
        }
        .kpi-card {
          position:relative; overflow:hidden;
          border-radius:20px; padding:24px;
          border:1px solid rgba(255,255,255,0.07);
          backdrop-filter:blur(20px);
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s;
          cursor:pointer; text-decoration:none; display:block;
          animation: kpi-in .6s cubic-bezier(.22,1,.36,1) both;
        }
        .kpi-card:hover {
          transform:translateY(-6px) scale(1.01);
          border-color:rgba(255,255,255,0.15);
        }
        .kpi-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
        }
        .kpi-card .sweep {
          position:absolute; top:0; left:0; width:30%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
          transform:translateX(-100%); pointer-events:none;
        }
        .kpi-card:hover .sweep { animation:sweep-line .7s ease forwards; }

        .chart-card {
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px; overflow:hidden;
          backdrop-filter:blur(20px);
        }
        .chart-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
        }

        .order-row {
          display:grid;
          grid-template-columns:40px 1fr 80px 90px 100px 70px;
          gap:12px; align-items:center;
          padding:14px 20px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          transition:background .2s;
        }
        .order-row:hover { background:rgba(255,255,255,0.03); }
        .order-row:last-child { border-bottom:none; }

        .status-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:100px;
          font-size:11px; font-weight:700;
        }

        .live-dot {
          width:6px; height:6px; border-radius:50%;
          background:#25d366;
          box-shadow:0 0 8px #25d366;
          animation:pulse-dot 2s ease-in-out infinite;
          display:inline-block;
        }

        .section-hdr {
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 20px;
          border-bottom:1px solid rgba(255,255,255,0.06);
        }

        @media(max-width:768px){
          .kpi-grid { grid-template-columns:1fr 1fr !important; }
          .bottom-grid { grid-template-columns:1fr !important; }
          .order-row { grid-template-columns:1fr auto !important; }
          .order-row .hide-mobile { display:none !important; }
        }
        @media(max-width:480px){
          .kpi-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <main style={{ padding: '28px 28px 120px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span className="live-dot" />
              <span style={{ fontSize:'11px', color:'rgba(232,229,226,0.4)', letterSpacing:'2px', textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>
                Sistema activo · {time}
              </span>
            </div>
            <h1 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:'800', color:'#fff', margin:0, letterSpacing:'-1px', fontFamily:'var(--font-display)' }}>
              Panel de Control
            </h1>
            <p style={{ color:'rgba(232,229,226,0.35)', fontSize:'13px', margin:'4px 0 0', fontFamily:'var(--font-mono)' }}>
              Punto Norte · Barcelona, Anzoátegui
            </p>
          </div>

          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <Link href="/admin/categorias" style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'10px 18px', borderRadius:'12px',
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(232,229,226,0.7)', textDecoration:'none',
              fontSize:'13px', fontWeight:'600', transition:'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(232,229,226,0.7)' }}
            >
              Categorías
            </Link>
            <Link href="/admin/productos/nuevo" style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'10px 20px', borderRadius:'12px',
              background:'linear-gradient(135deg,#c1692b,#a8541f)',
              color:'#fff', textDecoration:'none',
              fontSize:'13px', fontWeight:'700',
              boxShadow:'0 4px 20px rgba(193,105,43,0.4)',
              transition:'all .2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(193,105,43,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(193,105,43,0.4)' }}
            >
              <Zap size={14} /> Nuevo producto
            </Link>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {loading ? (
          <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ borderRadius:'20px', overflow:'hidden', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ height:'130px', background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize:'400px 100%', animation:'adm-shimmer 1.5s infinite' }} />
              </div>
            ))}
            <style>{`@keyframes adm-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
          </div>
        ) : (
          <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
            {kpis.map((k, i) => {
              const Icon = k.icon
              return (
                <Link key={k.label} href={k.href} className="kpi-card"
                  style={{ background: k.gradient, animationDelay: `${i * 80}ms` }}>
                  <div className="sweep" />

                  {/* Top row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                    <div style={{
                      width:'42px', height:'42px', borderRadius:'12px',
                      background:`rgba(${k.color === '#c1692b' ? '193,105,43' : k.color === '#3b8bff' ? '59,139,255' : k.color === '#f59e0b' ? '245,158,11' : '37,211,102'},0.15)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color: k.color,
                      boxShadow:`0 0 20px ${k.glow}`,
                    }}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    {k.badge !== null && k.badge > 0 && (
                      <span style={{
                        background: k.color, color:'#fff',
                        fontSize:'11px', fontWeight:'800',
                        padding:'3px 8px', borderRadius:'100px',
                        boxShadow:`0 0 12px ${k.glow}`,
                        animation:'pulse-dot 2s ease-in-out infinite',
                      }}>
                        {k.badge}
                      </span>
                    )}
                  </div>

                  {/* Value */}
                  <div style={{
                    fontSize:'clamp(24px,3vw,34px)', fontWeight:'900', color:'#fff',
                    letterSpacing:'-1.5px', lineHeight:1, marginBottom:'6px',
                    fontFamily:'var(--font-display)',
                    textShadow:`0 0 30px ${k.glow}`,
                  }}>
                    {typeof k.value === 'number'
                      ? <AnimatedValue value={k.value} prefix={k.prefix ?? ''} />
                      : k.value
                    }
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:'700', color: k.color, margin:0 }}>{k.label}</p>
                      <p style={{ fontSize:'11px', color:'rgba(232,229,226,0.35)', margin:0, fontFamily:'var(--font-mono)' }}>{k.sub}</p>
                    </div>
                    <ArrowUpRight size={16} color="rgba(232,229,226,0.2)" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Gráficas ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'16px', marginBottom:'24px' }} className="bottom-grid">

          {/* Gráfica de ingresos */}
          <div className="chart-card" style={{ position:'relative' }}>
            <div className="section-hdr">
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(193,105,43,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Activity size={16} color="#c1692b" />
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#fff', fontFamily:'var(--font-display)' }}>Ingresos — últimos 7 días</p>
                  <p style={{ margin:0, fontSize:'11px', color:'rgba(232,229,226,0.35)', fontFamily:'var(--font-mono)' }}>En USD</p>
                </div>
              </div>
              <Link href="/admin/pedidos" style={{ display:'flex', alignItems:'center', gap:'4px', color:'#c1692b', textDecoration:'none', fontSize:'12px', fontWeight:'700' }}>
                Ver pedidos <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ padding:'16px 8px 8px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top:4, right:16, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#c1692b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#c1692b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill:'rgba(232,229,226,0.35)', fontSize:11, fontFamily:'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'rgba(232,229,226,0.35)', fontSize:11, fontFamily:'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ingresos" stroke="#c1692b" strokeWidth={2.5}
                      fill="url(#incomeGrad)" dot={{ fill:'#c1692b', r:3, strokeWidth:0 }}
                      activeDot={{ fill:'#e88c4a', r:5, strokeWidth:0, boxShadow:'0 0 12px #c1692b' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', color:'rgba(232,229,226,0.25)' }}>
                  <Activity size={32} strokeWidth={1} />
                  <p style={{ margin:0, fontSize:'13px', fontFamily:'var(--font-mono)' }}>Sin datos aún</p>
                </div>
              )}
            </div>
          </div>

          {/* Mini gráfica de pedidos por día */}
          <div className="chart-card" style={{ position:'relative' }}>
            <div className="section-hdr">
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(59,139,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Users size={16} color="#3b8bff" />
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#fff', fontFamily:'var(--font-display)' }}>Pedidos / día</p>
                  <p style={{ margin:0, fontSize:'11px', color:'rgba(232,229,226,0.35)', fontFamily:'var(--font-mono)' }}>Últimos 7 días</p>
                </div>
              </div>
            </div>
            <div style={{ padding:'16px 8px 8px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top:4, right:8, left:-28, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill:'rgba(232,229,226,0.35)', fontSize:11, fontFamily:'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'rgba(232,229,226,0.35)', fontSize:11, fontFamily:'IBM Plex Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div style={{ background:'rgba(16,16,18,0.95)', backdropFilter:'blur(20px)', border:'1px solid rgba(59,139,255,0.3)', borderRadius:'12px', padding:'10px 14px' }}>
                          <p style={{ color:'rgba(232,229,226,0.5)', fontSize:'11px', margin:'0 0 3px' }}>{label}</p>
                          <p style={{ color:'#60a5fa', fontSize:'17px', fontWeight:'800', margin:0 }}>{payload[0].value} pedidos</p>
                        </div>
                      )
                    }} />
                    <Bar dataKey="pedidos" fill="#3b8bff" radius={[4,4,0,0]}
                      style={{ filter:'drop-shadow(0 0 8px rgba(59,139,255,0.4))' }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height:'200px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px', color:'rgba(232,229,226,0.25)' }}>
                  <Users size={32} strokeWidth={1} />
                  <p style={{ margin:0, fontSize:'13px', fontFamily:'var(--font-mono)' }}>Sin datos aún</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pedidos recientes ── */}
        <div className="chart-card" style={{ position:'relative' }}>
          <div className="section-hdr">
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(193,105,43,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShoppingBag size={16} color="#c1692b" />
              </div>
              <div>
                <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#fff', fontFamily:'var(--font-display)' }}>Pedidos recientes</p>
                <p style={{ margin:0, fontSize:'11px', color:'rgba(232,229,226,0.35)', fontFamily:'var(--font-mono)' }}>
                  {stats?.totalOrders ?? 0} en total
                </p>
              </div>
            </div>
            <Link href="/admin/pedidos" style={{ display:'flex', alignItems:'center', gap:'4px', color:'#c1692b', textDecoration:'none', fontSize:'12px', fontWeight:'700' }}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding:'48px', textAlign:'center', color:'rgba(232,229,226,0.25)' }}>
              <div className="adm-spinner" style={{ margin:'0 auto 12px' }} />
              <p style={{ margin:0, fontSize:'13px', fontFamily:'var(--font-mono)' }}>Cargando...</p>
            </div>
          ) : !stats?.recentOrders?.length ? (
            <div style={{ padding:'60px', textAlign:'center', color:'rgba(232,229,226,0.25)' }}>
              <ShoppingBag size={40} strokeWidth={1} style={{ margin:'0 auto 12px', display:'block' }} />
              <p style={{ margin:'0 0 6px', fontSize:'15px', fontWeight:'600', color:'rgba(232,229,226,0.4)' }}>Sin pedidos todavía</p>
              <p style={{ margin:0, fontSize:'13px', fontFamily:'var(--font-mono)' }}>Aparecerán aquí cuando los clientes compren</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              {/* Header de tabla */}
              <div className="order-row" style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                {['#','Cliente','Total','Método','Estado','Fecha'].map(h => (
                  <p key={h} style={{ margin:0, fontSize:'10px', fontWeight:'700', color:'rgba(232,229,226,0.3)', letterSpacing:'1.5px', textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>{h}</p>
                ))}
              </div>
              {stats.recentOrders.map((o, i) => {
                const st = STATUS[o.status] || STATUS.pending
                return (
                  <div key={o.id} className="order-row"
                    style={{ animationDelay:`${i * 50}ms` }}>
                    <span style={{ fontSize:'12px', color:'rgba(232,229,226,0.3)', fontWeight:'700', fontFamily:'var(--font-mono)' }}>
                      #{o.id}
                    </span>
                    <div>
                      <p style={{ margin:0, fontWeight:'700', color:'#fff', fontSize:'13px' }}>{o.customerName}</p>
                    </div>
                    <span style={{ color:'#e88c4a', fontWeight:'800', fontSize:'14px', fontFamily:'var(--font-mono)', textShadow:'0 0 12px rgba(193,105,43,0.5)' }}>
                      ${o.total.toFixed(2)}
                    </span>
                    <span style={{ color:'rgba(232,229,226,0.5)', fontSize:'12px', fontFamily:'var(--font-mono)' }} className="hide-mobile">
                      {o.paymentMethod}
                    </span>
                    <span className="status-pill" style={{ background: st.bg, color: st.color, border:`1px solid ${st.color}30` }}>
                      {st.icon} {st.label}
                    </span>
                    <span style={{ color:'rgba(232,229,226,0.35)', fontSize:'11px', fontFamily:'var(--font-mono)' }}>
                      {new Date(o.createdAt).toLocaleDateString('es-VE', { day:'2-digit', month:'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Acciones rápidas ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginTop:'16px' }} className="bottom-grid">
          {[
            { href:'/admin/productos/nuevo', label:'Nuevo producto',  icon:<Package size={18} />,  color:'#c1692b', desc:'Agrega al catálogo' },
            { href:'/admin/pedidos',         label:'Gestionar pedidos', icon:<ShoppingBag size={18} />, color:'#3b8bff', desc:'Ver y actualizar' },
            { href:'/admin/categorias',      label:'Categorías',      icon:<Star size={18} />,     color:'#f59e0b', desc:'Organizar tienda' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{
              display:'flex', alignItems:'center', gap:'14px',
              padding:'16px 20px', borderRadius:'16px', textDecoration:'none',
              background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
              transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
              position:'relative', overflow:'hidden',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)' }}
            >
              <div style={{ width:'40px', height:'40px', borderRadius:'11px', background:`rgba(${a.color === '#c1692b' ? '193,105,43' : a.color === '#3b8bff' ? '59,139,255' : '245,158,11'},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>
                {a.icon}
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ margin:0, fontWeight:'700', color:'#fff', fontSize:'13px', fontFamily:'var(--font-display)' }}>{a.label}</p>
                <p style={{ margin:0, fontSize:'11px', color:'rgba(232,229,226,0.35)', fontFamily:'var(--font-mono)' }}>{a.desc}</p>
              </div>
              <ArrowRight size={14} color="rgba(232,229,226,0.2)" style={{ marginLeft:'auto', flexShrink:0 }} />
            </Link>
          ))}
        </div>

      </main>
    </>
  )
}
