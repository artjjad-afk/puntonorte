'use client'
import Link from 'next/link'
import { ProductCard } from '@/components/ui/ProductCard'
import { getFeatured, categories } from '@/lib/products'
import { useEffect, useRef, useState, useCallback } from 'react'

const testimonials = [
  { name: 'María G.', city: 'Caracas', text: 'Excelente calidad y llegó súper rápido. El vestido quedó perfecto. 100% recomendado.', stars: 5 },
  { name: 'Carlos R.', city: 'Valencia', text: 'La camisa Oxford es de muy buena tela. El servicio por WhatsApp fue muy atento y rápido.', stars: 5 },
  { name: 'Andreína P.', city: 'Maracaibo', text: 'Compré el perfume Rose Élégance y huele increíble. Ya hice mi segundo pedido con ellos.', stars: 5 },
]

const stats = [
  { value: 500, suffix: '+', label: 'Clientes satisfechos' },
  { value: 200, suffix: '+', label: 'Productos disponibles' },
  { value: 5,   suffix: '★', label: 'Calificación promedio' },
  { value: 24,  suffix: 'h', label: 'Atención WhatsApp' },
]

/* Partículas para el hero */
const PARTICLES = [
  { size: 4,  top: '18%', left: '72%', delay: '0s',    dur: '6s',   opacity: 0.6 },
  { size: 6,  top: '35%', left: '85%', delay: '1.2s',  dur: '8s',   opacity: 0.4 },
  { size: 3,  top: '60%', left: '78%', delay: '2.5s',  dur: '7s',   opacity: 0.7 },
  { size: 5,  top: '25%', left: '92%', delay: '0.8s',  dur: '9s',   opacity: 0.3 },
  { size: 4,  top: '75%', left: '68%', delay: '3s',    dur: '6.5s', opacity: 0.5 },
  { size: 7,  top: '50%', left: '88%', delay: '1.8s',  dur: '10s',  opacity: 0.25 },
  { size: 3,  top: '12%', left: '60%', delay: '4s',    dur: '7.5s', opacity: 0.55 },
  { size: 5,  top: '82%', left: '80%', delay: '2s',    dur: '8.5s', opacity: 0.4 },
  { size: 4,  top: '42%', left: '95%', delay: '0.5s',  dur: '6s',   opacity: 0.6 },
  { size: 6,  top: '68%', left: '58%', delay: '3.5s',  dur: '9s',   opacity: 0.35 },
]

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    // rootMargin positivo dispara ANTES de que entre en viewport
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

/* Contador animado */
function AnimatedNumber({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const duration = 1400
    const raf = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, target])
  return <>{current}{suffix}</>
}

