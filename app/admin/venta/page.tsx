'use client'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { Store, Search, Plus, Minus, Trash2, ShoppingCart, AlertCircle, CheckCircle2, Package, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Prod { id: number; name: string; price: number; stock: number; category: string; images: string[] }
interface Line { productId: number; name: string; price: number; quantity: number; stock: number }
interface Toast { id: number; type: 'success' | 'error'; message: string }

const PAYMENTS = ['Efectivo', 'Pago Móvil', 'Zelle', 'Punto de venta', 'Transferencia']
const money = (n: number) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const inp: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', boxSizing: 'border-box',
}

export default function VentaTienda() {
  const [products, setProducts] = useState<Prod[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Line[]>([])
  const [payment, setPayment] = useState('Efectivo')
  const [customer, setCustomer] = useState('')
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId.current
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const r = await fetch('/api/products?all=true')
      if (r.ok) {
        const data = await r.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : products
    return list.slice(0, 40)
  }, [products, search])

  const inCart = (id: number) => cart.find(l => l.productId === id)

  const addToCart = (p: Prod) => {
    if (p.stock <= 0) { toast('error', `"${p.name}" está agotado`); return }
    setCart(c => {
      const ex = c.find(l => l.productId === p.id)
      if (ex) {
        if (ex.quantity >= p.stock) { toast('error', `Solo hay ${p.stock} de "${p.name}"`); return c }
        return c.map(l => l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l)
      }
      return [...c, { productId: p.id, name: p.name, price: p.price, quantity: 1, stock: p.stock }]
    })
  }
  const setQty = (id: number, qty: number) => setCart(c => c.map(l => l.productId === id ? { ...l, quantity: Math.max(1, Math.min(qty || 1, l.stock)) } : l))
  const setPrice = (id: number, price: number) => setCart(c => c.map(l => l.productId === id ? { ...l, price: Math.max(0, price) } : l))
  const removeLine = (id: number) => setCart(c => c.filter(l => l.productId !== id))

  const total = cart.reduce((s, l) => s + l.price * l.quantity, 0)
  const units = cart.reduce((s, l) => s + l.quantity, 0)

  const register = async () => {
    if (cart.length === 0) return
    setSaving(true)
    try {
      const r = await fetch('/api/sales', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(l => ({ productId: l.productId, quantity: l.quantity, price: l.price })),
          paymentMethod: payment,
          customerName: customer.trim() || undefined,
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { toast('error', d.error || 'No se pudo registrar la venta'); return }
      toast('success', `Venta registrada · ${money(total)}`)
      setCart([]); setCustomer(''); setSearch('')
      fetchProducts() // refrescar stock
    } catch { toast('error', 'Error de conexión') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '24px 28px 90px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .v-input:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .v-input option { background: #211f1e; color: #e8e5e2; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:900px){ .v-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 14, pointerEvents: 'auto', backdropFilter: 'blur(20px)', background: t.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)', border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`, maxWidth: 340, fontSize: 13, fontWeight: 600, color: t.type === 'success' ? '#86efac' : '#fca5a5' }}>
              {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}{t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={18} color="#34d399" strokeWidth={1.75} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Venta en tienda</h1>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>Registra ventas presenciales · descuenta stock y suma a reportes</p>
        </div>
      </div>

      <div className="v-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* ── Catálogo ── */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
            <Search size={16} color="rgba(148,163,184,0.5)" style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="v-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." style={{ ...inp, width: '100%', paddingLeft: 38 }} />
          </div>
          {loading ? (
            <div style={{ padding: 56, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
              <div style={{ width: 30, height: 30, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
              <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando productos...</p>
            </div>
          ) : (
            <div style={{ maxHeight: 560, overflowY: 'auto', padding: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
              {filtered.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(148,163,184,0.35)', padding: 30, fontSize: 13 }}>Sin resultados</p>
              ) : filtered.map(p => {
                const line = inCart(p.id)
                const out = p.stock <= 0
                return (
                  <button key={p.id} type="button" onClick={() => addToCart(p)} disabled={out}
                    style={{ textAlign: 'left', padding: 10, borderRadius: 12, cursor: out ? 'not-allowed' : 'pointer', background: line ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${line ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.07)'}`, opacity: out ? 0.45 : 1, position: 'relative' }}>
                    <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
                        : <Package size={22} color="rgba(148,163,184,0.3)" />}
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#f97316' }}>{money(p.price)}</span>
                      <span style={{ fontSize: 10, color: out ? '#f87171' : p.stock <= 5 ? '#fbbf24' : 'rgba(148,163,184,0.5)', fontFamily: 'var(--font-mono)' }}>{out ? 'agotado' : `stock ${p.stock}`}</span>
                    </div>
                    {line && <span style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#34d399', color: '#04120b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{line.quantity}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Carrito / venta ── */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 48px)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={16} color="#34d399" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Venta actual</span>
            {units > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>{units} u.</span>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: cart.length ? 12 : 0 }}>
            {cart.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'rgba(148,163,184,0.3)' }}>
                <ShoppingCart size={30} strokeWidth={1.2} style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: 13 }}>Toca un producto para agregarlo</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cart.map(l => (
                  <div key={l.productId} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>{l.name}</span>
                      <button type="button" onClick={() => removeLine(l.productId)} style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Trash2 size={12} /></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Cantidad */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                        <button type="button" onClick={() => setQty(l.productId, l.quantity - 1)} style={{ width: 26, height: 30, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', cursor: 'pointer' }}><Minus size={12} /></button>
                        <input className="v-input" type="number" min={1} max={l.stock} value={l.quantity} onChange={e => setQty(l.productId, parseInt(e.target.value))} style={{ ...inp, width: 42, textAlign: 'center', padding: '6px 2px', border: 'none', borderRadius: 0 }} />
                        <button type="button" onClick={() => setQty(l.productId, l.quantity + 1)} disabled={l.quantity >= l.stock} style={{ width: 26, height: 30, border: 'none', background: 'rgba(255,255,255,0.05)', color: l.quantity >= l.stock ? 'rgba(148,163,184,0.3)' : '#e2e8f0', cursor: l.quantity >= l.stock ? 'not-allowed' : 'pointer' }}><Plus size={12} /></button>
                      </div>
                      <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12 }}>×</span>
                      {/* Precio editable */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <span style={{ color: '#f97316', fontSize: 13, fontWeight: 700 }}>$</span>
                        <input className="v-input" type="number" step="0.01" min={0} value={l.price} onChange={e => setPrice(l.productId, parseFloat(e.target.value))} style={{ ...inp, width: '100%', padding: '6px 8px' }} title="Precio (editable)" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', minWidth: 60, textAlign: 'right' }}>{money(l.price * l.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie: total + registrar */}
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select className="v-input" value={payment} onChange={e => setPayment(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {PAYMENTS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input className="v-input" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Cliente (opcional)" style={inp} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>Total</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#34d399', letterSpacing: '-1px' }}>{money(total)}</span>
            </div>
            <button type="button" onClick={register} disabled={saving || cart.length === 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: saving || cart.length === 0 ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg,#34d399,#059669)', color: saving || cart.length === 0 ? 'rgba(255,255,255,0.7)' : '#04120b', border: 'none', cursor: saving || cart.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'inherit' }}>
              <Check size={17} /> {saving ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
