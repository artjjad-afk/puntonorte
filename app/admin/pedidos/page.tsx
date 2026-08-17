'use client'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Clock, CheckCircle, XCircle, TrendingUp, ShoppingBag, MessageCircle, ChevronDown } from 'lucide-react'
import { formatWAPhone } from '@/lib/config'

interface Order {
  id: number; customerName: string; customerPhone: string
  address: string; city: string; notes: string | null
  paymentMethod: string; items: Array<{ product: { name: string }; quantity: number; selectedSize?: string; selectedColor?: string }>
  total: number; status: string; createdAt: string
}

const STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  cls: 'adm-badge-yellow', icon: <Clock size={11} /> },
  confirmed: { label: 'Confirmado', cls: 'adm-badge-green',  icon: <CheckCircle size={11} /> },
  shipped:   { label: 'Enviado',    cls: 'adm-badge-blue',   icon: <TrendingUp size={11} /> },
  delivered: { label: 'Entregado',  cls: 'adm-badge-green',  icon: <CheckCircle size={11} /> },
  cancelled: { label: 'Cancelado',  cls: 'adm-badge-red',    icon: <XCircle size={11} /> },
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchOrders()
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="admin-root" style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div className="adm-section-label">Gestión</div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Pedidos</h1>
            <p style={{ color: 'rgba(232,229,226,0.35)', margin: 0, fontSize: '13px' }}>{orders.length} pedidos en total</p>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[['all', 'Todos', orders.length], ...Object.entries(STATUS).map(([k, v]) => [k, v.label, orders.filter(o => o.status === k).length])].map(([key, label, count]) => (
              <button key={String(key)} onClick={() => setFilter(String(key))} style={{
                padding: '7px 16px', borderRadius: '100px', cursor: 'pointer', fontSize: '12px',
                fontWeight: '600', transition: 'all .2s', fontFamily: 'Arial,sans-serif',
                border: filter === key ? '1px solid rgba(193,105,43,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: filter === key ? 'rgba(193,105,43,0.15)' : 'rgba(255,255,255,0.03)',
                color: filter === key ? '#c1692b' : 'rgba(232,229,226,0.5)',
              }}>
                {String(label)} ({count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="glass-card" style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'rgba(232,229,226,0.3)' }}>
              <div className="adm-spinner" />
              <p style={{ margin: 0, fontSize: '14px' }}>Cargando pedidos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '64px', textAlign: 'center', color: 'rgba(232,229,226,0.3)' }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(232,229,226,0.5)', margin: '0 0 6px' }}>Sin pedidos</p>
              <p style={{ margin: 0, fontSize: '13px' }}>Los pedidos aparecerán aquí cuando los clientes compren</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map(order => {
                const st = STATUS[order.status] || STATUS.pending
                const isExpanded = expanded === order.id
                return (
                  <div key={order.id} className="glass-card" style={{ overflow: 'hidden', transition: 'all .2s' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 22px', cursor: 'pointer', flexWrap: 'wrap' }}
                      onClick={() => setExpanded(isExpanded ? null : order.id)}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(232,229,226,0.3)', minWidth: '36px' }}>#{order.id}</span>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '15px' }}>{order.customerName}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(232,229,226,0.4)' }}>{order.city} · {order.paymentMethod}</p>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#c1692b', letterSpacing: '-0.5px' }}>${order.total.toFixed(2)}</span>
                      <span className={`adm-badge ${st.cls}`}>{st.icon} {st.label}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(232,229,226,0.3)' }}>{new Date(order.createdAt).toLocaleDateString('es-VE')}</span>
                      <ChevronDown size={16} color="rgba(232,229,226,0.3)" style={{ transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 22px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(232,229,226,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Datos del cliente</p>
                            {[
                              ['Teléfono', order.customerPhone],
                              ['Dirección', order.address],
                              ['Ciudad', order.city],
                              ...(order.notes ? [['Notas', order.notes]] : []),
                            ].map(([k, v]) => (
                              <p key={k} style={{ margin: '0 0 5px', fontSize: '13px', color: 'rgba(232,229,226,0.7)' }}>
                                <span style={{ color: 'rgba(232,229,226,0.35)' }}>{k}:</span> {v}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(232,229,226,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Productos</p>
                            {order.items.map((item, i) => (
                              <p key={i} style={{ margin: '0 0 5px', fontSize: '13px', color: 'rgba(232,229,226,0.7)' }}>
                                · {item.product?.name || 'Producto'} ×{item.quantity}
                                {item.selectedSize && <span style={{ color: 'rgba(232,229,226,0.4)' }}> | {item.selectedSize}</span>}
                                {item.selectedColor && <span style={{ color: 'rgba(232,229,226,0.4)' }}> | {item.selectedColor}</span>}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Status + WA */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(232,229,226,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: '4px' }}>Estado:</span>
                          {Object.entries(STATUS).map(([key, val]) => (
                            <button key={key} onClick={() => updateStatus(order.id, key)}
                              className={`adm-badge ${order.status === key ? val.cls : 'adm-badge-gray'}`}
                              style={{ cursor: 'pointer', border: 'none', fontFamily: 'Arial, sans-serif', fontSize: '11px', opacity: order.status === key ? 1 : 0.6, transition: 'opacity .2s' }}>
                              {val.icon} {val.label}
                            </button>
                          ))}
                          <a href={`https://wa.me/${formatWAPhone(order.customerPhone)}?text=${encodeURIComponent(`Hola ${order.customerName}, tu pedido #${order.id} está listo.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', color: '#4ade80', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}>
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
