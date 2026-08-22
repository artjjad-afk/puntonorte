'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  Clock, CheckCircle, XCircle, TrendingUp,
  ShoppingBag, MessageCircle, ChevronDown,
  MapPin, CreditCard, Package, Phone,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { formatWAPhone } from '@/lib/config'

interface Order {
  id: number
  customerName: string
  customerPhone: string
  address: string
  city: string
  notes: string | null
  paymentMethod: string
  items: Array<{ product: { name: string; price: number }; quantity: number; selectedSize?: string; selectedColor?: string }>
  total: number
  status: string
  createdAt: string
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmado', color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)',  icon: <CheckCircle size={12} /> },
  shipped:   { label: 'Enviado',    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)',  icon: <TrendingUp size={12} /> },
  delivered: { label: 'Entregado',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)',  icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)', icon: <XCircle size={12} /> },
}

export default function AdminPedidos() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch]     = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      fetchOrders()
    } catch { alert('No se pudo actualizar el estado.') }
  }

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter(o => o.status === filter)
    if (search) list = list.filter(o =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      String(o.id).includes(search)
    )
    return list
  }, [orders, filter, search])

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length }
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1
    return c
  }, [orders])

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .ord-row { transition: background .18s; }
        .ord-row:hover { background: rgba(255,255,255,0.02); }
        .ord-input:focus { border-color: rgba(249,115,22,0.5) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={19} color="#60a5fa" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Pedidos</h1>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>
              {orders.length} pedidos · {statusCounts['pending'] ?? 0} pendientes
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative' }}>
          <input
            className="ord-input"
            type="text"
            placeholder="Buscar cliente, teléfono o #ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13, outline: 'none', width: 260, fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all', 'Todos'], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([key, label]) => {
          const st = STATUS[key]
          const count = statusCounts[key] ?? 0
          const active = filter === key
          return (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: 'none', fontFamily: 'var(--font-display)',
              background: active ? (st ? st.bg : 'rgba(249,115,22,0.15)') : 'rgba(255,255,255,0.05)',
              color: active ? (st ? st.color : '#f97316') : 'rgba(148,163,184,0.6)',
              outline: active ? `1px solid ${st ? st.border : 'rgba(249,115,22,0.35)'}` : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {st && active && st.icon}
              {label}
              <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(96,165,250,0.3)', borderTopColor: '#60a5fa', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
          <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando pedidos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'rgba(148,163,184,0.3)', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
          <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>Sin pedidos</p>
          <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {search ? `Sin resultados para "${search}"` : 'Los pedidos aparecerán cuando los clientes compren'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((order, i) => {
            const st  = STATUS[order.status] || STATUS.pending
            const exp = expanded === order.id

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${exp ? st.border : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .25s' }}
              >
                {/* ── Fila principal ── */}
                <div
                  className="ord-row"
                  onClick={() => setExpanded(exp ? null : order.id)}
                  style={{ display: 'grid', gridTemplateColumns: '44px 1fr 90px 110px 90px 28px', gap: 12, padding: '14px 18px', cursor: 'pointer', alignItems: 'center' }}
                >
                  {/* ID */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(100,116,139,0.6)', fontFamily: 'var(--font-mono)' }}>
                    #{order.id}
                  </span>

                  {/* Cliente */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customerName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.45)', fontFamily: 'var(--font-mono)' }}>
                      {order.city} · {order.paymentMethod}
                    </p>
                  </div>

                  {/* Total */}
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#f97316', fontFamily: 'var(--font-mono)', filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.35))' }}>
                    ${order.total.toFixed(2)}
                  </span>

                  {/* Estado */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, width: 'fit-content' }}>
                    {st.icon} {st.label}
                  </span>

                  {/* Fecha */}
                  <span style={{ fontSize: 11, color: 'rgba(100,116,139,0.55)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(order.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
                  </span>

                  {/* Chevron */}
                  <motion.div animate={{ rotate: exp ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} color="rgba(148,163,184,0.4)" />
                  </motion.div>
                </div>

                {/* ── Panel expandido ── */}
                <AnimatePresence>
                  {exp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '18px 18px 16px', background: 'rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

                          {/* Datos del cliente */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-mono)' }}>
                              Cliente
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
                                <Phone size={11} color="#60a5fa" /> {order.customerPhone}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
                                <MapPin size={11} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>{order.address}, {order.city}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
                                <CreditCard size={11} color="#fbbf24" /> {order.paymentMethod}
                              </div>
                              {order.notes && (
                                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.5)', fontStyle: 'italic', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 8px' }}>
                                  📝 {order.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Productos */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-mono)' }}>
                              Productos ({order.items.length})
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {order.items.map((item, j) => (
                                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                                  <span style={{ color: 'rgba(148,163,184,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    <Package size={10} style={{ display: 'inline', marginRight: 4 }} />
                                    {item.product?.name} ×{item.quantity}
                                    {item.selectedSize && <span style={{ color: 'rgba(148,163,184,0.4)', marginLeft: 4 }}>· {item.selectedSize}</span>}
                                    {item.selectedColor && <span style={{ color: 'rgba(148,163,184,0.4)', marginLeft: 4 }}>· {item.selectedColor}</span>}
                                  </span>
                                  <span style={{ color: '#f97316', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
                                <span style={{ color: 'rgba(148,163,184,0.6)' }}>Total</span>
                                <span style={{ color: '#f97316', fontFamily: 'var(--font-mono)' }}>${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cambiar estado */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-mono)' }}>
                              Cambiar estado
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {Object.entries(STATUS).map(([key, val]) => (
                                <button key={key} onClick={() => updateStatus(order.id, key)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, border: `1px solid ${order.status === key ? val.border : 'rgba(255,255,255,0.07)'}`, background: order.status === key ? val.bg : 'rgba(255,255,255,0.03)', color: order.status === key ? val.color : 'rgba(148,163,184,0.55)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: order.status === key ? 700 : 500, transition: 'all .18s' }}>
                                  {val.icon} {val.label}
                                  {order.status === key && <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>✓ Actual</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Botón WhatsApp */}
                        <a
                          href={`https://wa.me/${formatWAPhone(order.customerPhone)}?text=${encodeURIComponent(`Hola ${order.customerName}, tu pedido #${order.id} está en proceso. ¿Tienes alguna consulta?`)}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
                        >
                          <MessageCircle size={14} /> Contactar por WhatsApp
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
