'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff, Pencil, X, Check, Upload, Link as LinkIcon, Zap, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Banner {
  id: number
  etiqueta: string | null
  titulo: string
  subtitulo: string | null
  descripcion: string | null
  linkUrl: string
  linkTexto: string
  imagen: string | null
  precioDesde: number | null
  active: boolean
  orden: number
}

interface Category { slug: string; name: string }
interface Product  { slug: string; name: string }

type DestType = 'tienda' | 'categoria' | 'producto' | 'custom'

const empty = {
  etiqueta: '', titulo: '', subtitulo: '', descripcion: '',
  linkUrl: '', linkTexto: '', precioDesde: '', orden: '0',
  imagen: '', imageData: null as string | null,
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
  transition: 'border-color .2s', boxSizing: 'border-box' as const,
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(148,163,184,0.6)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'var(--font-mono)',
}
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16, padding: 24, position: 'relative',
}

export default function AdminBanners() {
  const [banners, setBanners]   = useState<Banner[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [imgMode, setImgMode]   = useState<'upload' | 'url'>('url')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm]         = useState(empty)

  // Selector de destino
  const [destType, setDestType]   = useState<DestType>('tienda')
  const [destCat, setDestCat]     = useState('')
  const [destProd, setDestProd]   = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts]   = useState<Product[]>([])

  // Calcula la URL según la selección
  const computedUrl = (): string => {
    if (destType === 'tienda')    return '/tienda'
    if (destType === 'categoria') return destCat ? `/tienda?cat=${destCat}` : ''
    if (destType === 'producto')  return destProd ? `/tienda/${destProd}` : ''
    return form.linkUrl // custom
  }

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/banners?all=true')
      if (res.ok) {
        const data = await res.json()
        setBanners(Array.isArray(data) ? data : [])
      }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchBanners()
    // Cargar categorías y productos para el selector
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.map((p: { slug: string; name: string }) => ({ slug: p.slug, name: p.name })) : []))
      .catch(() => {})
  }, [])

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2_097_152) { reject(new Error('Imagen mayor a 2MB')); return }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo imágenes'); return }
    try {
      const b64 = await fileToBase64(file)
      setForm(f => ({ ...f, imageData: b64, imagen: '' }))
      setError('')
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }, [fileToBase64])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    const finalUrl = computedUrl()
    if (!finalUrl) { setError('Selecciona el destino del botón'); return }
    if (!form.linkTexto.trim()) { setError('El texto del botón es requerido'); return }

    setSaving(true); setError('')
    try {
      const url    = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, linkUrl: finalUrl, precioDesde: form.precioDesde || null }),
      })
      if (res.ok) {
        setForm(empty); setEditingId(null); setImgMode('url')
        setDestType('tienda'); setDestCat(''); setDestProd('')
        fetchBanners()
      } else {
        const d = await res.json(); setError(d.error || 'Error al guardar')
      }
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  const startEdit = (b: Banner) => {
    setEditingId(b.id)
    setForm({
      etiqueta: b.etiqueta || '', titulo: b.titulo, subtitulo: b.subtitulo || '',
      descripcion: b.descripcion || '', linkUrl: b.linkUrl, linkTexto: b.linkTexto,
      precioDesde: b.precioDesde ? String(b.precioDesde) : '',
      orden: String(b.orden), imagen: b.imagen || '', imageData: null,
    })
    setImgMode('url')
    // Detectar tipo de URL para mostrar el selector correcto
    if (b.linkUrl === '/tienda') {
      setDestType('tienda')
    } else if (b.linkUrl.startsWith('/tienda?cat=')) {
      setDestType('categoria')
      setDestCat(b.linkUrl.replace('/tienda?cat=', ''))
    } else if (b.linkUrl.startsWith('/tienda/')) {
      setDestType('producto')
      setDestProd(b.linkUrl.replace('/tienda/', ''))
    } else {
      setDestType('custom')
    }
  }

  const handleToggle = async (b: Banner) => {
    try {
      await fetch(`/api/banners/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !b.active }) })
      fetchBanners()
    } catch { alert('No se pudo actualizar') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este banner?')) return
    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      fetchBanners()
    } catch { alert('No se pudo eliminar') }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .bn-inp:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={19} color="#f97316" strokeWidth={1.75} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Banners promocionales</h1>
          <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>
            Gestiona el banner de la página principal
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Formulario */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={card}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)', borderRadius: '16px 16px 0 0' }} />

          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} color="#f97316" /> {editingId ? 'Editando banner' : 'Nuevo banner'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Etiqueta pequeña</label>
                <input className="bn-inp" value={form.etiqueta} onChange={e => set('etiqueta', e.target.value)} placeholder="Ej: Fragrancias" style={inp} />
              </div>
              <div>
                <label style={lbl}>Precio desde (opcional)</label>
                <input className="bn-inp" type="number" step="0.01" min="0" value={form.precioDesde} onChange={e => set('precioDesde', e.target.value)} placeholder="28.00" style={inp} />
              </div>
            </div>

            <div>
              <label style={lbl}>Título principal *</label>
              <input className="bn-inp" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Perfumes" style={inp} />
            </div>

            <div>
              <label style={lbl}>Subtítulo</label>
              <input className="bn-inp" value={form.subtitulo} onChange={e => set('subtitulo', e.target.value)} placeholder="Ej: Premium hasta 20% OFF" style={inp} />
            </div>

            <div>
              <label style={lbl}>Descripción</label>
              <textarea className="bn-inp" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} placeholder="Texto descriptivo..." style={{ ...inp, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>¿A dónde lleva el botón? *</label>
                {/* Selector visual de destino */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {([
                    ['tienda',    '🛍️ Toda la tienda'],
                    ['categoria', '🏷️ Una categoría'],
                    ['producto',  '📦 Un producto'],
                    ['custom',    '🔗 URL personalizada'],
                  ] as [DestType, string][]).map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setDestType(val)}
                      style={{ padding: '8px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', textAlign: 'left', background: destType === val ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', color: destType === val ? '#f97316' : 'rgba(148,163,184,0.7)', outline: destType === val ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)', transition: 'all .15s' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Sub-selector según tipo */}
                {destType === 'categoria' && (
                  <div style={{ position: 'relative' }}>
                    <select className="bn-inp" value={destCat} onChange={e => setDestCat(e.target.value)}
                      style={{ ...inp, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                      <option value="">— Elige una categoría —</option>
                      {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(148,163,184,0.5)' }} />
                  </div>
                )}

                {destType === 'producto' && (
                  <div style={{ position: 'relative' }}>
                    <select className="bn-inp" value={destProd} onChange={e => setDestProd(e.target.value)}
                      style={{ ...inp, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                      <option value="">— Elige un producto —</option>
                      {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(148,163,184,0.5)' }} />
                  </div>
                )}

                {destType === 'custom' && (
                  <input className="bn-inp" value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)}
                    placeholder="https://... o /ruta/interna" style={inp} />
                )}

                {/* Preview URL generada */}
                {destType !== 'custom' && computedUrl() && (
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>
                    URL: {computedUrl()}
                  </p>
                )}
              </div>
              <div>
                <label style={lbl}>Texto del botón *</label>
                <input className="bn-inp" value={form.linkTexto} onChange={e => set('linkTexto', e.target.value)} placeholder="Ver perfumes →" style={inp} />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Imagen lateral</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['url', 'upload'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setImgMode(mode)}
                      style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-mono)', background: imgMode === mode ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)', color: imgMode === mode ? '#f97316' : 'rgba(148,163,184,0.5)' }}>
                      {mode === 'url' ? <><LinkIcon size={9} style={{ display: 'inline', marginRight: 3 }} />URL</> : <><Upload size={9} style={{ display: 'inline', marginRight: 3 }} />SUBIR</>}
                    </button>
                  ))}
                </div>
              </div>

              {imgMode === 'url' ? (
                <>
                  <input className="bn-inp" value={form.imagen} onChange={e => set('imagen', e.target.value)} placeholder="https://..." style={inp} />
                  {form.imagen && !form.imagen.startsWith('data:') && (
                    <div style={{ marginTop: 8, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${dragging ? 'rgba(249,115,22,0.7)' : form.imageData ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: form.imageData ? 0 : '16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all .2s', overflow: 'hidden' }}
                >
                  {form.imageData ? (
                    <div style={{ position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.imageData} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, imageData: null })) }}
                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={18} color={dragging ? '#f97316' : 'rgba(148,163,184,0.35)'} style={{ margin: '0 auto 6px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>{dragging ? 'Suelta aquí' : 'Arrastra o haz clic'}</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
              <div>
                <label style={lbl}>Orden</label>
                <input className="bn-inp" type="number" min="0" value={form.orden} onChange={e => set('orden', e.target.value)} style={inp} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: '#f87171', fontSize: 12, margin: 0, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 11, background: saving ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg,#f97316,#c1692b)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', boxShadow: saving ? 'none' : '0 4px 16px rgba(249,115,22,0.3)' }}>
                {saving ? 'Guardando...' : (editingId ? <><Check size={14} /> Guardar cambios</> : <><Plus size={14} /> Crear banner</>)}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(empty); setImgMode('url') }}
                  style={{ padding: '11px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Lista de banners */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} style={card}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.2),transparent)', borderRadius: '16px 16px 0 0' }} />

          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>
            Banners activos
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>{banners.length}</span>
          </h2>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 10px', animation: 'spin .8s linear infinite' }} />
              <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Cargando...</p>
            </div>
          ) : banners.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(148,163,184,0.3)' }}>
              <Zap size={32} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>Sin banners</p>
              <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Crea el primer banner con el formulario</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Preview imagen */}
                  {b.imagen && (
                    <div style={{ height: 80, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    {b.etiqueta && <p style={{ margin: '0 0 2px', fontSize: 10, color: '#f97316', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{b.etiqueta}</p>}
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{b.titulo}</p>
                    {b.subtitulo && <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>{b.subtitulo}</p>}
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>{b.linkUrl}</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: b.active ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.08)', color: b.active ? '#22c55e' : 'rgba(148,163,184,0.5)', border: `1px solid ${b.active ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.15)'}` }}>
                        {b.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                        <button onClick={() => startEdit(b)} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', cursor: 'pointer' }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleToggle(b)} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: 'rgba(148,163,184,0.6)', cursor: 'pointer' }}>
                          {b.active ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => handleDelete(b.id)} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
