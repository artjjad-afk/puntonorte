'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ProductCard } from '@/components/ui/ProductCard'
import { BubblesCanvas } from '@/components/ui/BubblesCanvas'
import { LightRays } from '@/components/ui/LightRays'
import { ParticlesBurst, fireBurst } from '@/components/ui/ParticlesBurst'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Product } from '@/types'

// Categorías del hero — imágenes fijas decorativas
const categories = [
  { id: 'dama',       label: 'Dama',       image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
  { id: 'caballero',  label: 'Caballero',  image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80' },
  { id: 'accesorios', label: 'Accesorios', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
  { id: 'perfumes',   label: 'Perfumes',   image: 'https://images.unsplash.com/photo-1547887538-047c9d44754b?w=600&q=80' },
  { id: 'cargadores', label: 'Cargadores', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80' },
]

const testimonials = [
  { name: 'María G.',    city: 'Caracas',   text: 'Excelente calidad y llegó súper rápido. El vestido quedó perfecto. 100% recomendado.', stars: 5 },
  { name: 'Carlos R.',   city: 'Valencia',  text: 'La camisa Oxford es de muy buena tela. El servicio por WhatsApp fue muy atento y rápido.', stars: 5 },
  { name: 'Andreína P.', city: 'Maracaibo', text: 'Compré el perfume Rose Élégance y huele increíble. Ya hice mi segundo pedido con ellos.', stars: 5 },
]

const stats = [
  { value: 500, suffix: '+', label: 'Clientes satisfechos',  icon: '🛍️' },
  { value: 200, suffix: '+', label: 'Productos disponibles', icon: '✨' },
  { value: 5,   suffix: '★', label: 'Calificación promedio', icon: '⭐' },
  { value: 24,  suffix: 'h', label: 'Atención WhatsApp',     icon: '💬' },
]

/* Partículas decorativas hero */
const HERO_PARTICLES = [
  { size: 4,  top:'18%', left:'72%', delay:'0s',   dur:'6s',   op:0.7 },
  { size: 6,  top:'35%', left:'85%', delay:'1.2s', dur:'8s',   op:0.45 },
  { size: 3,  top:'60%', left:'78%', delay:'2.5s', dur:'7s',   op:0.8 },
  { size: 5,  top:'25%', left:'92%', delay:'0.8s', dur:'9s',   op:0.35 },
  { size: 4,  top:'75%', left:'68%', delay:'3s',   dur:'6.5s', op:0.6 },
  { size: 7,  top:'50%', left:'88%', delay:'1.8s', dur:'10s',  op:0.3 },
  { size: 3,  top:'12%', left:'60%', delay:'4s',   dur:'7.5s', op:0.65 },
  { size: 5,  top:'82%', left:'80%', delay:'2s',   dur:'8.5s', op:0.5 },
  { size: 4,  top:'42%', left:'95%', delay:'0.5s', dur:'6s',   op:0.7 },
  { size: 6,  top:'68%', left:'58%', delay:'3.5s', dur:'9s',   op:0.4 },
]

/* Iconos flotantes para secciones claras */
const FLOAT_ICONS = ['✦','◆','✧','◇','⬦','✦','◈','✧']

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = Date.now()
      const duration = 1600
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1)
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
        setCurrent(Math.floor(ease * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{current}{suffix}</span>
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [featuredLoaded, setFeaturedLoaded] = useState(false)
  const [dbCategories, setDbCategories] = useState<{ id: string; slug: string; label: string; image: string }[] | null | undefined>(undefined)
  const [homeCategories, setHomeCategories] = useState<{ id: string; slug: string; label: string; image: string }[] | null | undefined>(undefined)
  const [carouselOffset, setCarouselOffset] = useState(0)
  const [carouselDir, setCarouselDir]       = useState<1 | -1>(1)
  const [carouselClickAnim, setCarouselClickAnim] = useState(false)
  const autoplayRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const animatingRef  = useRef(false)

  const rotated = useCallback((arr: { id: string; slug: string; label: string; image: string }[] | null | undefined, offset: number) => {
    if (!arr || arr.length === 0) return []
    const n = arr.length
    return Array.from({ length: n }, (_, i) => arr[(offset + i) % n])
  }, [])

  const advance = useCallback((dir: 1 | -1, cats: { id: string; slug: string; label: string; image: string }[]) => {
    if (animatingRef.current) return
    animatingRef.current = true
    setCarouselDir(dir)
    if (dir === 1) { setCarouselClickAnim(true); setTimeout(() => setCarouselClickAnim(false), 350) }
    setCarouselOffset(o => (o + dir + cats.length) % cats.length)
    setTimeout(() => { animatingRef.current = false }, 700)
  }, [])

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    if (!homeCategories || homeCategories.length <= 1) return
    autoplayRef.current = setInterval(() => advance(1, homeCategories), 3500)
  }, [homeCategories, advance])

  useEffect(() => {
    if (!homeCategories || homeCategories.length <= 1) return
    autoplayRef.current = setInterval(() => advance(1, homeCategories), 3500)
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [homeCategories, advance])
  const [activeBanner, setActiveBanner] = useState<{
    etiqueta: string | null; titulo: string; subtitulo: string | null
    descripcion: string | null; linkUrl: string; linkTexto: string
    imagen: string | null; precioDesde: number | null
  } | null | undefined>(undefined) // undefined = cargando, null = no hay banner
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(d => setFeatured(Array.isArray(d) ? d.slice(0, 8) : []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoaded(true))

    // Cargar banner activo
    fetch('/api/banners')
      .then(r => r.json())
      .then(data => setActiveBanner(data ?? null))
      .catch(() => setActiveBanner(null))

    // Cargar categorías reales desde la DB (para la sección hero/grid)
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbCategories(data.map((c: { slug: string; name: string; image?: string }) => ({
            id:    c.slug,
            slug:  c.slug,
            label: c.name,
            image: c.image && !c.image.startsWith('data:') ? c.image : '',
          })))
        } else {
          setDbCategories([])
        }
      })
      .catch(() => setDbCategories([]))

    // Cargar categorías destacadas para el carrusel del inicio
    fetch('/api/categories?home=true')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHomeCategories(data.map((c: { slug: string; name: string; image?: string }) => ({
            id:    c.slug,
            slug:  c.slug,
            label: c.name,
            image: c.image ?? '',  // base64 se acepta aquí
          })))
        } else {
          setHomeCategories([])
        }
      })
      .catch(() => setHomeCategories([]))
  }, [])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const btn = e.currentTarget
    const r = btn.getBoundingClientRect()
    btn.style.setProperty('--rx', `${e.clientX - r.left}px`)
    btn.style.setProperty('--ry', `${e.clientY - r.top}px`)
  }, [])

  return (
    <>
      <style>{`
        /* ── Cat items ── */
        .cat-item{position:relative;overflow:hidden;border-radius:20px;cursor:pointer;display:block;}
        .cat-item img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.25,.46,.45,.94);display:block;}
        .cat-item:hover img{transform:scale(1.12);}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(33,31,30,.9) 0%,rgba(33,31,30,.05) 55%,transparent 100%);transition:opacity .4s;}
        .cat-item:hover .cat-overlay{opacity:.95;}
        .cat-arrow{opacity:0;transform:translateX(-12px);transition:all .4s cubic-bezier(.34,1.56,.64,1);}
        .cat-item:hover .cat-arrow{opacity:1;transform:translateX(0);}
        .cat-item::after{content:'';position:absolute;top:0;left:-90%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-20deg);pointer-events:none;}
        .cat-item:hover::after{animation:shine-sweep .8s ease forwards;}

        /* ── Promo strip ── */
        .promo-strip{display:grid;grid-template-columns:1fr 1fr;min-height:520px;}
        @media(max-width:768px){
          .promo-strip{grid-template-columns:1fr;}
          .stats-grid{grid-template-columns:1fr 1fr!important;}
          .cats-grid{grid-template-columns:1fr 1fr!important;}
        }

        /* ── Hero orb ── */
        @keyframes orb-pulse{0%,100%{opacity:.07;transform:scale(1);}50%{opacity:.15;transform:scale(1.1);}}
        .hero-orb{animation:orb-pulse 5s ease-in-out infinite;}

        /* ── Línea hero ── */
        @keyframes line-grow{from{transform:scaleY(0);}to{transform:scaleY(1);}}
        .hero-line{animation:line-grow 1.4s cubic-bezier(.22,1,.36,1) .8s both;transform-origin:top;}

        /* ── Wave SVG divider ── */
        .wave-top{margin-bottom:-2px;}
        .wave-bottom{margin-top:-2px;}

        /* ── Glow ring animado ── */
        @keyframes ring-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .ring-spin{animation:ring-spin 12s linear infinite;}

        /* ── Testimonial mouse spotlight ── */
        .testimonial-wow:hover::after{opacity:1;}

        /* ── Home categories carousel ── */
        @keyframes text-pan{0%{background-position:0% center;}100%{background-position:200% center;}}
        @keyframes progress-fill{from{width:0%;}to{width:100%;}}
        .hcat-card{position:relative;overflow:hidden;border-radius:20px;cursor:pointer;flex:0 0 auto;animation:hcat-in .55s cubic-bezier(.34,1.2,.64,1) both;}
        .hcat-card:hover{transform:translateY(-8px) scale(1.02);}
        .hcat-card:hover .hcat-img{transform:scale(1.08);}
        .hcat-card::before{content:'';position:absolute;top:0;left:-120%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transform:skewX(-18deg);pointer-events:none;z-index:7;}
        .hcat-card:hover::before{animation:card-shine .75s ease forwards;}
        .hcat-img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94);}
        .hcat-active{animation:glow-pulse 2.5s ease-in-out infinite!important;}
        .carousel-track{display:flex;align-items:center;transition:transform .6s cubic-bezier(.25,.46,.45,.94);}
        @media(max-width:768px){
          .hcat-card{width:220px!important;height:300px!important;}
        }
      `}</style>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', background:'#0d0c0b', overflow:'hidden' }}>

        {/* Imagen parallax */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85" alt=""
            style={{ width:'100%', height:'110%', objectFit:'cover', objectPosition:'center top', opacity:0.3,
              transform:`translateY(${scrollY * 0.22}px)`, willChange:'transform' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(13,12,11,.97) 0%,rgba(33,31,30,.75) 50%,rgba(13,12,11,.92) 100%)' }} />
        </div>

        {/* Rayos de luz — reducido */}
        <LightRays dark rayCount={7} />

        {/* Burbujas — reducidas */}
        <BubblesCanvas count={12} dark />

        {/* Orbs CSS */}
        <div className="hero-orb" style={{ position:'absolute', top:'7%', right:'4%', width:'520px', height:'520px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.18)', zIndex:2, pointerEvents:'none' }} />
        <div className="hero-orb" style={{ position:'absolute', top:'13%', right:'10%', width:'340px', height:'340px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.1)', zIndex:2, pointerEvents:'none', animationDelay:'-2.5s' }} />

        {/* Anillo giratorio decorativo */}
        <svg className="ring-spin" style={{ position:'absolute', top:'5%', right:'3%', zIndex:2, pointerEvents:'none', opacity:.06, width:'600px', height:'600px' }} viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="280" fill="none" stroke="url(#rg)" strokeWidth="1" strokeDasharray="8 16" />
          <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c1692b"/><stop offset="100%" stopColor="#e88c4a"/>
          </linearGradient></defs>
        </svg>

        {/* Partículas doradas */}
        {HERO_PARTICLES.map((p, i) => (
          <div key={i} className="particle" style={{
            width:p.size, height:p.size, top:p.top, left:p.left,
            background: i%3===0 ? 'radial-gradient(circle,#fff5e6,#e88c4a)' : i%3===1 ? 'radial-gradient(circle,#e88c4a,#c1692b)' : 'radial-gradient(circle,#c1692b,#a8541f)',
            boxShadow:`0 0 ${p.size*4}px rgba(193,105,43,.9)`,
            animationDuration:p.dur, animationDelay:p.delay, opacity:p.op, zIndex:3,
          }} />
        ))}

        {/* Línea lateral */}
        <div className="hero-line" style={{ position:'absolute', left:'24px', top:'18%', width:'1px', height:'64%', background:'linear-gradient(to bottom,transparent,rgba(193,105,43,.5),transparent)', zIndex:2, pointerEvents:'none' }} />

        {/* Contenido */}
        <div style={{ position:'relative', zIndex:4, maxWidth:'1320px', margin:'0 auto', padding:'120px 32px 80px', width:'100%' }}>
          <div style={{ maxWidth:'740px' }}>

            <div className="hero-badge animate-fadeIn" style={{ marginBottom:'32px' }}>
              <span className="hero-badge-dot" />
              <span style={{ color:'#e88c4a', fontSize:'11px', fontWeight:'700', letterSpacing:'2.5px', textTransform:'uppercase' }}>✦ Nueva Colección 2025 ✦</span>
            </div>

            <h1 className="animate-slide-up" style={{ color:'#fff', fontSize:'clamp(46px,7.5vw,96px)', fontWeight:'900', lineHeight:'.98', marginBottom:'6px', letterSpacing:'-3px', animationDelay:'.1s' }}>
              TU ESTILO,
            </h1>
            <h1 className="text-shimmer animate-slide-up" style={{ fontSize:'clamp(46px,7.5vw,96px)', fontWeight:'900', lineHeight:'.98', marginBottom:'36px', letterSpacing:'-3px', animationDelay:'.22s' }}>
              TU NORTE.
            </h1>

            <p className="animate-slide-up" style={{ color:'rgba(232,229,226,.78)', fontSize:'clamp(16px,2vw,20px)', lineHeight:'1.8', marginBottom:'52px', maxWidth:'520px', animationDelay:'.34s' }}>
              Moda, accesorios y perfumes de calidad premium. Descubre piezas únicas que cuentan tu historia.
            </p>

            <div className="animate-slide-up" style={{ display:'flex', gap:'16px', flexWrap:'wrap', animationDelay:'.46s' }} data-burst>
              <ParticlesBurst />
              <Link href="/tienda" className="btn-liquid" style={{ padding:'18px 44px', borderRadius:'14px', fontSize:'15px', fontWeight:'900' }}
                onClick={fireBurst} onMouseDown={handleRipple}>
                <span className="shine" />
                Explorar colección →
              </Link>
              <Link href="/tienda?cat=perfumes" className="btn-ghost" style={{ padding:'18px 34px', borderRadius:'14px', fontSize:'14px' }}>
                Ver perfumes ✦
              </Link>
            </div>

            {/* Mini stats */}
            <div className="animate-fadeIn" style={{ display:'flex', gap:'48px', marginTop:'68px', flexWrap:'wrap', animationDelay:'.7s' }}>
              {[['500+','Clientes'],['200+','Productos'],['5★','Rating']].map(([v,l]) => (
                <div key={l}>
                  <p style={{ color:'#e88c4a', fontSize:'26px', fontWeight:'900', margin:'0 0 2px', letterSpacing:'-0.5px', textShadow:'0 0 24px rgba(193,105,43,.6)' }}>{v}</p>
                  <p style={{ color:'rgba(232,229,226,.45)', fontSize:'12px', margin:0, letterSpacing:'0.5px' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', zIndex:4 }}>
          <span style={{ color:'rgba(232,229,226,.3)', fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase' }}>SCROLL</span>
          <div className="scroll-indicator-dot" />
          <div className="scroll-indicator-line" />
        </div>
      </section>

            {/* Sin wave separador — la sección del carrusel es oscura como el hero, fluye directo */}

      {/* SKELETON carrusel mientras carga */}
      {homeCategories === undefined && (
        <section style={{ padding:'80px 0 90px', background:'#111009', position:'relative', minHeight:'600px', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#0d0b08,#1a1208,#0f0d0a)' }} />
          <div style={{ position:'relative', zIndex:2, maxWidth:'1320px', margin:'0 auto', padding:'0 32px' }}>
            <div style={{ marginBottom:'60px' }}>
              <div className="skeleton" style={{ width:'180px', height:'14px', marginBottom:'18px', borderRadius:8, background:'rgba(193,105,43,.1)' }} />
              <div className="skeleton" style={{ width:'320px', height:'52px', marginBottom:'12px', borderRadius:8, background:'rgba(193,105,43,.08)' }} />
              <div className="skeleton" style={{ width:'240px', height:'52px', borderRadius:8, background:'rgba(193,105,43,.08)' }} />
            </div>
            <div style={{ display:'flex', gap:'24px', paddingBottom:'20px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width:'300px', height:'390px', flexShrink:0, borderRadius:20, background:'rgba(193,105,43,.06)', border:'1px solid rgba(193,105,43,.08)', transform:`scale(${i===1?1:.88})` }}>
                  <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,rgba(193,105,43,.04),transparent)', borderRadius:20 }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORÍAS GRID - solo si NO hay homeCategories pero sí hay dbCategories */}
      {(!homeCategories || homeCategories.length === 0) && dbCategories !== null && dbCategories !== undefined && dbCategories.length > 0 && (
        <section style={{ padding:'80px 32px 100px', background:'#fff', position:'relative', overflow:'hidden' }}>
          <div className="aurora-blob animate-aurora-1" style={{ width:'500px', height:'500px', top:'-150px', left:'-100px', background:'radial-gradient(circle,rgba(193,105,43,.18),rgba(232,140,74,.08))' }} />
          <div className="aurora-blob animate-aurora-2" style={{ width:'400px', height:'400px', bottom:'-100px', right:'-80px', background:'radial-gradient(circle,rgba(232,140,74,.15),rgba(193,105,43,.05))' }} />
          <div className="aurora-blob animate-aurora-3" style={{ width:'300px', height:'300px', top:'40%', left:'40%', background:'radial-gradient(circle,rgba(255,200,100,.12),transparent)' }} />
          {FLOAT_ICONS.map((ic, i) => (
            <span key={i} className="float-icon" style={{ top:`${10 + (i*12)%80}%`, left:`${5 + (i*15)%90}%`, animationDuration:`${5 + i}s`, animationDelay:`${i*0.6}s`, color:'#c1692b' }}>{ic}</span>
          ))}
          <div style={{ maxWidth:'1320px', margin:'0 auto', position:'relative', zIndex:2 }}>
            <motion.div
              initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-60px' }}
              transition={{ duration:.7, ease:[.25,.46,.45,.94] }}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'52px', flexWrap:'wrap', gap:'20px' }}
            >
              <div>
                <p className="section-label" style={{ marginBottom:'12px' }}>Categorías</p>
                <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:'900', color:'#211f1e', letterSpacing:'-1.5px', lineHeight:'1.05' }}>
                  Encuentra tu<br />estilo perfecto
                </h2>
              </div>
              <Link href="/tienda" style={{ color:'#c1692b', textDecoration:'none', fontWeight:'800', fontSize:'14px', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'0.5px', padding:'12px 20px', borderRadius:'12px', border:'2px solid rgba(193,105,43,.25)', transition:'all .2s', background:'rgba(193,105,43,.04)' }}>
                Ver todo el catálogo →
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-60px' }}
              transition={{ duration:.8, delay:.12, ease:[.25,.46,.45,.94] }}
              style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr', gridTemplateRows:'300px 300px', gap:'16px' }}
              className="cats-grid"
            >
              {dbCategories.slice(0,5).map((cat, i) => (
                <Link key={cat.id} href={`/tienda?cat=${cat.id}`} style={{ textDecoration:'none', gridRow:i===0?'span 2':undefined }} className="cat-item">
                  {cat.image
                    ? <img src={cat.image} alt={cat.label} /> // eslint-disable-line @next/next/no-img-element
                    : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a1208,#2d1e0e)' }} />
                  }
                  <div className="cat-overlay" />
                  <div style={{ position:'absolute', top:0, right:0, width:'100px', height:'100px', background:'radial-gradient(circle at top right,rgba(232,140,74,.25),transparent 70%)', pointerEvents:'none', zIndex:2 }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'24px 22px', zIndex:3 }}>
                    <p style={{ color:'rgba(255,255,255,.5)', fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:'4px' }}>Colección</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <p style={{ color:'#fff', fontWeight:'900', fontSize:i===0?'30px':'20px', letterSpacing:'-0.5px', margin:0, textShadow:'0 2px 12px rgba(0,0,0,.5)' }}>{cat.label}</p>
                      <span className="cat-arrow" style={{ color:'#e88c4a', fontSize:'24px', fontWeight:'900', textShadow:'0 0 12px rgba(232,140,74,.8)' }}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Wave divider blanco→crema - solo si se muestra el grid (sin homeCategories) */}
      {(!homeCategories || homeCategories?.length === 0) && dbCategories !== null && dbCategories !== undefined && dbCategories.length > 0 && (
        <div style={{ background:'#fff', marginBottom:'-2px' }}>
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
            <path d="M0,20 C480,60 960,-10 1440,20 L1440,50 L0,50 Z" fill="#f9f7f5"/>
          </svg>
        </div>
      )}

      {/* CARRUSEL CATEGORÍAS DESTACADAS */}
      {homeCategories !== undefined && homeCategories !== null && homeCategories.length > 0 && (
        <>
          <section style={{ padding:'0', background:'#111009', position:'relative', overflow:'hidden', minHeight:'600px' }}>

            {/* ── Fondo atmosférico oscuro ── */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#0d0b08 0%,#1a1208 40%,#0f0d0a 100%)', zIndex:0 }} />
            <LightRays dark rayCount={6} />
            <BubblesCanvas count={10} dark />
            <div style={{ position:'absolute', top:'10%', left:'5%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(193,105,43,.15),transparent 70%)', pointerEvents:'none', zIndex:1 }} />
            <div style={{ position:'absolute', bottom:'-10%', right:'0%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(232,140,74,.08),transparent 65%)', pointerEvents:'none', zIndex:1 }} />

            {/* ── Texto de fondo gigante decorativo ── */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'clamp(80px,15vw,200px)', fontWeight:'900', letterSpacing:'-0.05em', color:'rgba(193,105,43,.04)', whiteSpace:'nowrap', pointerEvents:'none', zIndex:1, userSelect:'none', lineHeight:1 }}>
              COLECCIONES
            </div>

            {/* ── Línea superior decorativa ── */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(232,140,74,.4),transparent)', zIndex:2 }} />

            <div style={{ position:'relative', zIndex:3, padding:'80px 0 90px' }}>

              {/* ── Header ── */}
              <div style={{ maxWidth:'1320px', margin:'0 auto', padding:'0 32px' }}>
                <motion.div
                  initial={{ opacity:0, y:40 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true, margin:'-80px' }}
                  transition={{ duration:.8, ease:[.25,.46,.45,.94] }}
                  style={{
                    display:'flex', justifyContent:'space-between', alignItems:'flex-end',
                    marginBottom:'60px', flexWrap:'wrap', gap:'24px',
                  }}
                >
                  {/* Título izquierda */}
                  <div>
                    {/* Etiqueta pill */}
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:100, background:'rgba(193,105,43,.12)', border:'1px solid rgba(193,105,43,.25)', marginBottom:18 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#e88c4a', boxShadow:'0 0 8px rgba(232,140,74,.8)', animation:'orb-pulse 2s ease-in-out infinite' }} />
                      <span style={{ color:'#e88c4a', fontSize:'11px', fontWeight:'800', letterSpacing:'2.5px', textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>Explorar colecciones</span>
                    </div>
                    <h2 style={{ fontSize:'clamp(32px,4.5vw,58px)', fontWeight:'900', color:'#fff', letterSpacing:'-2px', lineHeight:'1.0', margin:0 }}>
                      Encuentra tu<br />
                      <span style={{ background:'linear-gradient(90deg,#e88c4a,#c1692b,#e88c4a)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', animation:'text-pan 3s linear infinite' }}>
                        estilo perfecto
                      </span>
                    </h2>
                  </div>

                  {/* Controles derecha */}
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <button aria-label="Anterior"
                      onClick={() => { if(homeCategories) { advance(-1, homeCategories); resetAutoplay() } }}
                      style={{ width:52, height:52, borderRadius:'50%', border:'1px solid rgba(232,140,74,.3)', background:'rgba(232,140,74,.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:'#e88c4a', transition:'all .25s', outline:'none', backdropFilter:'blur(8px)' }}>
                      ←
                    </button>
                    <button aria-label="Siguiente"
                      onClick={() => { if(homeCategories) { advance(1, homeCategories); resetAutoplay() } }}
                      style={{ width:52, height:52, borderRadius:'50%', border:'1px solid rgba(232,140,74,.3)', background:'rgba(232,140,74,.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:'#e88c4a', transition:'all .25s', outline:'none', backdropFilter:'blur(8px)',
                        transform: carouselClickAnim ? 'scale(0.82)' : 'scale(1)',
                        boxShadow: carouselClickAnim ? '0 0 0 4px rgba(232,140,74,.35), 0 0 20px rgba(193,105,43,.5)' : 'none',
                      }}>
                      →
                    </button>
                    <Link href="/tienda" style={{ color:'#fff', textDecoration:'none', fontWeight:'700', fontSize:'13px', padding:'13px 22px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(193,105,43,.8),rgba(232,140,74,.6))', border:'1px solid rgba(232,140,74,.4)', letterSpacing:'0.3px', backdropFilter:'blur(8px)', boxShadow:'0 4px 20px rgba(193,105,43,.3)' }}>
                      Ver todo el catálogo →
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* ── Track del carrusel — Framer Motion ── */}
              <div style={{ overflow:'hidden', position:'relative' }}>
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'120px', background:'linear-gradient(to right,#111009,transparent)', zIndex:4, pointerEvents:'none' }} />
                <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'120px', background:'linear-gradient(to left,#111009,transparent)', zIndex:4, pointerEvents:'none' }} />

                <div style={{
                  display: 'flex',
                  gap: '24px',
                  paddingLeft: 'max(40px, calc((100vw - 1320px) / 2 + 40px))',
                  paddingRight: '40px',
                  paddingTop: '40px',
                  paddingBottom: '40px',
                }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {rotated(homeCategories, carouselOffset).map((cat, i) => {
                      const isActive = i === 0
                      const gradients = ['linear-gradient(145deg,#2d1a06,#4a2e10)','linear-gradient(145deg,#0d1528,#1a2540)','linear-gradient(145deg,#0a2010,#143520)','linear-gradient(145deg,#200815,#3a1228)']
                      return (
                        <motion.div
                          key={cat.id}
                          layout
                          initial={{
                            x: carouselDir === 1 ? 180 : -180,
                            scale: 0.6,
                            opacity: 0,
                            rotateY: carouselDir === 1 ? 35 : -35,
                            filter: 'brightness(0.3)',
                          }}
                          animate={{
                            x: 0,
                            scale: isActive ? 1.1 : Math.max(0.78, 1 - i * 0.055),
                            opacity: 1,
                            y: isActive ? -14 : 0,
                            rotateY: 0,
                            filter: `brightness(${isActive ? 1 : Math.max(0.4, 1 - i * 0.14)})`,
                          }}
                          exit={{
                            x: carouselDir === 1 ? -160 : 160,
                            scale: 0.55,
                            opacity: 0,
                            rotateY: carouselDir === 1 ? -30 : 30,
                            filter: 'brightness(0.2)',
                            transition: { duration: 0.35, ease: [0.4, 0, 0.6, 1] },
                          }}
                          transition={{
                            duration: 0.65,
                            delay: i * 0.06,
                            ease: [0.34, 1.4, 0.64, 1], // spring-like overshoot
                            scale:  { duration: 0.55, ease: [0.34, 1.4, 0.64, 1] },
                            filter: { duration: 0.5, ease: 'easeOut' },
                            rotateY: { duration: 0.55, ease: [0.34, 1.2, 0.64, 1] },
                            layout: { duration: 0.5, ease: [0.34, 1.2, 0.64, 1] },
                          }}
                          style={{
                            width: '300px', height: '390px', flexShrink: 0,
                            borderRadius: 20, overflow: 'hidden', position: 'relative',
                            cursor: 'pointer', perspective: 800,
                            boxShadow: isActive
                              ? '0 0 0 2px rgba(232,140,74,.5),0 24px 60px rgba(0,0,0,.7),0 0 60px rgba(193,105,43,.3)'
                              : '0 8px 32px rgba(0,0,0,.5)',
                            zIndex: isActive ? 3 : Math.max(1, 6 - i),
                          }}
                          whileHover={isActive ? {
                            scale: 1.14,
                            y: -20,
                            boxShadow: '0 0 0 2px rgba(232,140,74,.7),0 32px 80px rgba(0,0,0,.8),0 0 80px rgba(193,105,43,.5)',
                            transition: { duration: 0.3, ease: 'easeOut' }
                          } : {
                            scale: Math.max(0.78, 1 - i * 0.055) + 0.04,
                            transition: { duration: 0.25 }
                          }}
                        >
                          <Link href={`/tienda?cat=${cat.id}`} style={{ display:'block', width:'100%', height:'100%', textDecoration:'none' }}>
                            {cat.image
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={cat.image} alt={cat.label} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .7s ease',transform:isActive?'scale(1.05)':'scale(1.1)'}} />
                              : <div style={{width:'100%',height:'100%',background:gradients[i%gradients.length]}} />
                            }
                            {/* Overlays */}
                            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,4,3,1) 0%,rgba(5,4,3,.6) 40%,rgba(5,4,3,.05) 70%,transparent 100%)',zIndex:1}} />
                            {isActive && <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 20%,rgba(232,140,74,.15),transparent 65%)',zIndex:2}} />}
                            {isActive && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,rgba(232,140,74,.9) 50%,transparent)',zIndex:5,boxShadow:'0 0 20px rgba(232,140,74,.8)'}} />}
                            {/* Número */}
                            <motion.div
                              style={{position:'absolute',top:16,right:16,zIndex:6,width:30,height:30,borderRadius:'50%',background:'rgba(5,4,3,.75)',backdropFilter:'blur(10px)',border:`1px solid ${isActive?'rgba(232,140,74,.5)':'rgba(232,140,74,.15)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}
                              animate={{ borderColor: isActive ? 'rgba(232,140,74,.5)' : 'rgba(232,140,74,.15)', boxShadow: isActive ? '0 0 12px rgba(232,140,74,.4)' : '0 0 0px transparent' }}
                              transition={{ duration: 0.4 }}
                            >
                              <span style={{color:isActive?'#e88c4a':'rgba(232,140,74,.3)',fontSize:'10px',fontWeight:'900',fontFamily:'var(--font-mono)'}}>{String(((carouselOffset + i) % homeCategories.length) + 1).padStart(2,'0')}</span>
                            </motion.div>
                            {/* Badge activo */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  initial={{ opacity:0, scale:0.5, y:-8 }}
                                  animate={{ opacity:1, scale:1, y:0 }}
                                  exit={{ opacity:0, scale:0.5, y:-8 }}
                                  transition={{ duration:0.35, ease:[0.34,1.4,0.64,1] }}
                                  style={{position:'absolute',top:16,left:16,zIndex:6,display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:'100px',background:'linear-gradient(135deg,rgba(193,105,43,.95),rgba(232,140,74,.9))',boxShadow:'0 4px 20px rgba(193,105,43,.6)'}}
                                >
                                  <div style={{width:4,height:4,borderRadius:'50%',background:'#fff',animation:'orb-pulse 1.5s infinite'}} />
                                  <span style={{color:'#fff',fontSize:'9px',fontWeight:'900',letterSpacing:'2px',fontFamily:'var(--font-mono)'}}>DESTACADA</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {/* Contenido inferior */}
                            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:isActive?'28px 22px':'20px 18px',zIndex:4}}>
                              <p style={{color:'rgba(232,140,74,.55)',fontSize:'9px',letterSpacing:'2.5px',textTransform:'uppercase',margin:'0 0 7px',fontFamily:'var(--font-mono)'}}>Colección ✦</p>
                              <motion.p
                                layout="position"
                                style={{color:'#fff',fontWeight:'900',fontSize:isActive?'24px':'16px',letterSpacing:'-0.5px',margin:'0 0 10px',textShadow:'0 2px 16px rgba(0,0,0,.9)',lineHeight:1.05}}
                                animate={{ fontSize: isActive ? '24px' : '16px' }}
                                transition={{ duration: 0.4 }}
                              >{cat.label}</motion.p>
                              <AnimatePresence>
                                {isActive && (
                                  <motion.div
                                    initial={{ opacity:0, y:12 }}
                                    animate={{ opacity:1, y:0 }}
                                    exit={{ opacity:0, y:8 }}
                                    transition={{ duration:0.4, delay:0.15, ease:'easeOut' }}
                                    style={{display:'flex',alignItems:'center',gap:8}}
                                  >
                                    <div style={{height:'1px',width:'20px',background:'linear-gradient(to right,#e88c4a,transparent)'}} />
                                    <span style={{color:'#e88c4a',fontSize:'12px',fontWeight:'800'}}>Ver colección</span>
                                    <motion.span
                                      animate={{ x: [0, 6, 0] }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                                      style={{color:'#e88c4a',fontSize:'15px',fontWeight:'900',display:'inline-block'}}
                                    >→</motion.span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Dots + contador + barra progreso ── */}
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'16px', marginTop:'40px', padding:'0 32px' }}>
                <span style={{ color:'rgba(232,140,74,.4)', fontSize:'11px', fontFamily:'var(--font-mono)', fontWeight:'700' }}>0{carouselOffset + 1}</span>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  {(homeCategories ?? []).map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => { setCarouselOffset(i); resetAutoplay() }}
                      aria-label={`Categoría ${i + 1}`}
                      animate={{ width: i === carouselOffset ? 32 : 6, background: i === carouselOffset ? '#c1692b' : 'rgba(232,140,74,.2)' }}
                      transition={{ duration: 0.4, ease: [0.34,1.3,0.64,1] }}
                      style={{ height: '6px', borderRadius: '100px', border: 'none', cursor: 'pointer', padding: 0, boxShadow: i === carouselOffset ? '0 0 12px rgba(193,105,43,.6)' : 'none' }}
                    />
                  ))}
                </div>
                <span style={{ color:'rgba(232,140,74,.4)', fontSize:'11px', fontFamily:'var(--font-mono)', fontWeight:'700' }}>0{homeCategories?.length ?? 0}</span>
              </div>

              {/* Barra de progreso autoplay */}
              <div style={{ maxWidth:'200px', margin:'16px auto 0', height:'2px', borderRadius:'100px', background:'rgba(232,140,74,.12)', overflow:'hidden' }}>
                <motion.div
                  key={carouselOffset}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                  style={{
                    height:'100%', borderRadius:'100px',
                    background:'linear-gradient(90deg,#c1692b,#e88c4a)',
                    boxShadow:'0 0 6px rgba(193,105,43,.6)',
                  }}
                />
              </div>

            </div>

            {/* ── Línea inferior ── */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(232,140,74,.3),transparent)', zIndex:2 }} />
          </section>

          {/* Wave oscuro→crema al salir del carrusel */}
          <div style={{ background:'#111009', marginBottom:'-2px' }}>
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
              <path d="M0,20 C480,60 960,-10 1440,20 L1440,50 L0,50 Z" fill="#f9f7f5"/>
            </svg>
          </div>
        </>
      )}

      {/* PRODUCTOS DESTACADOS - visible si carga o si hay productos */}
      {(!featuredLoaded || featured.length > 0) && (
        <section style={{ padding:'100px 32px', background:'#f9f7f5', position:'relative', overflow:'hidden' }}>
          <BubblesCanvas count={10} dark={false} />
          <div className="aurora-blob animate-aurora-2" style={{ width:'600px', height:'400px', top:'-80px', right:'-120px', background:'radial-gradient(ellipse,rgba(193,105,43,.1),transparent 70%)' }} />
          <div className="aurora-blob animate-aurora-1" style={{ width:'400px', height:'400px', bottom:'-80px', left:'-60px', background:'radial-gradient(circle,rgba(232,140,74,.08),transparent 70%)' }} />
          <div style={{ maxWidth:'1320px', margin:'0 auto', position:'relative', zIndex:2 }}>
            <motion.div
              initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-60px' }}
              transition={{ duration:.7, ease:[.25,.46,.45,.94] }}
              style={{ textAlign:'center', marginBottom:'60px' }}
            >
              <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Selección premium</p>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:'900', color:'#211f1e', letterSpacing:'-1.5px', marginBottom:'16px' }}>
                Los más <span className="text-shimmer">vendidos</span>
              </h2>
              <p style={{ color:'#7a7675', fontSize:'16px', maxWidth:'440px', margin:'0 auto', lineHeight:'1.7' }}>
                Piezas elegidas por cientos de clientes satisfechos en todo Venezuela.
              </p>
            </motion.div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:'24px' }}>
              {!featuredLoaded
                ? Array.from({length:4}).map((_,i) => (
                    <div key={i} style={{ borderRadius:'14px', overflow:'hidden', background:'#fff', boxShadow:'0 2px 20px rgba(33,31,30,.07)' }}>
                      <div className="skeleton" style={{ aspectRatio:'3/4', borderRadius:0 }} />
                      <div style={{ padding:'16px' }}>
                        <div className="skeleton" style={{ height:'12px', width:'40%', marginBottom:'8px' }} />
                        <div className="skeleton" style={{ height:'16px', width:'80%', marginBottom:'12px' }} />
                        <div className="skeleton" style={{ height:'22px', width:'35%' }} />
                      </div>
                    </div>
                  ))
                : featured.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity:0, y:36, scale:.96 }}
                      whileInView={{ opacity:1, y:0, scale:1 }}
                      viewport={{ once:true, margin:'-40px' }}
                      transition={{ duration:.6, delay:i*0.08, ease:[.34,1.2,.64,1] }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
              }
            </div>
            <div style={{ textAlign:'center', marginTop:'56px' }} data-burst>
              <ParticlesBurst />
              <Link href="/tienda" className="btn-liquid" style={{ padding:'17px 56px', borderRadius:'14px', fontSize:'15px', fontWeight:'900' }} onClick={fireBurst} onMouseDown={handleRipple}>
                <span className="shine" />
                Ver toda la tienda ✦
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Wave divider crema→oscuro - solo si hay productos */}
      {(!featuredLoaded || featured.length > 0) && (
        <div style={{ background:'#f9f7f5', marginBottom:'-2px' }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
            <path d="M0,0 C360,60 1080,0 1440,50 L1440,60 L0,60 Z" fill="#211f1e"/>
          </svg>
        </div>
      )}

      {/* BANNER PROMOCIONAL — solo si hay un banner activo en la DB */}
      {activeBanner && (
      <section className="promo-strip" style={{ position:'relative' }}>
        <div style={{ background:'#211f1e', padding:'80px 60px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          <LightRays dark rayCount={5} />
          <BubblesCanvas count={8} dark />
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'300px', height:'300px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.12)', pointerEvents:'none', zIndex:2 }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle,rgba(193,105,43,.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:2 }} />
          <div style={{ position:'relative', zIndex:3 }}>
            {activeBanner.etiqueta && (
              <p className="section-label" style={{ marginBottom:'18px' }}>{activeBanner.etiqueta}</p>
            )}
            <motion.h2
              initial={{ opacity:0, x:-36 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true, margin:'-60px' }}
              transition={{ duration:.8, ease:[.25,.46,.45,.94] }}
              style={{ color:'#fff', fontSize:'clamp(28px,3.5vw,50px)', fontWeight:'900', letterSpacing:'-1.5px', lineHeight:'1.05', marginBottom:'18px' }}
            >
              {activeBanner.titulo}
              {activeBanner.subtitulo && <><br /><span className="text-shimmer">{activeBanner.subtitulo}</span></>}
            </motion.h2>
            {activeBanner.descripcion && (
              <p style={{ color:'rgba(232,229,226,.6)', lineHeight:'1.8', marginBottom:'40px', fontSize:'15px', maxWidth:'340px' }}>
                {activeBanner.descripcion}
              </p>
            )}
            <div data-burst style={{ position:'relative', width:'fit-content' }}>
              <ParticlesBurst />
              <Link href={activeBanner.linkUrl} className="btn-liquid" style={{ padding:'16px 36px', borderRadius:'14px', fontSize:'14px', fontWeight:'900' }}
                onClick={fireBurst} onMouseDown={handleRipple}>
                <span className="shine" />
                {activeBanner.linkTexto}
              </Link>
            </div>
          </div>
        </div>

        {/* Derecha — imagen */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:'400px' }}>
          {activeBanner.imagen ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={activeBanner.imagen} alt={activeBanner.titulo}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .9s ease' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', minHeight:'400px', background:'linear-gradient(135deg,#1a1208,#2d1e0e)' }} />
          )}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(33,31,30,.45) 0%,transparent 55%)' }} />
          {activeBanner.precioDesde && (
            <div style={{ position:'absolute', bottom:'32px', left:'32px', background:'rgba(33,31,30,.9)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:'16px', padding:'18px 28px', boxShadow:'0 8px 32px rgba(0,0,0,.4)' }}>
              <p style={{ color:'rgba(232,229,226,.65)', fontSize:'10px', letterSpacing:'2px', margin:'0 0 4px', textTransform:'uppercase' }}>DESDE</p>
              <p style={{ color:'#fff', fontSize:'32px', fontWeight:'900', margin:0, letterSpacing:'-1px' }}>$<span className="text-shimmer">{activeBanner.precioDesde.toFixed(2)}</span></p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Wave divider oscuro→oscuro-stats */}
      <div style={{ background:'#211f1e', marginBottom:'-2px' }}>
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
          <path d="M0,20 C720,-20 720,60 1440,20 L1440,40 L0,40 Z" fill="#1a1817"/>
        </svg>
      </div>

      {/* ════════════════════════════════
          STATS — sección MUY OSCURA
      ════════════════════════════════ */}
      <section style={{ background:'#1a1817', padding:'80px 32px 100px', position:'relative', overflow:'hidden' }}>

        <LightRays dark rayCount={8} />
        <BubblesCanvas count={12} dark />

        {/* Aurora oscura */}
        <div className="aurora-blob-dark animate-aurora-1" style={{ width:'700px', height:'400px', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'radial-gradient(ellipse,rgba(193,105,43,.12),transparent 70%)' }} />

        <div style={{ maxWidth:'1320px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ textAlign:'center', marginBottom:'52px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Números reales</p>
            <motion.h2
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-60px' }}
              transition={{ duration:.7, ease:[.25,.46,.45,.94] }}
              style={{ color:'#fff', fontSize:'clamp(24px,3.5vw,42px)', fontWeight:'900', letterSpacing:'-1px' }}
            >
              La confianza de nuestros <span className="neon-copper">clientes</span>
            </motion.h2>
          </div>

          <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }}>
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:32, scale:.93 }}
                whileInView={{ opacity:1, y:0, scale:1 }}
                viewport={{ once:true, margin:'-40px' }}
                transition={{ duration:.7, delay:i*0.13, ease:[.34,1.3,.64,1] }}
                className="stat-card"
              >
                <div style={{ fontSize:'32px', marginBottom:'12px', filter:'drop-shadow(0 0 8px rgba(193,105,43,.5))' }}>{s.icon}</div>
                <p style={{
                  fontSize:'clamp(34px,4.5vw,52px)', fontWeight:'900', letterSpacing:'-2px',
                  margin:'0 0 8px', background:'linear-gradient(135deg,#fff5e6 0%,#e88c4a 40%,#c1692b 100%)',
                  WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent',
                  filter:'drop-shadow(0 0 10px rgba(193,105,43,.5))',
                }}>
                  <AnimatedNumber target={s.value} suffix={s.suffix} />
                </p>
                <p style={{ color:'rgba(232,229,226,.45)', fontSize:'13px', letterSpacing:'0.5px', margin:0 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider oscuro→blanco */}
      <div style={{ background:'#1a1817', marginBottom:'-2px' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
          <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 Z" fill="#ffffff"/>
        </svg>
      </div>

      {/* ════════════════════════════════
          TESTIMONIOS — sección BLANCA con aurora
      ════════════════════════════════ */}
      <section style={{ padding:'100px 32px', background:'#fff', position:'relative', overflow:'hidden' }}>

        {/* Solo burbujas en testimonios */}
        <BubblesCanvas count={10} dark={false} />

        {/* Blobs aurora */}
        <div className="aurora-blob animate-aurora-3" style={{ width:'600px', height:'600px', top:'-200px', right:'-150px', background:'radial-gradient(circle,rgba(193,105,43,.12),rgba(255,200,100,.06),transparent 70%)' }} />
        <div className="aurora-blob animate-aurora-1" style={{ width:'400px', height:'400px', bottom:'-100px', left:'-100px', background:'radial-gradient(circle,rgba(232,140,74,.1),transparent 70%)' }} />

        {/* Iconos flotantes */}
        {['★','✦','◆','★','✧','◇'].map((ic, i) => (
          <span key={i} className="float-icon" style={{
            top:`${15+(i*14)%70}%`, left:`${8+(i*17)%85}%`,
            animationDuration:`${4+i*1.2}s`, animationDelay:`${i*0.5}s`,
            color:'#c1692b', fontSize:'20px',
          }}>{ic}</span>
        ))}

        <div style={{ maxWidth:'1320px', margin:'0 auto', position:'relative', zIndex:2 }}>
          <motion.div
            initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-60px' }}
            transition={{ duration:.7, ease:[.25,.46,.45,.94] }}
            style={{ textAlign:'center', marginBottom:'60px' }}
          >
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Testimonios reales</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:'900', color:'#211f1e', letterSpacing:'-1.5px' }}>
              Lo dicen nuestros <span className="text-shimmer">clientes</span>
            </h2>
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'28px' }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:36, rotate: i%2===0 ? -1 : 1 }}
                whileInView={{ opacity:1, y:0, rotate:0 }}
                viewport={{ once:true, margin:'-40px' }}
                transition={{ duration:.7, delay:i*0.15, ease:[.34,1.2,.64,1] }}
                className="testimonial-wow glow-card"
              >
                <div style={{ display:'flex', gap:'2px', marginBottom:'16px' }}>
                  {Array.from({length:t.stars}).map((_,s) => (
                    <span key={s} style={{ color:'#c1692b', fontSize:'18px', filter:'drop-shadow(0 0 6px rgba(193,105,43,.7))' }}>★</span>
                  ))}
                </div>
                <p style={{ color:'#393738', lineHeight:'1.85', fontSize:'15px', marginBottom:'24px', fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{
                    width:'46px', height:'46px', borderRadius:'50%',
                    background:'linear-gradient(135deg,#fff5e6,#e88c4a,#c1692b)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#fff', fontWeight:'900', fontSize:'17px', flexShrink:0,
                    boxShadow:'0 4px 16px rgba(193,105,43,.45)',
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:'800', color:'#211f1e', fontSize:'14px' }}>{t.name}</p>
                    <p style={{ margin:0, fontSize:'12px', color:'#7a7675' }}>{t.city}, Venezuela ✓</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div style={{ background:'#fff', marginBottom:'-2px' }}>
        <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" style={{ display:'block', width:'100%' }}>
          <path d="M0,35 C360,70 1080,0 1440,35 L1440,70 L0,70 Z" fill="#0d0c0b"/>
        </svg>
      </div>

      {/* ════════════════════════════════
          CTA FINAL — sección NEGRA
      ════════════════════════════════ */}
      <section style={{ position:'relative', padding:'120px 32px', background:'#0d0c0b', overflow:'hidden', textAlign:'center' }}>

        <LightRays dark rayCount={9} />
        <BubblesCanvas count={14} dark />

        <div style={{ position:'absolute', inset:0, zIndex:1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80" alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.1 }} />
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(193,105,43,.2) 0%,transparent 65%)' }} />
        </div>

        {/* Anillo giratorio grande */}
        <svg className="ring-spin" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1, pointerEvents:'none', opacity:.05, width:'90vw', maxWidth:'800px' }} viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="380" fill="none" stroke="url(#rg2)" strokeWidth="1" strokeDasharray="12 20" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="url(#rg2)" strokeWidth="0.5" strokeDasharray="6 12" />
          <defs><linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c1692b"/><stop offset="100%" stopColor="#e88c4a"/>
          </linearGradient></defs>
        </svg>

        {/* Partículas CTA */}
        {HERO_PARTICLES.slice(0,6).map((p,i) => (
          <div key={i} className="particle" style={{
            width:p.size, height:p.size, top:p.top, left:p.left, zIndex:2,
            background:'radial-gradient(circle,#e88c4a,#c1692b)',
            boxShadow:`0 0 ${p.size*4}px rgba(193,105,43,.8)`,
            animationDuration:p.dur, animationDelay:p.delay, opacity:p.op*.75,
          }} />
        ))}

        <div style={{
          position:'relative', zIndex:3, maxWidth:'660px', margin:'0 auto',
        }}>
          <motion.div
            initial={{ opacity:0, y:36 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-60px' }}
            transition={{ duration:.9, ease:[.22,1,.36,1] }}
          >
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'22px' }}>✦ Comunidad Punto Norte ✦</p>
          <h2 style={{ color:'#fff', fontSize:'clamp(32px,5.5vw,60px)', fontWeight:'900', letterSpacing:'-2px', lineHeight:'1.05', marginBottom:'22px' }}>
            Únete y recibe<br /><span className="text-shimmer">descuentos exclusivos</span>
          </h2>
          <p style={{ color:'rgba(232,229,226,.6)', fontSize:'17px', lineHeight:'1.8', marginBottom:'48px', maxWidth:'480px', margin:'0 auto 48px' }}>
            Sé el primero en conocer nuevas llegadas, ofertas especiales y contenido exclusivo vía WhatsApp.
          </p>

          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }} data-burst>
            <ParticlesBurst />
            <a href="https://wa.me/584140906768?text=Hola%2C%20quiero%20recibir%20novedades%20de%20Punto%20Norte"
              target="_blank" rel="noopener noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:'10px',
                background:'linear-gradient(135deg,#1ebe5d,#25d366,#1ebe5d)', backgroundSize:'200%',
                animation:'copper-flow 4s ease infinite',
                color:'#fff', padding:'18px 44px', borderRadius:'14px',
                textDecoration:'none', fontWeight:'900', fontSize:'15px',
                boxShadow:'0 8px 32px rgba(37,211,102,.45), 0 0 0 0 rgba(37,211,102,.3)',
                transition:'transform .2s, box-shadow .2s',
              }}
              onClick={fireBurst}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-3px) scale(1.02)';(e.currentTarget as HTMLElement).style.boxShadow='0 16px 44px rgba(37,211,102,.55)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(37,211,102,.45)'}}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Unirme por WhatsApp
            </a>
            <Link href="/tienda" className="btn-ghost" style={{ padding:'18px 36px', borderRadius:'14px', fontSize:'14px', fontWeight:'700' }}>
              Ver catálogo ✦
            </Link>
          </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
