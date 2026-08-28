'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Trash2, Tag, Eye, EyeOff, Pencil, X, Check, GripVertical, Upload, Link as LinkIcon, AlertCircle, CheckCircle2, Lightbulb, Home, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { compressImage } from '@/lib/imageCompress'

interface Category {
  id: number; name: string; slug: string
  image: string | null; active: boolean
  showInNav: boolean; showInHome: boolean; order: number
}

interface Toast {
  id: number; type: 'success' | 'error' | 'info'; message: string
}

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)', fontSize: 13,
  outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)',
  color: '#e2e8f0', transition: 'border-color .2s',
  boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(148,163,184,0.6)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'var(--font-mono)',
}

export default function AdminCategorias() {
  const [cats, setCats]           = useState<Category[]>([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState({ name: '', image: '', order: '0' })
  const [imageData, setImageData] = useState<string | null>(null)
  const [imgMode, setImgMode]     = useState<'url' | 'upload'>('upload')
  const [dragging, setDragging]   = useState(false)
  const fileRef                   = useRef<HTMLInputElement>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm]   = useState({ name: '', image: '', order: '0' })
  const [editImageData, setEditImageData] = useState<string | null>(null)
  const [toasts, setToasts]       = useState<Toast[]>([])
  const toastIdRef                = useRef(0)

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  /* Optimiza (redimensiona + comprime) y convierte a base64. Acepta cualquier
     tamaño; la imagen queda liviana sin pérdida visible. */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return compressImage(file, { maxSize: 2000, quality: 0.85 })
  }, [])

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo se aceptan imágenes'); return }
    try {
      const b64 = await fileToBase64(file)
      setImageData(b64)
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar imagen')
    }
  }, [fileToBase64])

  const handleEditFileDrop = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    try {
      const b64 = await fileToBase64(file)
      setEditImageData(b64)
    } catch { /* ignorar */ }
  }, [fileToBase64])

  const fetchCats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories?all=true')
      if (res.ok) setCats(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCats() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    
    // Validar orden
    const orderNum = parseInt(form.order)
    if (!orderNum || orderNum < 1) { setError('El orden debe ser un número mayor a 0'); return }
    if (cats.some(c => c.order === orderNum)) { setError(`Ya existe una categoría con orden ${orderNum}`); return }

    setSaving(true); setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: slugify(form.name),
          image: imgMode === 'url' ? (form.image.trim() || null) : null,
          imageData: imgMode === 'upload' ? imageData : null,
          order: parseInt(form.order) || 0,
        }),
      })
      if (res.ok) {
        setForm({ name: '', image: '', order: '0' })
        setImageData(null)
        fetchCats()
      } else {
        const d = await res.json(); setError(d.error || 'Error al crear')
      }
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  const handleToggle = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !cat.active }) })
      if (!res.ok) throw new Error()
      showToast('success', cat.active ? `"${cat.name}" ocultada` : `"${cat.name}" activada`)
      fetchCats()
    } catch { showToast('error', 'No se pudo cambiar el estado de la categoría') }
  }

  const handleToggleNav = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showInNav: !cat.showInNav }) })
      if (!res.ok) throw new Error()
      showToast('success', cat.showInNav ? `"${cat.name}" quitada del menú` : `"${cat.name}" agregada al menú`)
      fetchCats()
    } catch { showToast('error', 'No se pudo actualizar el menú') }
  }

  const handleToggleHome = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showInHome: !cat.showInHome }) })
      if (!res.ok) throw new Error()
      showToast('success', cat.showInHome ? `"${cat.name}" quitada del inicio` : `"${cat.name}" destacada en el inicio ✦`)
      fetchCats()
    } catch { showToast('error', 'No se pudo actualizar. Intenta de nuevo.') }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Los productos quedarán sin categoría visible.`)) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('success', `"${name}" eliminada`)
      fetchCats()
    } catch { showToast('error', 'No se pudo eliminar la categoría') }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, image: cat.image || '', order: String(cat.order) })
    setEditImageData(null)
  }

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: slugify(editForm.name),
          image: editImageData ? null : (editForm.image.trim() || null),
          imageData: editImageData || null,
          order: parseInt(editForm.order) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      setEditingId(null)
      setEditImageData(null)
      showToast('success', 'Categoría actualizada')
      fetchCats()
    } catch { showToast('error', 'No se pudieron guardar los cambios') }
  }

  return (
    <div style={{ padding: '24px 28px 80px', minHeight: '100vh', background: 'var(--bg-console, #0f1421)', fontFamily: 'var(--font-display, sans-serif)', color: '#e2e8f0' }}>
      <style>{`
        .cat-input:focus { border-color: rgba(249,115,22,0.5) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .cat-row { transition: background .18s; }
        .cat-row:hover { background: rgba(255,255,255,0.03); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toast-in { from { opacity:0; transform:translateX(40px) scale(.95); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes toast-out { from { opacity:1; transform:translateX(0) scale(1); } to { opacity:0; transform:translateX(40px) scale(.95); } }
        @media(max-width:900px) { .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Toasts ── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 18px', borderRadius: 14, pointerEvents: 'auto',
                backdropFilter: 'blur(20px)',
                background: t.type === 'success'
                  ? 'rgba(34,197,94,0.15)'
                  : t.type === 'error'
                    ? 'rgba(248,113,113,0.15)'
                    : 'rgba(96,165,250,0.15)',
                border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,0.3)' : t.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(96,165,250,0.3)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                maxWidth: 320, fontSize: 13, fontWeight: 600,
                color: t.type === 'success' ? '#86efac' : t.type === 'error' ? '#fca5a5' : '#93c5fd',
              }}
            >
              {t.type === 'success'
                ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                : <AlertCircle size={16} style={{ flexShrink: 0 }} />
              }
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={18} color="#f97316" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Categorías</h1>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 12, margin: 0, fontFamily: 'var(--font-mono)' }}>
              {cats.length} categor{cats.length === 1 ? 'ía' : 'ías'} · Base del catálogo
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }} className="cat-grid">

        {/* ── Formulario nueva categoría ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18, padding: 24, position: 'sticky', top: 24,
          }}
        >
          {/* Top line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)', borderRadius: '18px 18px 0 0' }} />

          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} color="#f97316" /> Nueva categoría
          </h2>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Nombre *</label>
              <input
                className="cat-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Ropa de Playa"
                style={inp}
              />
              {form.name && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>
                  slug: /{slugify(form.name)}
                </p>
              )}
            </div>

            {/* ── Imagen: toggle Upload / URL ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={lbl}>Imagen (opcional)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['upload', 'url'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => { setImgMode(mode); setImageData(null); setForm(f => ({ ...f, image: '' })) }}
                      style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', border: 'none', background: imgMode === mode ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)', color: imgMode === mode ? '#f97316' : 'rgba(148,163,184,0.6)' }}>
                      {mode === 'upload' ? <><Upload size={9} style={{ display: 'inline', marginRight: 4 }} />SUBIR</> : <><LinkIcon size={9} style={{ display: 'inline', marginRight: 4 }} />URL</>}
                    </button>
                  ))}
                </div>
              </div>

              {imgMode === 'upload' ? (
                /* ── Zona Drag & Drop ── */
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f) }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? 'rgba(249,115,22,0.7)' : imageData ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 12, padding: imageData ? 0 : '24px 16px',
                    textAlign: 'center', cursor: 'pointer',
                    background: dragging ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.03)',
                    transition: 'all .2s', overflow: 'hidden', position: 'relative',
                  }}
                >
                  {imageData ? (
                    <div style={{ position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageData} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={e => { e.stopPropagation(); setImageData(null) }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={13} />
                      </button>
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(34,197,94,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        ✓ IMAGEN LISTA
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} color={dragging ? '#f97316' : 'rgba(148,163,184,0.4)'} style={{ margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ margin: 0, fontSize: 13, color: dragging ? '#f97316' : 'rgba(148,163,184,0.6)', fontWeight: 600 }}>
                        {dragging ? 'Suelta aquí' : 'Arrastra o haz clic'}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.35)', fontFamily: 'var(--font-mono)' }}>
                        JPG, PNG, WEBP · se optimiza sola · cualquier tamaño
                      </p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileDrop(f) }} />
                </div>
              ) : (
                /* ── Modo URL ── */
                <>
                  <input className="cat-input" value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..." style={inp} />
                  {form.image && (
                    <div style={{ marginTop: 8, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label style={lbl}>Orden de aparición *</label>
              <input
                className="cat-input"
                type="number"
                min="1"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                style={{ ...inp, width: '80px' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>
                Órdenes usados: {cats.map(c => c.order).sort((a,b) => a-b).join(', ') || 'ninguno'}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: '#f87171', fontSize: 12, margin: 0, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', borderRadius: 11,
                background: saving || !form.name.trim() ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg,#f97316,#c1692b)',
                color: '#fff', border: 'none', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                boxShadow: saving || !form.name.trim() ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
                transition: 'all .2s',
              }}
            >
              <Plus size={15} /> {saving ? 'Guardando...' : 'Agregar categoría'}
            </button>
          </form>

          {/* Tip */}
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.14)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.6)', lineHeight: 1.6, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} /> El slug se genera automático. Las categorías aparecen en el menú de la tienda y en el formulario de productos.
            </p>
          </div>
        </motion.div>

        {/* ── Lista de categorías ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.2),transparent)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
              Lista de categorías
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                {cats.length}
              </span>
            </h2>
          </div>

          {/* Contenido */}
          {loading ? (
            <div style={{ padding: 56, textAlign: 'center', color: 'rgba(148,163,184,0.4)' }}>
              <div style={{ width: 32, height: 32, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin .8s linear infinite' }} />
              <p style={{ margin: 0, fontSize: 13, fontFamily: 'var(--font-mono)' }}>Cargando categorías...</p>
            </div>
          ) : cats.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center', color: 'rgba(148,163,184,0.3)' }}>
              <Tag size={36} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.4)' }}>Sin categorías</p>
              <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Crea la primera usando el formulario</p>
            </div>
          ) : (
            <div>
              {cats.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: i < cats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  {editingId === cat.id ? (
                    /* ── Modo edición ── */
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '16px 20px', background: 'rgba(249,115,22,0.06)', display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}
                    >
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label style={lbl}>Nombre</label>
                        <input className="cat-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ ...inp, padding: '8px 12px' }} />
                      </div>
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <label style={lbl}>URL imagen / subir</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input className="cat-input" value={editForm.image}
                            onChange={e => { setEditForm(f => ({ ...f, image: e.target.value })); setEditImageData(null) }}
                            placeholder="https://..." style={{ ...inp, padding: '8px 12px', flex: 1 }} />
                          <label style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Upload size={14} color="#f97316" />
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleEditFileDrop(f) }} />
                          </label>
                        </div>
                        {editImageData && (
                          <div style={{ marginTop: 6, height: 50, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(34,197,94,0.3)', position: 'relative' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={editImageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setEditImageData(null)} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ width: 70 }}>
                        <label style={lbl}>Orden</label>
                        <input className="cat-input" type="number" value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))} style={{ ...inp, padding: '8px 12px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(cat.id)} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(148,163,184,0.7)' }}>
                          <X size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Vista normal ── */
                    <div
                      className="cat-row"
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}
                    >
                      {/* Drag handle decorativo */}
                      <GripVertical size={14} color="rgba(148,163,184,0.2)" style={{ flexShrink: 0 }} />

                      {/* Imagen */}
                      <div style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
                          : <Tag size={18} color="rgba(148,163,184,0.3)" strokeWidth={1.5} />
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{cat.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(148,163,184,0.45)', fontFamily: 'var(--font-mono)' }}>
                          /{cat.slug} · orden: {cat.order}
                        </p>
                      </div>

                      {/* Badge estado */}
                      <span style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, flexShrink: 0,
                        background: cat.active ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.1)',
                        color: cat.active ? '#22c55e' : 'rgba(148,163,184,0.5)',
                        border: `1px solid ${cat.active ? 'rgba(34,197,94,0.25)' : 'rgba(148,163,184,0.15)'}`,
                      }}>
                        {cat.active ? 'Activa' : 'Oculta'}
                      </span>

                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {/* Toggle inicio */}
                        <button
                          onClick={() => handleToggleHome(cat)}
                          title={cat.showInHome ? 'Quitar del inicio' : 'Mostrar en inicio'}
                          style={{ height: 32, padding: '0 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, background: cat.showInHome ? 'rgba(139,92,246,0.15)' : 'rgba(148,163,184,0.08)', border: `1px solid ${cat.showInHome ? 'rgba(139,92,246,0.3)' : 'rgba(148,163,184,0.15)'}`, color: cat.showInHome ? '#a78bfa' : 'rgba(148,163,184,0.5)', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                        >
                          <Home size={14} /> INICIO
                        </button>
                        {/* Toggle acceso rápido en navbar */}
                        <button
                          onClick={() => handleToggleNav(cat)}
                          title={cat.showInNav ? 'Quitar del menú' : 'Mostrar en menú'}
                          style={{ height: 32, padding: '0 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, background: cat.showInNav ? 'rgba(249,115,22,0.15)' : 'rgba(148,163,184,0.08)', border: `1px solid ${cat.showInNav ? 'rgba(249,115,22,0.3)' : 'rgba(148,163,184,0.15)'}`, color: cat.showInNav ? '#f97316' : 'rgba(148,163,184,0.5)', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                        >
                          <Star size={14} fill={cat.showInNav ? 'currentColor' : 'none'} /> MENÚ
                        </button>
                        <button onClick={() => startEdit(cat)} title="Editar" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', cursor: 'pointer' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleToggle(cat)} title={cat.active ? 'Ocultar' : 'Mostrar'} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', color: 'rgba(148,163,184,0.6)', cursor: 'pointer' }}>
                          {cat.active ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} title="Eliminar" style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
