'use client'
import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, FileSpreadsheet, Printer, DollarSign, ShoppingBag, Boxes, Package, TrendingUp, Wallet, AlertTriangle } from 'lucide-react'
import {
  getRange, paidOrdersInRange, aggregate, inventorySummary, money,
  type Preset, type ReportOrder, type ReportProduct,
} from '@/lib/reports'

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'anio', label: 'Este año' },
  { id: 'todo', label: 'Todo' },
]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
}
const fmtDate = (d: Date) => d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function ReportesPage() {
  const [orders, setOrders] = useState<ReportOrder[]>([])
  const [products, setProducts] = useState<ReportProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState<Preset>('mes')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.ok ? r.json() : []),
      fetch('/api/products?all=true').then(r => r.ok ? r.json() : []),
    ]).then(([o, p]) => {
      setOrders(Array.isArray(o) ? o : [])
      setProducts(Array.isArray(p) ? p : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const { agg, inv, paidOrders, periodoLabel, fileTag } = useMemo(() => {
    const range = getRange(preset, from, to)
    const paidOrders = paidOrdersInRange(orders, range.from, range.to)
    const agg = aggregate(paidOrders, products, range.from, range.to)
    const inv = inventorySummary(products)
    const periodoLabel = preset === 'todo'
      ? 'Todo el tiempo'
      : range.from && range.to
        ? `${fmtDate(range.from)} – ${fmtDate(range.to)}`
        : 'Periodo sin definir'
    const fileTag = preset === 'custom' && from && to ? `${from}_a_${to}` : preset
    return { agg, inv, paidOrders, periodoLabel, fileTag }
  }, [orders, products, preset, from, to])

  /* ── Exportar a Excel ── */
  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const resumen = [
      ['PUNTO NORTE — Reporte'],
      ['Periodo', periodoLabel],
      [],
      ['INGRESOS GENERADOS', agg.ingresos],
      ['Pedidos', agg.pedidos],
      ['Ticket promedio', Number(agg.ticket.toFixed(2))],
      ['Unidades vendidas', agg.unidades],
      [],
      ['INVENTARIO ACTUAL (a precio de venta)'],
      ['Valor de inventario', inv.valorVenta],
      ['Unidades en stock', inv.unidades],
      ['Productos', inv.totalProductos],
      ['Agotados', inv.agotados],
      ['Bajo stock (≤5)', inv.bajoStock],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agg.porProducto.map(r => ({ Producto: r.name, Unidades: r.units, Ingresos: Number(r.revenue.toFixed(2)) }))), 'Ventas por producto')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agg.porCategoria.map(r => ({ Categoria: r.name, Unidades: r.units, Ingresos: Number(r.revenue.toFixed(2)) }))), 'Ventas por categoria')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agg.porMetodo.map(r => ({ Metodo: r.metodo, Pedidos: r.pedidos, Monto: Number(r.monto.toFixed(2)) }))), 'Metodos de pago')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inv.filas.map(r => ({ Producto: r.name, Categoria: r.category, Stock: r.stock, 'Precio venta': r.price, 'Valor (venta)': Number(r.value.toFixed(2)) }))), 'Inventario')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paidOrders.map(o => ({ '#': o.id, Fecha: new Date(o.createdAt).toLocaleDateString('es-VE'), Cliente: o.customerName, Metodo: o.paymentMethod, Estado: o.status, Total: Number((o.total || 0).toFixed(2)) }))), 'Pedidos')
    XLSX.writeFile(wb, `reporte-puntonorte-${fileTag}.xlsx`)
  }

  /* ── Exportar a PDF (ventana de impresión con tema claro) ── */
  const exportPDF = () => {
    const w = window.open('', '_blank')
    if (!w) { alert('Permite las ventanas emergentes para generar el PDF.'); return }
    const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
    const tbl = (headers: string[], rows: string[][]) =>
      `<table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 0 ? 'l' : 'r'}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    const kpi = (label: string, value: string) => `<div class="kpi"><span class="kl">${esc(label)}</span><span class="kv">${esc(value)}</span></div>`
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte Punto Norte</title>
<style>
  *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;margin:32px;font-size:12px}
  h1{font-size:20px;margin:0 0 2px} h2{font-size:14px;margin:26px 0 8px;border-bottom:2px solid #f97316;padding-bottom:4px;color:#c1692b}
  .sub{color:#6b7280;margin:0 0 18px;font-size:12px}
  .kpis{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px}
  .kpi{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;min-width:150px}
  .kl{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280}
  .kv{display:block;font-size:18px;font-weight:800;color:#111827;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-top:4px} th,td{border:1px solid #e5e7eb;padding:6px 9px;font-size:11px}
  th{background:#f9fafb;text-align:left;color:#374151} td.r{text-align:right} td.l{text-align:left}
  .note{color:#9ca3af;font-size:10px;margin-top:4px}
  @media print{body{margin:12mm}}
</style></head><body>
  <h1>PUNTO NORTE — Reporte</h1>
  <p class="sub">Periodo: ${esc(periodoLabel)} · Generado el ${esc(new Date().toLocaleDateString('es-VE'))}</p>
  <div class="kpis">
    ${kpi('Ingresos generados', money(agg.ingresos))}
    ${kpi('Pedidos', String(agg.pedidos))}
    ${kpi('Ticket promedio', money(agg.ticket))}
    ${kpi('Unidades vendidas', String(agg.unidades))}
    ${kpi('Valor inventario (venta)', money(inv.valorVenta))}
  </div>
  <p class="note">El valor de inventario es a precio de venta.</p>
  <h2>Ventas por producto</h2>
  ${tbl(['Producto', 'Unidades', 'Ingresos'], agg.porProducto.map(r => [r.name, String(r.units), money(r.revenue)]))}
  <h2>Ventas por categoría</h2>
  ${tbl(['Categoría', 'Unidades', 'Ingresos'], agg.porCategoria.map(r => [r.name, String(r.units), money(r.revenue)]))}
  <h2>Métodos de pago</h2>
  ${tbl(['Método', 'Pedidos', 'Monto'], agg.porMetodo.map(r => [r.metodo, String(r.pedidos), money(r.monto)]))}
  <h2>Inventario actual</h2>
  ${tbl(['Producto', 'Categoría', 'Stock', 'Valor (venta)'], inv.filas.map(r => [r.name, r.category, String(r.stock), money(r.value)]))}
  <script>window.onload=function(){window.print()}</script>
</body></html>`
    w.document.write(html)
    w.document.close()
  }

  const kpis = [
    { label: 'Ingresos generados', value: money(agg.ingresos), icon: DollarSign, color: '#f97316', hint: `${agg.pedidos} pedidos` },
    { label: 'Ticket promedio', value: money(agg.ticket), icon: TrendingUp, color: '#4ade80', hint: 'por pedido' },
    { label: 'Unidades vendidas', value: String(agg.unidades), icon: ShoppingBag, color: '#60a5fa', hint: 'en el periodo' },
    { label: 'Valor inventario', value: money(inv.valorVenta), icon: Wallet, color: '#a78bfa', hint: 'a precio de venta' },
    { label: 'Unidades en stock', value: String(inv.unidades), icon: Boxes, color: '#fbbf24', hint: `${inv.agotados} agotados · ${inv.bajoStock} bajo stock` },
  ]

  return (
    <div style={{ padding: '24px 28px 90px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rep-tbl { width: 100%; border-collapse: collapse; }
        .rep-tbl th { text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(148,163,184,0.6); padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); }
        .rep-tbl td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .rep-tbl tr:hover td { background: rgba(255,255,255,0.02); }
        .rep-r { text-align: right; font-variant-numeric: tabular-nums; }
        .rep-date { padding: 8px 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #e2e8f0; font-size: 12px; font-family: inherit; outline: none; }
        @media(max-width:900px){ .rep-two { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={18} color="#f97316" strokeWidth={1.75} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Reportes</h1>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>{periodoLabel}</p>
        </div>
      </div>

      {/* Barra de filtros + exportar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => setPreset(p.id)}
              style={{ padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + (preset === p.id ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.1)'), background: preset === p.id ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.05)', color: preset === p.id ? '#f97316' : 'rgba(148,163,184,0.75)' }}>
              {p.label}
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPreset('custom') }} className="rep-date" />
            <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: 12 }}>a</span>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setPreset('custom') }} className="rep-date" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={exportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 80, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
          <div style={{ width: 34, height: 34, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
          <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            {kpis.map((k, i) => {
              const Icon = k.icon
              return (
                <div key={i} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}22`, border: `1px solid ${k.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={k.color} strokeWidth={1.9} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.55)', fontFamily: 'var(--font-mono)' }}>{k.label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 25, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{k.value}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.45)' }}>{k.hint}</p>
                </div>
              )
            })}
          </div>

          {/* Gráfica de ventas */}
          <div style={{ ...card, marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'var(--font-mono)' }}>Ventas en el tiempo</p>
            {agg.serie.length > 0 ? (
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={agg.serie} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => '$' + v} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,20,33,0.98)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10 }}
                      labelStyle={{ color: 'rgba(148,163,184,0.7)' }}
                      formatter={(v) => [money(Number(v)), 'Ingresos'] as [string, string]}
                    />
                    <Area type="monotone" dataKey="ingresos" stroke="#f97316" strokeWidth={2} fill="url(#repGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(148,163,184,0.3)', fontSize: 13, margin: 0 }}>Sin ventas en este periodo</p>
            )}
          </div>

          {/* Tablas: por producto + por categoría */}
          <div className="rep-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ ...card, padding: 0 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, padding: '16px 18px', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Ventas por producto</p>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="rep-tbl">
                  <thead><tr><th>Producto</th><th className="rep-r">Uds.</th><th className="rep-r">Ingresos</th></tr></thead>
                  <tbody>
                    {agg.porProducto.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'rgba(148,163,184,0.3)', padding: 28 }}>Sin ventas</td></tr>
                      : agg.porProducto.map((r, i) => (
                        <tr key={i}><td style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</td><td className="rep-r" style={{ color: 'rgba(148,163,184,0.8)' }}>{r.units}</td><td className="rep-r" style={{ color: '#f97316', fontWeight: 700 }}>{money(r.revenue)}</td></tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ ...card, padding: 0 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, padding: '16px 18px', fontFamily: 'var(--font-mono)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Ventas por categoría</p>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="rep-tbl">
                  <thead><tr><th>Categoría</th><th className="rep-r">Uds.</th><th className="rep-r">Ingresos</th></tr></thead>
                  <tbody>
                    {agg.porCategoria.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'rgba(148,163,184,0.3)', padding: 28 }}>Sin ventas</td></tr>
                      : agg.porCategoria.map((r, i) => (
                        <tr key={i}><td style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</td><td className="rep-r" style={{ color: 'rgba(148,163,184,0.8)' }}>{r.units}</td><td className="rep-r" style={{ color: '#f97316', fontWeight: 700 }}>{money(r.revenue)}</td></tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div style={{ ...card, padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={13} color="#a78bfa" /> Inventario actual
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>
                {inv.totalProductos} productos · <b style={{ color: '#a78bfa' }}>{money(inv.valorVenta)}</b> a precio de venta
                {inv.agotados > 0 && <span style={{ color: '#f87171', marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={12} /> {inv.agotados} agotado(s)</span>}
              </p>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table className="rep-tbl">
                <thead><tr><th>Producto</th><th>Categoría</th><th className="rep-r">Stock</th><th className="rep-r">Precio</th><th className="rep-r">Valor (venta)</th></tr></thead>
                <tbody>
                  {inv.filas.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: 'rgba(148,163,184,0.6)', fontSize: 12 }}>{r.category}</td>
                      <td className="rep-r" style={{ color: r.stock === 0 ? '#f87171' : r.stock <= 5 ? '#fbbf24' : 'rgba(148,163,184,0.85)', fontWeight: 700 }}>{r.stock}</td>
                      <td className="rep-r" style={{ color: 'rgba(148,163,184,0.7)' }}>{money(r.price)}</td>
                      <td className="rep-r" style={{ color: '#e2e8f0', fontWeight: 700 }}>{money(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ margin: '18px 2px 0', fontSize: 11, color: 'rgba(148,163,184,0.35)', fontFamily: 'var(--font-mono)' }}>
            Ingresos = pedidos confirmados/enviados/entregados. El valor de inventario es a precio de venta (sin costo de compra).
          </p>
        </>
      )}
    </div>
  )
}
