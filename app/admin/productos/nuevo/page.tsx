'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, X, Upload, Link as LinkIcon, Zap, Package, ClipboardList, ImageIcon, Palette, Settings, AlertTriangle, Lightbulb, Film, Star, Lock } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { compressImage } from '@/lib/imageCompress'
import type { Subcategory } from '@/lib/subcategories'
import { parseVideoUrl, isPlayableVideo } from '@/lib/videos'

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

export default function NuevoProducto() {
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [categories, setCategories] = useState<{ slug: string; name: string; subcategories?: Subcategory[] }[]>([])
  const [imgMode, setImgMode]     = useState<'upload' | 'url'>('upload')
  const [imgUrl, setImgUrl]       = useState('')
  const [dragging, setDragging]   = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [form, setForm] = useState({
    name: '', price: '', originalPrice: '', cost: '',
    category: '', subcategory: '', description: '', badge: '',
    stock: '0',
    featured: false, active: true,
    images: [] as string[],
    videos: [] as string[],
    videoFirst: false,
    sizes: [] as string[],
    colors: [] as string[],
  })
  const [videoUrl, setVideoUrl] = useState('')
  const [videoError, setVideoError] = useState('')
  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload')
  const [videoUploading, setVideoUploading] = useState(false)
  const videoFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data)
          setForm(f => ({ ...f, category: data[0].slug }))
        }
      })
  }, [])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  /* Optimiza (redimensiona + comprime) y convierte a base64. Acepta fotos de
     cualquier tamaño; quedan en ~200-400KB sin pérdida visible. */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return compressImage(file, { maxSize: 2000, quality: 0.85 })
  }, [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    for (const file of arr) {
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

  const addVideoUrl = () => {
    const url = videoUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) { setVideoError('El enlace debe empezar con http:// o https://'); return }
    if (!isPlayableVideo(url)) { setVideoError('Enlace no reconocido. Usa YouTube, Vimeo o un archivo .mp4'); return }
    if (form.videos.includes(url)) { setVideoUrl(''); return }
    setForm(f => ({ ...f, videos: [...f.videos, url] }))
    setVideoUrl(''); setVideoError('')
  }
  const removeVideo = (i: number) => setForm(f => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i) }))
  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) { setVideoError('El archivo no es un video'); return }
    if (file.size > 50 * 1024 * 1024) { setVideoError('El video supera el máximo de 50MB'); return }
    setVideoError(''); setVideoUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload/video', { method: 'POST', body: fd })
      if (res.status === 413) { setVideoError('El video supera el límite del servidor. Usa uno más liviano o pega un enlace de YouTube.'); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setVideoError(data.error || 'Error al subir el video'); return }
      setForm(f => ({ ...f, videos: [...f.videos, data.url] }))
    } catch { setVideoError('Error al subir el video') }
    finally { setVideoUploading(false) }
  }
  const makeImageCover = (i: number) => setForm(f => { const a = [...f.images]; const [x] = a.splice(i, 1); a.unshift(x); return { ...f, images: a, videoFirst: false } })
  const makeVideoCover = (i: number) => setForm(f => { const a = [...f.videos]; const [x] = a.splice(i, 1); a.unshift(x); return { ...f, videos: a, videoFirst: true } })

  const addSize  = () => { if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) { set('sizes', [...form.sizes, sizeInput.trim()]); setSizeInput('') } }
  const addColor = () => { if (colorInput.trim() && !form.colors.includes(colorInput.trim())) { set('colors', [...form.colors, colorInput.trim()]); setColorInput('') } }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim())        { setError('El nombre es requerido'); return }
    if (!form.price)              { setError('El precio es requerido'); return }
    if (parseFloat(form.price) <= 0) { setError('El precio debe ser mayor a 0'); return }
    if (!form.description.trim()) { setError('La descripción es requerida'); return }
    if (form.images.length === 0) { setError('Agrega al menos una imagen'); return }
    if (!form.category)           { setError('Selecciona una categoría'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push('/admin/productos')
      else { const d = await res.json(); setError(d.error || 'Error al guardar') }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .pn-inp:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .pn-inp option { background: #211f1e; color: #e8e5e2; }
        .card-top::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(249,115,22,0.2),transparent); border-radius:16px 16px 0 0; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f97316', textDecoration: 'none', fontSize: 12, fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          <ChevronLeft size={14} /> VOLVER A PRODUCTOS
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={19} color="#f97316" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Nuevo Producto</h1>
            <p style={{ color: 'rgba(148,163,184,0.45)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>Completa la información del producto</p>
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
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardList size={16} color="#f97316" /> Información básica</p>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={lbl}>Nombre del producto *</label>
                  <input className="pn-inp" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Ej: Camisa Polo Negra" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Descripción *</label>
                  <textarea className="pn-inp" value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Describe el producto..." rows={4}
                    style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Precio USD *</label>
                    <input className="pn-inp" type="number" step="0.01" min="0.01" value={form.price}
                      onChange={e => set('price', e.target.value)} placeholder="0.00" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Precio original <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                    <input className="pn-inp" type="number" step="0.01" min="0" value={form.originalPrice}
                      onChange={e => set('originalPrice', e.target.value)} placeholder="0.00" style={inp} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 5, color: '#93c5fd' }}>
                    <Lock size={11} /> Precio de compra (costo) <span style={{ opacity: 0.6 }}>· privado</span>
                  </label>
                  <input className="pn-inp" type="number" step="0.01" min="0" value={form.cost}
                    onChange={e => set('cost', e.target.value)} placeholder="0.00" style={{ ...inp, maxWidth: 200 }} />
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.45)' }}>
                    Cuánto te costó comprarlo. Es solo para tu control interno — <b style={{ color: 'rgba(148,163,184,0.7)' }}>los clientes nunca lo ven</b>.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Categoría *</label>
                    <select className="pn-inp" value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', '') }}
                      style={{ ...inp, cursor: 'pointer' }}>
                      {categories.length === 0
                        ? <option value="">Sin categorías — crea una primero</option>
                        : categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Badge</label>
                    <select className="pn-inp" value={form.badge} onChange={e => set('badge', e.target.value)}
                      style={{ ...inp, cursor: 'pointer' }}>
                      {BADGES.map(b => <option key={b} value={b}>{b || 'Sin badge'}</option>)}
                    </select>
                  </div>
                </div>
                {/* Subcategoría — solo si la categoría elegida tiene subopciones */}
                {(() => {
                  const activeCat = categories.find(c => c.slug === form.category)
                  const subs = activeCat?.subcategories ?? []
                  if (subs.length === 0) return null
                  return (
                    <div style={{ marginTop: 12 }}>
                      <label style={lbl}>Subcategoría (opcional)</label>
                      <select className="pn-inp" value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                        style={{ ...inp, cursor: 'pointer' }}>
                        <option value="">— Sin subcategoría —</option>
                        {subs.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                      </select>
                      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.4)' }}>
                        Al elegirla, el producto aparece cuando el cliente filtra por esa subopción de <b style={{ color: 'rgba(148,163,184,0.7)' }}>{activeCat?.name}</b>.
                      </p>
                    </div>
                  )
                })()}
              </div>
            </motion.div>

            {/* Imágenes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
              className="card-top" style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><ImageIcon size={16} color="#f97316" /> Imágenes *</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['upload', 'url'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setImgMode(mode)}
                      style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-mono)', background: imgMode === mode ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)', color: imgMode === mode ? '#f97316' : 'rgba(148,163,184,0.5)' }}>
                      {mode === 'upload' ? <><Upload size={9} style={{ display:'inline', marginRight:3 }} />SUBIR</> : <><LinkIcon size={9} style={{ display:'inline', marginRight:3 }} />URL</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zona de drop */}
              {imgMode === 'upload' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${dragging ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all .2s', marginBottom: 12 }}
                >
                  <Upload size={22} color={dragging ? '#f97316' : 'rgba(148,163,184,0.3)'} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: 13, color: dragging ? '#f97316' : 'rgba(148,163,184,0.5)', fontWeight: 600 }}>
                    {dragging ? 'Suelta las imágenes' : 'Arrastra imágenes o haz clic'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.3)', fontFamily: 'var(--font-mono)' }}>
                    JPG, PNG, WEBP · se optimizan solas · cualquier tamaño · múltiples permitidas
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
                    style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              )}

              {/* Preview imágenes */}
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {form.images.map((img, i) => {
                    const isCover = i === 0 && !form.videoFirst
                    return (
                      <div key={i} style={{ position: 'relative', width: 84, height: 84, borderRadius: 10, overflow: 'hidden', border: `2px solid ${isCover ? '#f97316' : 'rgba(255,255,255,0.1)'}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={10} />
                        </button>
                        <button type="button" onClick={() => makeImageCover(i)} disabled={isCover}
                          title={isCover ? 'Es la portada' : 'Hacer portada'}
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: isCover ? 'rgba(249,115,22,0.92)' : 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 0', cursor: isCover ? 'default' : 'pointer', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Star size={9} fill={isCover ? '#fff' : 'none'} /> {isCover ? 'PORTADA' : 'Portada'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              {form.images.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.35)', fontFamily: 'var(--font-mono)' }}>
                  La portada es lo primero que ve el cliente. Toca «Portada» en una foto o video para elegirla.
                </p>
              )}
            </motion.div>

            {/* Videos */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Film size={16} color="#f97316" /> Videos <span style={{ opacity: 0.5 }}>(opcional)</span></p>
              <p style={{ margin: '0 0 14px', fontSize: 11, color: 'rgba(148,163,184,0.4)' }}>
                Sube un video desde tu dispositivo o pega un enlace de <b style={{ color: 'rgba(148,163,184,0.7)' }}>YouTube</b>/Vimeo. Se muestran en la ficha del producto.
              </p>

              {/* Toggle subir / enlace */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {(['upload', 'url'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setVideoMode(m); setVideoError('') }}
                    style={{ padding: '4px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-mono)', background: videoMode === m ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)', color: videoMode === m ? '#f97316' : 'rgba(148,163,184,0.6)' }}>
                    {m === 'upload' ? <><Upload size={10} style={{ display: 'inline', marginRight: 4 }} />SUBIR VIDEO</> : <><LinkIcon size={10} style={{ display: 'inline', marginRight: 4 }} />ENLACE</>}
                  </button>
                ))}
              </div>

              {videoMode === 'upload' ? (
                <div onClick={() => !videoUploading && videoFileRef.current?.click()}
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: videoUploading ? 'wait' : 'pointer', background: 'rgba(255,255,255,0.02)', marginBottom: form.videos.length ? 12 : 0 }}>
                  {videoUploading ? (
                    <p style={{ margin: 0, fontSize: 13, color: '#f97316', fontWeight: 600 }}>Subiendo video…</p>
                  ) : (
                    <>
                      <Upload size={20} color="rgba(148,163,184,0.4)" style={{ margin: '0 auto 6px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(148,163,184,0.6)', fontWeight: 600 }}>Haz clic para subir un video</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.35)', fontFamily: 'var(--font-mono)' }}>MP4, WebM o MOV · máx 50MB</p>
                    </>
                  )}
                  <input ref={videoFileRef} type="file" accept="video/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = '' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginBottom: form.videos.length ? 12 : 0 }}>
                  <input className="pn-inp" value={videoUrl}
                    onChange={e => { setVideoUrl(e.target.value); setVideoError('') }}
                    placeholder="https://youtu.be/..." style={{ ...inp, flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())} />
                  <button type="button" onClick={addVideoUrl}
                    style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              )}

              {videoError && <p style={{ margin: '10px 0 0', fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={12} style={{ flexShrink: 0 }} /> {videoError}</p>}

              {form.videos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {form.videos.map((v, i) => {
                    const info = parseVideoUrl(v)
                    const label = info.kind === 'youtube' ? 'YouTube' : info.kind === 'vimeo' ? 'Vimeo' : info.kind === 'file' ? (v.startsWith('/uploads/') ? 'Subido' : 'Archivo') : '—'
                    const isCover = form.videoFirst && i === 0
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: `1px solid ${isCover ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(249,115,22,0.15)', color: '#f97316', fontFamily: 'var(--font-mono)' }}>{label}</span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: 'rgba(148,163,184,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                        <button type="button" onClick={() => makeVideoCover(i)} disabled={isCover}
                          title={isCover ? 'Es la portada' : 'Hacer portada'}
                          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: isCover ? 'default' : 'pointer', border: '1px solid ' + (isCover ? 'rgba(249,115,22,0.4)' : 'rgba(148,163,184,0.2)'), background: isCover ? 'rgba(249,115,22,0.15)' : 'rgba(148,163,184,0.08)', color: isCover ? '#f97316' : 'rgba(148,163,184,0.6)' }}>
                          <Star size={10} fill={isCover ? '#f97316' : 'none'} /> {isCover ? 'PORTADA' : 'Portada'}
                        </button>
                        <button type="button" onClick={() => removeVideo(i)} style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <X size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Variantes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><Palette size={16} color="#f97316" /> Variantes <span style={{ opacity: 0.5 }}>(opcional)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Tallas */}
                <div>
                  <label style={lbl}>Tallas</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input className="pn-inp" value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                      placeholder="Ej: S, M, L, XL" style={{ ...inp, flex: 1 }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} />
                    <button type="button" onClick={addSize}
                      style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.sizes.map(s => (
                      <span key={s} onClick={() => set('sizes', form.sizes.filter(x => x !== s))}
                        style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, fontSize: 12, cursor: 'pointer', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {s} <X size={10} color="rgba(148,163,184,0.5)" />
                      </span>
                    ))}
                  </div>
                </div>
                {/* Colores */}
                <div>
                  <label style={lbl}>Colores</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input className="pn-inp" value={colorInput} onChange={e => setColorInput(e.target.value)}
                      placeholder="Ej: Negro, Rojo" style={{ ...inp, flex: 1 }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                    <button type="button" onClick={addColor}
                      style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.colors.map(c => (
                      <span key={c} onClick={() => set('colors', form.colors.filter(x => x !== c))}
                        style={{ padding: '4px 10px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 100, fontSize: 12, cursor: 'pointer', color: '#f97316', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {c} <X size={10} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Columna derecha — opciones + guardar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

            {/* Opciones */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
              className="card-top" style={card}>
              <p style={{ ...lbl, fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><Settings size={16} color="#f97316" /> Opciones</p>

              {/* Stock numérico */}
              <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                <label style={{ ...lbl, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Package size={14} color="#f97316" /> Unidades en stock</label>
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
                  <div key={key}
                    onClick={() => set(key, !form[key as keyof typeof form])}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: form[key as keyof typeof form] ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form[key as keyof typeof form] ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all .2s' }}
                  >
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
              <button type="submit" disabled={loading || categories.length === 0}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, background: loading || categories.length === 0 ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg,#f97316,#c1692b)', color: '#fff', border: 'none', cursor: loading || categories.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: loading || categories.length === 0 ? 'none' : '0 4px 18px rgba(249,115,22,0.35)', transition: 'all .2s' }}>
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Guardando...</>
                  : <><Zap size={15} /> Guardar producto</>
                }
              </button>
              {categories.length === 0 && (
                <p style={{ margin: 0, fontSize: 11, color: '#fbbf24', textAlign: 'center', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} /> Crea al menos una categoría primero
                </p>
              )}
              <Link href="/admin/productos"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '11px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all .2s', textAlign: 'center' }}>
                Cancelar
              </Link>
            </motion.div>

            {/* Tip */}
            <div style={{ padding: '12px 14px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-mono)', display: 'flex', gap: 6 }}>
                <Lightbulb size={14} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} /> <span>Puedes subir varias imágenes. La primera es la principal. Se optimizan automáticamente al subirlas (sin pérdida visible).</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
