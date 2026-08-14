'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, TrendingUp } from 'lucide-react'
import { products } from '@/lib/products'

const POPULAR = ['Vestido', 'Perfume', 'Camisa', 'Cartera', 'Cargador']

export function SearchDropdown({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(products.slice(0, 4))
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
    if (query.length > 1) {
      const q = query.toLowerCase()
      setResults(products.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q)).slice(0, 5))
    } else {
      setResults(products.slice(0, 4))
    }
  }, [query])

  const go = (slug: string) => { router.push(`/tienda/${slug}`); onClose() }
  const goSearch = () => { if (query) { router.push(`/tienda?q=${query}`); onClose() } }

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
        {/* Input */}
        <div style={{ maxWidth:'680px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(193,105,43,0.4)', borderRadius:'14px', padding:'12px 16px', marginBottom:'20px' }}>
            <Search size={18} color="#c1692b" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') goSearch(); if (e.key === 'Escape') onClose() }}
              placeholder="Buscar productos, categorías..."
              style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:'16px', outline:'none', fontFamily:'Arial,sans-serif' }}
            />
            {query
              ? <button onClick={() => setQuery('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:'2px' }}><X size={16} /></button>
              : <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'12px', fontWeight:'600', letterSpacing:'1px' }}>ESC</button>
            }
          </div>

          {/* Popular */}
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
              {query ? `${results.length} RESULTADOS` : 'PRODUCTOS DESTACADOS'}
            </p>
            <div style={{ display:'grid', gap:'8px' }}>
              {results.map(p => (
                <button key={p.id} onClick={() => go(p.slug)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'12px', border:'1px solid transparent', background:'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'left', transition:'all .2s', width:'100%' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,105,43,0.1)'; e.currentTarget.style.borderColor = 'rgba(193,105,43,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'transparent' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="line-clamp-1" style={{ margin:0, color:'#e8e5e2', fontSize:'14px', fontWeight:'600' }}>{p.name}</p>
                    <p style={{ margin:0, color:'rgba(232,229,226,0.45)', fontSize:'12px', textTransform:'capitalize' }}>{p.category}</p>
                  </div>
                  <span style={{ color:'#c1692b', fontWeight:'800', fontSize:'14px', flexShrink:0 }}>${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            {query && results.length > 0 && (
              <button onClick={goSearch}
                style={{ width:'100%', marginTop:'12px', padding:'12px', borderRadius:'10px', border:'1px solid rgba(193,105,43,0.3)', background:'rgba(193,105,43,0.08)', color:'#c1692b', cursor:'pointer', fontWeight:'700', fontSize:'13px', transition:'all .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(193,105,43,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(193,105,43,0.08)')}>
                Ver todos los resultados para "{query}" →
              </button>
            )}
            {query && results.length === 0 && (
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