export default function HomePage() {
  const [featured, setFeatured] = useState<ReturnType<typeof getFeatured>>([])
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setFeatured(getFeatured()))
  }, [])

  // Parallax suave en el hero
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sec1 = useInView(); const sec2 = useInView()
  const sec3 = useInView(); const sec4 = useInView()
  const sec5 = useInView(); const sec6 = useInView()

  // Forzar visible si ya está en viewport al montar
  useEffect(() => {
    // pequeño delay para asegurar que el DOM está listo
    const t = setTimeout(() => {
      document.querySelectorAll('[data-inview]').forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) {
          el.dispatchEvent(new Event('forceInView'))
        }
      })
    }, 100)
    return () => clearTimeout(t)
  }, [])

  // Efecto ripple en botones
  const handleRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    btn.style.setProperty('--rx', `${e.clientX - rect.left}px`)
    btn.style.setProperty('--ry', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <>
      <style>{`
        .hero-word { display:inline-block; }
        .cat-item { position:relative; overflow:hidden; border-radius:16px; cursor:pointer; }
        .cat-item img { width:100%; height:100%; object-fit:cover; transition:transform .7s cubic-bezier(.25,.46,.45,.94); display:block; }
        .cat-item:hover img { transform:scale(1.1); }
        .cat-item .cat-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(33,31,30,.88) 0%, rgba(33,31,30,.1) 55%, transparent 100%); transition:opacity .35s; }
        .cat-item:hover .cat-overlay { opacity:.92; }
        .cat-item .cat-arrow { opacity:0; transform:translateX(-10px); transition:all .35s cubic-bezier(.34,1.56,.64,1); }
        .cat-item:hover .cat-arrow { opacity:1; transform:translateX(0); }
        /* Shine en cat-item */
        .cat-item::after { content:''; position:absolute; top:0; left:-80%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent); transform:skewX(-20deg); pointer-events:none; }
        .cat-item:hover::after { animation:shine-sweep .7s ease forwards; }

        .stat-card { text-align:center; padding:32px 24px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; backdrop-filter:blur(8px); transition:border-color .3s, box-shadow .3s, transform .3s; }
        .stat-card:hover { border-color:rgba(193,105,43,.5); box-shadow:0 0 32px rgba(193,105,43,.2); transform:translateY(-6px); }

        .promo-strip { display:grid; grid-template-columns:1fr 1fr; min-height:500px; }
        @media(max-width:768px){ .promo-strip{ grid-template-columns:1fr; } .stats-grid{ grid-template-columns:1fr 1fr !important; } .cats-grid{ grid-template-columns:1fr 1fr !important; } }

        /* Orb decorativo animado */
        @keyframes orb-pulse {
          0%,100% { opacity:.06; transform:scale(1); }
          50%      { opacity:.12; transform:scale(1.08); }
        }
        .hero-orb { animation:orb-pulse 5s ease-in-out infinite; }

        /* Línea decorativa hero */
        @keyframes line-grow {
          from { transform:scaleY(0); }
          to   { transform:scaleY(1); }
        }
        .hero-line { animation:line-grow 1.2s cubic-bezier(.22,1,.36,1) .8s both; transform-origin:top; }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', background:'#111010', overflow:'hidden' }}>

        {/* Imagen con parallax */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85"
            alt="hero"
            className="hero-bg-img"
            style={{
              width:'100%', height:'110%', objectFit:'cover',
              objectPosition:'center top', opacity:0.35,
              transform:`translateY(${scrollY * 0.25}px)`,
              willChange:'transform',
            }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(17,16,16,.96) 0%, rgba(33,31,30,.72) 50%, rgba(17,16,16,.88) 100%)' }} />
        </div>

        {/* Orbs decorativos animados */}
        <div className="hero-orb" style={{ position:'absolute', top:'8%', right:'5%', width:'480px', height:'480px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.2)', zIndex:1, pointerEvents:'none' }} />
        <div className="hero-orb" style={{ position:'absolute', top:'14%', right:'11%', width:'320px', height:'320px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.12)', zIndex:1, pointerEvents:'none', animationDelay:'-2s' }} />
        <div style={{ position:'absolute', bottom:'10%', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,105,43,.1) 0%, transparent 70%)', zIndex:1, pointerEvents:'none' }} />

        {/* Partículas flotantes */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: p.size, height: p.size,
              top: p.top, left: p.left,
              background: i % 3 === 0
                ? `radial-gradient(circle, #e88c4a, #c1692b)`
                : i % 3 === 1
                  ? `radial-gradient(circle, #fff5e6, #e88c4a)`
                  : `radial-gradient(circle, #c1692b, #a8541f)`,
              boxShadow: `0 0 ${p.size * 3}px rgba(193,105,43,.8)`,
              animationDuration: p.dur,
              animationDelay: p.delay,
              opacity: p.opacity,
              zIndex: 1,
            }}
          />
        ))}

        {/* Línea vertical decorativa izquierda */}
        <div className="hero-line" style={{ position:'absolute', left:'20px', top:'20%', width:'1px', height:'60%', background:'linear-gradient(to bottom, transparent, rgba(193,105,43,.4), transparent)', zIndex:1, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, maxWidth:'1320px', margin:'0 auto', padding:'120px 32px 80px', width:'100%' }}>
          <div style={{ maxWidth:'720px' }}>

            {/* Badge animado */}
            <div className="hero-badge animate-fadeIn" style={{ marginBottom:'32px' }}>
              <span className="hero-badge-dot" />
              <span style={{ color:'#e88c4a', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase' }}>Nueva Colección 2025</span>
            </div>

            {/* Título con shimmer */}
            <h1
              className="animate-slide-up"
              style={{ color:'#fff', fontSize:'clamp(44px, 7vw, 88px)', fontWeight:'900', lineHeight:'1.0', marginBottom:'8px', letterSpacing:'-2.5px', animationDelay:'.1s' }}
            >
              TU ESTILO,
            </h1>
            <h1
              className="text-shimmer animate-slide-up"
              style={{ fontSize:'clamp(44px, 7vw, 88px)', fontWeight:'900', lineHeight:'1.0', marginBottom:'32px', letterSpacing:'-2.5px', animationDelay:'.22s' }}
            >
              TU NORTE.
            </h1>

            <p
              className="animate-slide-up"
              style={{ color:'rgba(232,229,226,0.75)', fontSize:'clamp(16px, 2vw, 19px)', lineHeight:'1.75', marginBottom:'48px', maxWidth:'500px', animationDelay:'.34s' }}
            >
              Moda, accesorios y perfumes de calidad premium. Descubre piezas únicas que cuentan tu historia.
            </p>

            <div className="animate-slide-up" style={{ display:'flex', gap:'14px', flexWrap:'wrap', animationDelay:'.46s' }}>
              <Link href="/tienda" className="btn-primary" style={{ padding:'17px 40px', borderRadius:'12px', fontSize:'14px', fontWeight:'800' }} onMouseDown={handleRipple}>
                <span className="shine" />
                Explorar colección →
              </Link>
              <Link href="/tienda?cat=perfumes" className="btn-ghost" style={{ padding:'17px 32px', borderRadius:'12px', fontSize:'14px' }}>
                Ver perfumes ✦
              </Link>
            </div>

            {/* Mini stats */}
            <div className="animate-fadeIn" style={{ display:'flex', gap:'40px', marginTop:'64px', flexWrap:'wrap', animationDelay:'.7s' }}>
              {[['500+','Clientes'],['200+','Productos'],['5★','Rating']].map(([v, l]) => (
                <div key={l} style={{ position:'relative' }}>
                  <p style={{ color:'#e88c4a', fontSize:'24px', fontWeight:'900', margin:'0 0 2px', letterSpacing:'-0.5px', textShadow:'0 0 20px rgba(193,105,43,.5)' }}>{v}</p>
                  <p style={{ color:'rgba(232,229,226,0.5)', fontSize:'12px', margin:0, letterSpacing:'0.5px' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', zIndex:2 }} className="scroll-indicator">
          <span style={{ color:'rgba(232,229,226,0.35)', fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase' }}>SCROLL</span>
          <div className="scroll-indicator-dot" />
          <div className="scroll-indicator-line" />
        </div>
      </section>

      {/* ═══ CATEGORÍAS ═══ */}
      <section ref={sec1.ref} style={{ padding:'100px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'flex-end',
            marginBottom:'52px', flexWrap:'wrap', gap:'20px',
            opacity: sec1.inView ? 1 : 0,
            transform: sec1.inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity .7s ease, transform .7s ease',
          }}>
            <div>
              <p className="section-label" style={{ marginBottom:'12px' }}>Categorías</p>
              <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', lineHeight:'1.1' }}>
                Encuentra tu<br />estilo perfecto
              </h2>
            </div>
            <Link href="/tienda" style={{ color:'#c1692b', textDecoration:'none', fontWeight:'700', fontSize:'14px', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'0.5px' }}>
              Ver todo el catálogo <span>→</span>
            </Link>
          </div>

          {/* Grid asimétrico */}
          <div
            style={{
              display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr',
              gridTemplateRows:'300px 300px', gap:'16px',
              opacity: sec1.inView ? 1 : 0,
              transform: sec1.inView ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity .7s ease .2s, transform .7s ease .2s',
            }}
            className="cats-grid"
          >
            {categories.slice(0,5).map((cat, i) => (
              <Link
                key={cat.id}
                href={`/tienda?cat=${cat.id}`}
                style={{
                  textDecoration:'none',
                  gridRow: i === 0 ? 'span 2' : undefined,
                  animationDelay:`${i * 80}ms`,
                }}
                className="cat-item"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.label} />
                <div className="cat-overlay" />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'24px 20px', zIndex:2 }}>
                  <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>Colección</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ color:'#fff', fontWeight:'800', fontSize: i === 0 ? '28px' : '18px', letterSpacing:'-0.5px', margin:0, textShadow:'0 2px 8px rgba(0,0,0,.4)' }}>
                      {cat.label}
                    </p>
                    <span className="cat-arrow" style={{ color:'#e88c4a', fontSize:'22px', fontWeight:'700' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTOS DESTACADOS ═══ */}
      <section ref={sec2.ref} style={{ padding:'100px 32px', background:'#f9f7f5' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div style={{
            textAlign:'center', marginBottom:'56px',
            opacity: sec2.inView ? 1 : 0,
            transform: sec2.inView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity .7s ease, transform .7s ease',
          }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'12px' }}>Selección</p>
            <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', marginBottom:'14px' }}>
              Los más vendidos
            </h2>
            <p style={{ color:'#7a7675', fontSize:'16px', maxWidth:'440px', margin:'0 auto', lineHeight:'1.6' }}>
              Piezas elegidas por cientos de clientes satisfechos en todo Venezuela.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'24px' }}>
            {featured.length === 0 ? (
              /* Skeleton mientras carga */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius:'14px', overflow:'hidden', background:'#fff', boxShadow:'0 2px 20px rgba(33,31,30,.07)' }}>
                  <div className="skeleton" style={{ aspectRatio:'3/4', borderRadius:0 }} />
                  <div style={{ padding:'16px' }}>
                    <div className="skeleton" style={{ height:'12px', width:'40%', marginBottom:'8px' }} />
                    <div className="skeleton" style={{ height:'16px', width:'80%', marginBottom:'12px' }} />
                    <div className="skeleton" style={{ height:'22px', width:'35%' }} />
                  </div>
                </div>
              ))
            ) : (
              featured.map((product, i) => (
                <div
                  key={product.id}
                  style={{
                    opacity: sec2.inView ? 1 : 0,
                    transform: sec2.inView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(.97)',
                    transition: `opacity .6s ease ${i * 80}ms, transform .6s cubic-bezier(.34,1.2,.64,1) ${i * 80}ms`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

          <div style={{ textAlign:'center', marginTop:'52px' }}>
            <Link href="/tienda" className="btn-primary" style={{ padding:'16px 52px', borderRadius:'12px', fontSize:'14px' }} onMouseDown={handleRipple}>
              <span className="shine" />
              Ver toda la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BANNER SPLIT PERFUMES ═══ */}
      <section ref={sec3.ref} className="promo-strip">
        {/* Left — dark */}
        <div style={{ background:'#211f1e', padding:'80px 60px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          {/* Orbs decorativos */}
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', border:'1px solid rgba(193,105,43,.15)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,105,43,.12) 0%, transparent 70%)', pointerEvents:'none' }} />

          <p className="section-label" style={{ marginBottom:'16px' }}>Fragrancias</p>
          <h2
            style={{
              color:'#fff', fontSize:'clamp(28px, 3.5vw, 44px)', fontWeight:'800',
              letterSpacing:'-1px', lineHeight:'1.1', marginBottom:'16px',
              opacity: sec3.inView ? 1 : 0,
              transform: sec3.inView ? 'translateX(0)' : 'translateX(-32px)',
              transition: 'opacity .8s ease, transform .8s ease',
            }}
          >
            Perfumes<br /><span className="text-shimmer">Premium</span><br />hasta 20% OFF
          </h2>
          <p style={{ color:'rgba(232,229,226,0.6)', lineHeight:'1.7', marginBottom:'36px', fontSize:'15px', maxWidth:'340px' }}>
            Fragancias exclusivas de larga duración para él y para ella. Elegancia que se siente.
          </p>
          <Link href="/tienda?cat=perfumes" className="btn-primary" style={{ padding:'15px 34px', borderRadius:'12px', fontSize:'13px', width:'fit-content' }} onMouseDown={handleRipple}>
            <span className="shine" />
            Ver perfumes →
          </Link>
        </div>

        {/* Right — image */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:'400px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1547887538-047c9d44754b?w=800&q=85"
            alt="Perfumes"
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block', transition:'transform .8s ease' }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(33,31,30,0.4) 0%, transparent 50%)' }} />
          <div style={{ position:'absolute', bottom:'32px', left:'32px', background:'rgba(33,31,30,.88)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'14px', padding:'16px 24px' }}>
            <p style={{ color:'rgba(232,229,226,0.7)', fontSize:'11px', letterSpacing:'1.5px', margin:'0 0 4px' }}>DESDE</p>
            <p style={{ color:'#fff', fontSize:'28px', fontWeight:'800', margin:0 }}>$<span className="text-shimmer">28.00</span></p>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section ref={sec4.ref} style={{ background:'#211f1e', padding:'80px 32px', position:'relative', overflow:'hidden' }}>
        {/* Fondo radial decorativo */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 100%, rgba(193,105,43,.08) 0%, transparent 60%)', pointerEvents:'none' }} />
        <div style={{ maxWidth:'1320px', margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'12px' }}>Números que hablan</p>
            <h2 style={{
              color:'#fff', fontSize:'clamp(24px, 3vw, 36px)', fontWeight:'800', letterSpacing:'-0.5px',
              opacity: sec4.inView ? 1 : 0,
              transform: sec4.inView ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity .6s ease, transform .6s ease',
            }}>
              La confianza de nuestros clientes
            </h2>
          </div>
          <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px' }}>
            {stats.map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  opacity: sec4.inView ? 1 : 0,
                  transition: `opacity .5s ease ${i * 120}ms, transform .6s cubic-bezier(.34,1.3,.64,1) ${i * 120}ms`,
                  transform: sec4.inView ? 'translateY(0) scale(1)' : 'translateY(28px) scale(.95)',
                  textAlign:'center', padding:'40px 24px',
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:'16px', backdropFilter:'blur(8px)',
                }}
              >
                <p style={{
                  fontSize:'clamp(32px, 4vw, 48px)', fontWeight:'900', letterSpacing:'-1.5px',
                  margin:'0 0 8px', color:'transparent',
                  background:'linear-gradient(135deg, #e88c4a 0%, #c1692b 100%)',
                  WebkitBackgroundClip:'text', backgroundClip:'text',
                  textShadow:'none',
                  filter:'drop-shadow(0 0 8px rgba(193,105,43,.4))',
                }}>
                  <AnimatedNumber target={s.value} suffix={s.suffix} inView={sec4.inView} />
                </p>
                <p style={{ color:'rgba(232,229,226,0.5)', fontSize:'13px', letterSpacing:'0.5px', margin:0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIOS ═══ */}
      <section ref={sec5.ref} style={{ padding:'100px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div style={{
            textAlign:'center', marginBottom:'56px',
            opacity: sec5.inView ? 1 : 0,
            transform: sec5.inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity .6s ease, transform .6s ease',
          }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'12px' }}>Testimonios</p>
            <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px' }}>
              Lo dicen nuestros clientes
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'24px' }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial-wow"
                style={{
                  opacity: sec5.inView ? 1 : 0,
                  transition: `opacity .6s ease ${i * 140}ms, transform .65s cubic-bezier(.34,1.2,.64,1) ${i * 140}ms`,
                  transform: sec5.inView ? 'translateY(0)' : 'translateY(32px)',
                }}
              >
                <div style={{ display:'flex', gap:'3px', marginBottom:'16px' }}>
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} style={{ color:'#c1692b', fontSize:'17px', filter:'drop-shadow(0 0 4px rgba(193,105,43,.6))' }}>★</span>
                  ))}
                </div>
                <p style={{ color:'#393738', lineHeight:'1.8', fontSize:'15px', marginBottom:'24px', fontStyle:'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{
                    width:'42px', height:'42px', borderRadius:'50%',
                    background:'linear-gradient(135deg, #e88c4a, #c1692b)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#fff', fontWeight:'800', fontSize:'16px', flexShrink:0,
                    boxShadow:'0 4px 12px rgba(193,105,43,.4)',
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:'700', color:'#211f1e', fontSize:'14px' }}>{t.name}</p>
                    <p style={{ margin:0, fontSize:'12px', color:'#7a7675' }}>{t.city}, Venezuela</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section ref={sec6.ref} style={{ position:'relative', padding:'120px 32px', background:'#111010', overflow:'hidden', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.12 }} />
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(193,105,43,.18) 0%, transparent 65%)' }} />
        </div>

        {/* Partículas CTA */}
        {PARTICLES.slice(0, 6).map((p, i) => (
          <div key={i} className="particle" style={{
            width: p.size, height: p.size,
            top: p.top, left: p.left,
            background:`radial-gradient(circle, #e88c4a, #c1692b)`,
            boxShadow:`0 0 ${p.size * 3}px rgba(193,105,43,.7)`,
            animationDuration: p.dur, animationDelay: p.delay,
            opacity: p.opacity * .7, zIndex: 1,
          }} />
        ))}

        <div style={{
          position:'relative', zIndex:2, maxWidth:'640px', margin:'0 auto',
          opacity: sec6.inView ? 1 : 0,
          transform: sec6.inView ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1)',
        }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'20px' }}>Comunidad Punto Norte</p>
          <h2 style={{ color:'#fff', fontSize:'clamp(32px, 5vw, 56px)', fontWeight:'800', letterSpacing:'-1.5px', lineHeight:'1.1', marginBottom:'20px' }}>
            Únete y recibe<br /><span className="text-shimmer">descuentos exclusivos</span>
          </h2>
          <p style={{ color:'rgba(232,229,226,0.6)', fontSize:'16px', lineHeight:'1.7', marginBottom:'44px' }}>
            Sé el primero en conocer nuevas llegadas, ofertas especiales y contenido exclusivo vía WhatsApp.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <a
              href="https://wa.me/584140906768?text=Hola%2C%20quiero%20recibir%20novedades%20de%20Punto%20Norte"
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'#25d366', color:'#fff', padding:'17px 40px', borderRadius:'12px', textDecoration:'none', fontWeight:'800', fontSize:'15px', letterSpacing:'0.3px', boxShadow:'0 8px 32px rgba(37,211,102,.4)', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 16px 40px rgba(37,211,102,.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(37,211,102,.4)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Unirme por WhatsApp
            </a>
            <Link href="/tienda" className="btn-ghost" style={{ padding:'17px 36px', borderRadius:'12px', fontSize:'14px' }}>
              Ver catálogo ✦
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
