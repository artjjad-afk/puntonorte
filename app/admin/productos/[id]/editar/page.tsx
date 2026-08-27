'use client'
import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, X, Upload, Link as LinkIcon, Zap, Package, Save, ClipboardList, Image as ImageIcon, Palette, Settings, AlertTriangle, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

const BADGES = ['', 'Nuevo', 'Oferta', 'Premium', 'Agotado']

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

export default function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fetching, setFetching]   = useState(true)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([])
  const [imgMode, setImgMode]     = useState<'upload' | 'url'>('upload')
  const [imgUrl, setImgUrl]       = useState('')
  const [dragging, setDragging]   = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [form, setForm] = useState({
    name: '', price: '', originalPrice: '',
    category: '', description: '', badge: '',
    stock: '0',
    featured: false, active: true,
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  })

  /* Cargar categorías y producto */
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
  }, [])

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(p => {
        setForm({
          name:          p.name        || '',
          price:         String(p.price || ''),
          originalPrice: p.originalPrice ? String(p.originalPrice) : '',
          category:      p.category    || '',
          description:   p.description || '',
          badge:         p.badge       || '',
          stock:         String(p.stock ?? 0),
          featured:      p.featured    ?? false,
          active:        p.active      ?? true,
          images:        Array.isArray(p.images) ? p.images : [],
          sizes:         Array.isArray(p.sizes)  ? p.sizes  : [],
          colors:        Array.isArray(p.colors) ? p.colors : [],
        })
      })
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setFetching(false))
  }, [id])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  /* Imágenes desde dispositivo */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2_097_152) { reject(new Error('Imagen mayor a 2MB')); return }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files).filter(f => f.type.startsWith('image/'))) {
      try {
        const b64 = await fileToBase64(file)
        setForm(f => ({ ...f, images: [...f.images, b64] }))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al procesar imagen')
      }
    }
  }, [fileToBase64])

  const addImageUrl = () => {
    if (imgUrl.trim() && !form.images.includes(imgUrl.trim())) {
      setForm(f => ({ ...f, images: [...f.images, imgUrl.trim()] }))
      setImgUrl('')
    }
  }
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const addSize  = () => { if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) { set('sizes', [...form.sizes, sizeInput.trim()]); setSizeInput('') } }
  const addColor = () => { if (colorInput.trim() && !form.colors.includes(colorInput.trim())) { set('colors', [...form.colors, colorInput.trim()]); setColorInput('') } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())        { setError('El nombre es requerido'); return }
    if (!form.price)              { setError('El precio es requerido'); return }
    if (parseFloat(form.price) <= 0) { setError('El precio debe ser mayor a 0'); return }
    if (!form.description.trim()) { setError('La descripción es requerida'); return }
    if (form.images.length === 0) { setError('Agrega al menos una imagen'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push('/admin/productos')
      else { const d = await res.json(); setError(d.error || 'Error al guardar') }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  /* Loading del producto */
  if (fetching) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'rgba(148,163,184,0.4)', background: 'var(--bg-console, #0f1421)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <div style={{ width: 36, height: 36, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando producto...</p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .pn-inp:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .card-top::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(249,115,22,0.2),transparent); border-radius:16px 16px 0 0; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f97316', textDecoration: 'none', fontSize: 12, fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          <ChevronLeft size={14} /> VOLVER A PRODUCTOS
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={19} color="#60a5fa" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Editar Producto</h1>
            <p style={{ color: 'rgba(148,163,184,0.45)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>
              ID #{id} · {form.name || '...'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

          {/* ── Columna izquierda ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Info básica */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={16} color="#f97316" /> Información básica</p>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={lbl}>Nombre del producto *</label>
                  <input className="pn-inp" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Descripción *</label>
                  <textarea className="pn-inp" value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Precio USD *</label>
                    <input className="pn-inp" type="number" step="0.01" min="0.01" value={form.price} onChange={e => set('price', e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Precio original <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                    <input className="pn-inp" type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="0.00" style={inp} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Categoría *</label>
                    <select className="pn-inp" value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Badge</label>
                    <select className="pn-inp" value={form.badge} onChange={e => set('badge', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                      {BADGES.map(b => <option key={b} value={b}>{b || 'Sin badge'}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Imágenes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
              className="card-top" style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={16} color="#f97316" /> Imágenes *</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['upload', 'url'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setImgMode(mode)}
                      style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-mono)', background: imgMode === mode ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)', color: imgMode === mode ? '#f97316' : 'rgba(148,163,184,0.5)' }}>
                      {mode === 'upload' ? <><Upload size={9} style={{ display:'inline', marginRight:3 }} />SUBIR</> : <><LinkIcon size={9} style={{ display:'inline', marginRight:3 }} />URL</>}
                    </button>
                  ))}
                </div>
              </div>

              {imgMode === 'upload' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${dragging ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all .2s', marginBottom: 12 }}
                >
                  <Upload size={20} color={dragging ? '#f97316' : 'rgba(148,163,184,0.3)'} style={{ margin: '0 auto 6px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: 12, color: dragging ? '#f97316' : 'rgba(148,163,184,0.5)', fontWeight: 600 }}>
                    {dragging ? 'Suelta aquí' : 'Arrastra o haz clic para agregar más imágenes'}
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)} />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input className="pn-inp" value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                    placeholder="https://..." style={{ ...inp, flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} />
                  <button type="button" onClick={addImageUrl}
                    style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              )}

              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === 0 ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(249,115,22,0.85)', fontSize: 9, fontWeight: 700, textAlign: 'center', color: '#fff', padding: '2px 0', fontFamily: 'var(--font-mono)' }}>PRINCIPAL</div>}
                      <button type="button" onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Variantes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Palette size={16} color="#f97316" /> Variantes <span style={{ opacity: 0.5 }}>(opcional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={lbl}>Tallas</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input className="pn-inp" value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="Ej: S, M, L" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} />
                    <button type="button" onClick={addSize} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.sizes.map(s => (
                      <span key={s} onClick={() => set('sizes', form.sizes.filter(x => x !== s))} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, fontSize: 12, cursor: 'pointer', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {s} <X size={10} color="rgba(148,163,184,0.5)" />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Colores</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input className="pn-inp" value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Ej: Negro, Rojo" style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                    <button type="button" onClick={addColor} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.colors.map(c => (
                      <span key={c} onClick={() => set('colors', form.colors.filter(x => x !== c))} style={{ padding: '4px 10px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 100, fontSize: 12, cursor: 'pointer', color: '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {c} <X size={10} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Columna derecha ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Opciones */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={16} color="#f97316" /> Opciones</p>

              {/* Stock numérico */}
              <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                <label style={{ ...lbl, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Package size={13} color="#f97316" /> Unidades en stock</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input className="pn-inp" type="number" min="0" value={form.stock}
                    onChange={e => set('stock', e.target.value)}
                    style={{ ...inp, width: 90, padding: '8px 12px' }} />
                  <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-mono)', flex: 1 }}>
                    {parseInt(form.stock) > 0
                      ? <span style={{ color: '#4ade80' }}>✓ Disponible</span>
                      : <span style={{ color: '#f87171' }}>✗ Agotado</span>
                    }
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'featured', label: 'Destacado en inicio',        sub: 'Aparece en la página principal' },
                  { key: 'active',   label: 'Activo (visible en tienda)', sub: 'Se muestra en el catálogo' },
                ].map(({ key, label, sub }) => (
                  <div key={key} onClick={() => set(key, !form[key as keyof typeof form])}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: form[key as keyof typeof form] ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form[key as keyof typeof form] ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all .2s' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: form[key as keyof typeof form] ? '#f1f5f9' : 'rgba(148,163,184,0.7)' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>{sub}</p>
                    </div>
                    <div style={{ width: 38, height: 22, borderRadius: 11, background: form[key as keyof typeof form] ? '#f97316' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: form[key as keyof typeof form] ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '12px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botones */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: loading ? 'rgba(96,165,250,0.3)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 18px rgba(59,130,246,0.35)', transition: 'all .2s' }}>
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Guardando...</>
                  : <><Save size={15} /> Guardar cambios</>
                }
              </button>
              <Link href="/admin/productos"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '11px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                Cancelar
              </Link>
            </motion.div>

            {/* Tip */}
            <div style={{ padding: '12px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.12)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Lightbulb size={13} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} /> Los cambios se aplican inmediatamente en la tienda al guardar.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
