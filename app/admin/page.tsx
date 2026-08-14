'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Package, ShoppingBag, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Array<{ id: number; customerName: string; total: number; status: string; createdAt: string; paymentMethod: string }>
}

const STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  cls: 'adm-badge-yellow', icon: <Clock size={11} /> },
  confirmed: { label: 'Confirmado', cls: 'adm-badge-green',  icon: <CheckCircle size={11} /> },
  shipped:   { label: 'Enviado',    cls: 'adm-badge-blue',   icon: <TrendingUp size={11} /> },
  delivered: { label: 'Entregado',  cls: 'adm-badge-green',  icon: <CheckCircle size={11} /> },
  cancelled: { label: 'Cancelado',  cls: 'adm-badge-red',    icon: <XCircle size={11} /> },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.ok ? r.json() : []),
      fetch('/api/orders').then(r => r.ok ? r.json() : []),
    ]).then(([products, orders]) => {
      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p: { active: boolean }) => p.active).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: { status: string }) => o.status === 'pending').length,
        totalRevenue: orders.reduce((a: number, o: { total: number }) => a + o.total, 0),
        recentOrders: orders.slice(0, 6),
      })
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Productos activos', value: stats?.activeProducts ?? 0, icon: <Package size={20} />, cls: 'stat-copper', color: '#c1692b', link: '/admin/productos' },
    { label: 'Pedidos totales',   value: stats?.totalOrders ?? 0,    icon: <ShoppingBag size={20} />, cls: 'stat-blue',   color: '#3b82f6', link: '/admin/pedidos' },
    { label: 'Pendientes pago',   value: stats?.pendingOrders ?? 0,  icon: <AlertCircle size={20} />, cls: 'stat-yellow', color: '#f59e0b', link: '/admin/pedidos' },
    { label: 'Ingresos totales',  value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: <DollarSign size={20} />, cls: 'stat-green', color: '#25d366', link: '/admin/pedidos' },
  ]

  return (
    <div className="admin-root" style={{ display: 'flex' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="adm-section-label">Panel de control</div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
                Dashboard
              </h1>
            </div>
            <Link href="/admin/productos/nuevo" className="adm-btn-primary" style={{ padding: '12px 22px', borderRadius: '12px', textDecoration: 'none' }}>
              <Package size={15} /> Nuevo producto
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <div className="adm-spinner" />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {statCards.map((s, i) => (
                  <Link key={i} href={s.link} style={{ textDecoration: 'none' }}>
                    <div className={`glass-card glass-card-hover stat-card-glow ${s.cls}`} style={{ padding: '24px' }}>
                      {/* Icon */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${s.color === '#c1692b' ? '193,105,43' : s.color === '#3b82f6' ? '59,130,246' : s.color === '#f59e0b' ? '245,158,11' : '37,211,102'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                          {s.icon}
                        </div>
                        <ArrowRight size={14} color="rgba(232,229,226,0.2)" />
                      </div>
                      <p style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: '800', color: '#fff', margin: '0 0 4px', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(232,229,226,0.5)', margin: 0 }}>{s.label}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Orders table + Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'start' }}>

                {/* Pedidos recientes */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>Pedidos recientes</h2>
                    <Link href="/admin/pedidos" style={{ fontSize: '12px', color: '#c1692b', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Ver todos <ArrowRight size={12} />
                    </Link>
                  </div>

                  {!stats?.recentOrders?.length ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(232,229,226,0.3)' }}>
                      <ShoppingBag size={36} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>No hay pedidos aún</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="adm-table">
                        <thead>
                          <tr>
                            {['#', 'Cliente', 'Total', 'Método', 'Estado', 'Fecha'].map(h => <th key={h}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map(o => {
                            const st = STATUS[o.status] || STATUS.pending
                            return (
                              <tr key={o.id}>
                                <td style={{ color: 'rgba(232,229,226,0.4)', fontWeight: '600', fontSize: '12px' }}>#{o.id}</td>
                                <td style={{ fontWeight: '600' }}>{o.customerName}</td>
                                <td style={{ color: '#c1692b', fontWeight: '800' }}>${o.total.toFixed(2)}</td>
                                <td style={{ color: 'rgba(232,229,226,0.55)', fontSize: '13px' }}>{o.paymentMethod}</td>
                                <td><span className={`adm-badge ${st.cls}`}>{st.icon} {st.label}</span></td>
                                <td style={{ color: 'rgba(232,229,226,0.4)', fontSize: '12px' }}>{new Date(o.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(232,229,226,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 16px' }}>Acciones rápidas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { href: '/admin/productos/nuevo', label: 'Agregar producto', icon: <Package size={15} />, color: '#c1692b' },
                        { href: '/admin/pedidos',         label: 'Ver pedidos',      icon: <ShoppingBag size={15} />, color: '#3b82f6' },
                        { href: '/admin/categorias',      label: 'Categorías',       icon: <Package size={15} />, color: '#f59e0b' },
                      ].map(a => (
                        <Link key={a.href} href={a.href} style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                          borderRadius: '12px', textDecoration: 'none', color: 'rgba(232,229,226,0.75)',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '13px', fontWeight: '600', transition: 'all .2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(232,229,226,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                          <span style={{ color: a.color }}>{a.icon}</span>
                          {a.label}
                          <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Store info */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-removebg-preview.png" alt="" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(232,229,226,0.35)', margin: '0 0 4px', lineHeight: '1.5' }}>Barcelona, Anzoátegui</p>
                    <p style={{ fontSize: '12px', color: 'rgba(232,229,226,0.35)', margin: 0 }}>0414-0906768</p>
                    <Link href="/" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '12px', color: '#c1692b', textDecoration: 'none', fontWeight: '700' }}>
                      Ver tienda en vivo <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
