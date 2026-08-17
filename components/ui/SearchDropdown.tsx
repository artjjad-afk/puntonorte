'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, TrendingUp, Loader2 } from 'lucide-react'

const POPULAR = ['Vestido', 'Perfume', 'Camisa', 'Cartera', 'Cargador']

interface Product {
  id: number
  name: string
  slug: string
  price: number
  category: string
  images: string[]
}

export function SearchDropdown({ onClose }: { onClose: () => void }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Product[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Cargar productos destacados al abrir
  useEffect(() => {
    inputRef.current?.focus()
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {})
  }, [])

  // Búsqueda con debounce de 300ms contra la API real
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setLoading(false); return }

    setLoading(true)
    debounceRef.current = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(q.trim())}`)
        .then(r => r.json())
        .then(data => setResults(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
  }, [])

  useEffect(() => {
    search(query)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  const go = (slug: string) => { router.push(`/tienda/${slug}`); onClose() }
  const goSearch = () => { if (query.trim()) { router.push(`/tienda?q=${encodeURIComponent(query.trim())}`); onClose() } }

  const display = query.trim() ? results : featured

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:58 }} />
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:59,
        background:'rgba(33,31,30,0.98)', backdropFilter:'blur(20px)',
        padding:'20px 24px 24px',
        boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
        animation:'fadeIn .2s ease',
      }}>
        <div style={{ maxWidth:'680px', margin:'0 auto' }}>

          {/* Input */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(193,105,43,0.4)', borderRadius:'14px', padding:'12px 16px', marginBottom:'20px' }}>
            {loading
              ? <Loader2 size={18} color="#c1692b" style={{ animation:'spin .7s linear infinite', flexShrink:0 }} />
              : <Search size={18} color="#c1692b" style={{ flexShrink:0 }} />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') goSearch(); if (e.key === 'Escape') onClose() }}
              placeholder="Buscar productos, categorías..."
              style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:'16px', outline:'none', fontFamily:'Arial,sans-serif' }}
            />
            {query
              ? <button onClick={() => setQuery('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:'2px', flexShrink:0 }}><X size={16} /></button>
              : <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'12px', fontWeight:'600', letterSpacing:'1px', flexShrink:0 }}>ESC</button>
            }
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>

          {/* Búsquedas populares — solo cuando no hay query */}
          {!query && (
            <div style={{ marginBottom:'20px' }}>
              <p style={{ color:'rgba(232,229,226,0.4)', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
                <TrendingUp size={12} /> BÚSQUEDAS POPULARES
              </p>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {POPULAR.map(p => (
                  <button key={p} onClick={() => setQuery(p)}
                    style={{ padding:'6px 14px', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', color:'rgba(232,229,226,0.7)', fontSize:'13px', cursor:'pointer', transition:'all .2s', fontWeight:'500' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c1692b'; e.currentTarget.style.color = '#c1692b' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(232,229,226,0.7)' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultados */}
          <div>
            <p style={{ color:'rgba(232,229,226,0.4)', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', marginBottom:'10px' }}>
              {query.trim()
                ? loading ? 'BUSCANDO...' : `${results.length} RESULTADO${results.length !== 1 ? 'S' : ''}`
                : 'PRODUCTOS DESTACADOS'
              }
            </p>

            {display.length > 0 && (
              <div style={{ display:'grid', gap:'8px' }}>
                {display.map(p => (
                  <button key={p.id} onClick={() => go(p.slug)}
                    style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', border:'1px solid transparent', background:'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'left', transition:'all .2s', width:'100%' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,105,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(193,105,43,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'8px', overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.06)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="line-clamp-1" style={{ margin:0, color:'#e8e5e2', fontSize:'14px', fontWeight:'600' }}>{p.name}</p>
                      <p style={{ margin:0, color:'rgba(232,229,226,0.45)', fontSize:'12px', textTransform:'capitalize' }}>{p.category}</p>
                    </div>
                    <span style={{ color:'#c1692b', fontWeight:'800', fontSize:'14px', flexShrink:0 }}>${p.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Ver todos los resultados */}
            {query.trim() && !loading && results.length > 0 && (
              <button onClick={goSearch}
                style={{ width:'100%', marginTop:'12px', padding:'12px', borderRadius:'10px', border:'1px solid rgba(193,105,43,0.3)', background:'rgba(193,105,43,0.08)', color:'#c1692b', cursor:'pointer', fontWeight:'700', fontSize:'13px', transition:'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(193,105,43,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(193,105,43,0.08)')}>
                Ver todos los resultados para "{query}" →
              </button>
            )}

            {/* Sin resultados */}
            {query.trim() && !loading && results.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px', color:'rgba(232,229,226,0.4)' }}>
                <p style={{ fontSize:'15px', margin:'0 0 8px' }}>Sin resultados para "{query}"</p>
                <p style={{ fontSize:'13px', margin:0 }}>Intenta con otro término</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
