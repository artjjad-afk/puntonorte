'use client'
import Link from 'next/link'
import { ProductCard } from '@/components/ui/ProductCard'
import { getFeatured, categories } from '@/lib/products'
import { useEffect, useRef, useState } from 'react'
const testimonials = [
  { name: 'María G.', city: 'Caracas', text: 'Excelente calidad y llegó súper rápido. El vestido quedó perfecto. 100% recomendado.', stars: 5 },
  { name: 'Carlos R.', city: 'Valencia', text: 'La camisa Oxford es de muy buena tela. El servicio por WhatsApp fue muy atento y rápido.', stars: 5 },
  { name: 'Andreína P.', city: 'Maracaibo', text: 'Compré el perfume Rose Élégance y huele increíble. Ya hice mi segundo pedido con ellos.', stars: 5 },
]

const stats = [
  { value: '500+', label: 'Clientes satisfechos' },
  { value: '200+', label: 'Productos disponibles' },
  { value: '5★', label: 'Calificación promedio' },
  { value: '24h', label: 'Atención WhatsApp' },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}


export default function HomePage() {
  const [featured, setFeatured] = useState<ReturnType<typeof getFeatured>>([])
  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(r => r.json())
      .then(data => setFeatured(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setFeatured(getFeatured()))
  }, [])
  const sec1 = useInView(); const sec2 = useInView(); const sec3 = useInView()
  const sec4 = useInView(); const sec5 = useInView(); const sec6 = useInView()

  return (
    <>
      <style>{`
        .hero-word { display:inline-block; }
        .cat-item { position:relative; overflow:hidden; border-radius:16px; cursor:pointer; }
        .cat-item img { width:100%; height:100%; object-fit:cover; transition:transform .6s ease; display:block; }
        .cat-item:hover img { transform:scale(1.08); }
        .cat-item .cat-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(33,31,30,.85) 0%, rgba(33,31,30,.1) 60%, transparent 100%); transition:opacity .3s; }
        .cat-item:hover .cat-overlay { opacity:.9; }
        .cat-item .cat-arrow { opacity:0; transform:translateX(-8px); transition:all .3s; }
        .cat-item:hover .cat-arrow { opacity:1; transform:translateX(0); }
        .stat-card { text-align:center; padding:32px 24px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; backdrop-filter:blur(8px); }
        .testimonial-card { background:#fff; border-radius:16px; padding:28px; border:1px solid #e8e5e2; transition:all .3s; position:relative; }
        .testimonial-card:hover { border-color:#c1692b; box-shadow:0 8px 32px rgba(193,105,43,0.12); transform:translateY(-4px); }
        .testimonial-card::before { content:'"'; font-size:80px; line-height:.8; color:#c1692b; opacity:.15; position:absolute; top:16px; right:20px; font-family:Georgia,serif; pointer-events:none; }
        .promo-strip { display:grid; grid-template-columns:1fr 1fr; min-height:500px; }
        @media(max-width:768px){ .promo-strip{ grid-template-columns:1fr; } .stats-grid{ grid-template-columns:1fr 1fr !important; } .cats-grid{ grid-template-columns:1fr 1fr !important; } }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', background:'#111010', overflow:'hidden' }}>
        {/* Background image */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85" alt="hero" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', opacity:0.35 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(17,16,16,.95) 0%, rgba(33,31,30,.7) 50%, rgba(17,16,16,.85) 100%)' }} />
        </div>

        {/* Decorative circles */}
        <div style={{ position:'absolute', top:'10%', right:'8%', width:'400px', height:'400px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.12)', zIndex:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'15%', right:'13%', width:'280px', height:'280px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.08)', zIndex:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,105,43,0.08) 0%, transparent 70%)', zIndex:1, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2, maxWidth:'1320px', margin:'0 auto', padding:'120px 32px 80px', width:'100%' }}>
          <div style={{ maxWidth:'700px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(193,105,43,0.15)', border:'1px solid rgba(193,105,43,0.3)', borderRadius:'100px', padding:'6px 16px', marginBottom:'28px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#c1692b', display:'inline-block' }} />
              <span style={{ color:'#c1692b', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase' }}>Nueva Colección 2025</span>
            </div>

            <h1 style={{ color:'#fff', fontSize:'clamp(44px, 7vw, 84px)', fontWeight:'800', lineHeight:'1.0', marginBottom:'8px', letterSpacing:'-2px' }}>
              TU ESTILO,
            </h1>
            <h1 style={{ fontSize:'clamp(44px, 7vw, 84px)', fontWeight:'800', lineHeight:'1.0', marginBottom:'28px', letterSpacing:'-2px' }} className="text-gradient">
              TU NORTE.
            </h1>

            <p style={{ color:'rgba(232,229,226,0.75)', fontSize:'clamp(16px, 2vw, 19px)', lineHeight:'1.7', marginBottom:'44px', maxWidth:'480px' }}>
              Moda, accesorios y perfumes de calidad premium. Descubre piezas únicas que cuentan tu historia.
            </p>

            <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
              <Link href="/tienda" className="btn-primary" style={{ padding:'16px 36px', borderRadius:'12px', fontSize:'14px' }}>
                Explorar colección →
              </Link>
              <Link href="/tienda?cat=perfumes" className="btn-ghost" style={{ padding:'16px 32px', borderRadius:'12px', fontSize:'14px' }}>
                Ver perfumes
              </Link>
            </div>

            {/* Mini stats */}
            <div style={{ display:'flex', gap:'32px', marginTop:'56px', flexWrap:'wrap' }}>
              {[['500+','Clientes'],['200+','Productos'],['5★','Rating']].map(([v, l]) => (
                <div key={l}>
                  <p style={{ color:'#fff', fontSize:'22px', fontWeight:'800', margin:'0 0 2px', letterSpacing:'-0.5px' }}>{v}</p>
                  <p style={{ color:'rgba(232,229,226,0.5)', fontSize:'12px', margin:0, letterSpacing:'0.5px' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
          <span style={{ color:'rgba(232,229,226,0.4)', fontSize:'10px', letterSpacing:'2px' }}>SCROLL</span>
          <div style={{ width:'1px', height:'40px', background:'linear-gradient(to bottom, rgba(193,105,43,0.6), transparent)' }} />
        </div>
      </section>

      {/* ═══ CATEGORÍAS ═══ */}
      <section ref={sec1.ref} style={{ padding:'100px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'52px', flexWrap:'wrap', gap:'20px' }}>
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
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr', gridTemplateRows:'300px 300px', gap:'16px' }} className="cats-grid">
            {categories.slice(0,5).map((cat, i) => (
              <Link key={cat.id} href={`/tienda?cat=${cat.id}`} style={{ textDecoration:'none', gridRow: i === 0 ? 'span 2' : undefined }} className="cat-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.label} />
                <div className="cat-overlay" />
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'24px 20px' }}>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>Colección</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ color:'#fff', fontWeight:'800', fontSize: i === 0 ? '26px' : '18px', letterSpacing:'-0.5px', margin:0 }}>{cat.label}</p>
                    <span className="cat-arrow" style={{ color:'#c1692b', fontSize:'20px', fontWeight:'700' }}>→</span>
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
          <div style={{ textAlign:'center', marginBottom:'56px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'12px' }}>Selección</p>
            <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', marginBottom:'14px' }}>
              Los más vendidos
            </h2>
            <p style={{ color:'#7a7675', fontSize:'16px', maxWidth:'440px', margin:'0 auto', lineHeight:'1.6' }}>
              Piezas elegidas por cientos de clientes satisfechos en todo Venezuela.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'24px', opacity: sec2.inView ? 1 : 0, transition:'opacity .6s ease' }}>
            {featured.map((product, i) => (
              <div key={product.id} style={{ animationDelay:`${i * 80}ms` }} className={sec2.inView ? 'animate-fadeUp' : ''}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:'48px' }}>
            <Link href="/tienda" className="btn-primary" style={{ padding:'15px 48px', borderRadius:'12px', fontSize:'14px' }}>
              Ver toda la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BANNER SPLIT PERFUMES ═══ */}
      <section ref={sec3.ref} className="promo-strip">
        {/* Left — dark */}
        <div style={{ background:'#211f1e', padding:'80px 60px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.15)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,105,43,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
          <p className="section-label" style={{ marginBottom:'16px' }}>Fragrancias</p>
          <h2 style={{ color:'#fff', fontSize:'clamp(28px, 3.5vw, 44px)', fontWeight:'800', letterSpacing:'-1px', lineHeight:'1.1', marginBottom:'16px' }}>
            Perfumes<br /><span className="text-gradient">Premium</span><br />hasta 20% OFF
          </h2>
          <p style={{ color:'rgba(232,229,226,0.6)', lineHeight:'1.7', marginBottom:'36px', fontSize:'15px', maxWidth:'340px' }}>
            Fragancias exclusivas de larga duración para él y para ella. Elegancia que se siente.
          </p>
          <Link href="/tienda?cat=perfumes" className="btn-primary" style={{ padding:'14px 32px', borderRadius:'12px', fontSize:'13px', width:'fit-content' }}>
            Ver perfumes →
          </Link>
        </div>

        {/* Right — image */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:'400px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1547887538-047c9d44754b?w=800&q=85" alt="Perfumes" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block', transition:'transform .8s ease' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(33,31,30,0.4) 0%, transparent 50%)' }} />
          <div style={{ position:'absolute', bottom:'32px', left:'32px', background:'rgba(33,31,30,0.85)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'16px 24px' }}>
            <p style={{ color:'rgba(232,229,226,0.7)', fontSize:'11px', letterSpacing:'1.5px', margin:'0 0 4px' }}>DESDE</p>
            <p style={{ color:'#fff', fontSize:'28px', fontWeight:'800', margin:0 }}>$<span className="text-gradient">28.00</span></p>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section ref={sec4.ref} style={{ background:'#211f1e', padding:'80px 32px' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px' }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ opacity: sec4.inView ? 1 : 0, transition:`opacity .5s ease ${i*100}ms, transform .5s ease ${i*100}ms`, transform: sec4.inView ? 'translateY(0)' : 'translateY(20px)' }}>
                <p style={{ color:'#c1692b', fontSize:'clamp(28px, 4vw, 40px)', fontWeight:'800', letterSpacing:'-1px', margin:'0 0 6px' }}>{s.value}</p>
                <p style={{ color:'rgba(232,229,226,0.55)', fontSize:'13px', letterSpacing:'0.5px', margin:0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIOS ═══ */}
      <section ref={sec5.ref} style={{ padding:'100px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'1320px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'56px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'12px' }}>Testimonios</p>
            <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px' }}>
              Lo dicen nuestros clientes
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card" style={{ opacity: sec5.inView ? 1 : 0, transition:`all .5s ease ${i*120}ms`, transform: sec5.inView ? 'translateY(0)' : 'translateY(24px)' }}>
                <div style={{ display:'flex', gap:'3px', marginBottom:'16px' }}>
                  {Array.from({length:t.stars}).map((_,s) => <span key={s} style={{ color:'#c1692b', fontSize:'16px' }}>★</span>)}
                </div>
                <p style={{ color:'#393738', lineHeight:'1.75', fontSize:'15px', marginBottom:'20px', fontStyle:'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg, #c1692b, #a8541f)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontSize:'15px', flexShrink:0 }}>
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
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }} />
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(193,105,43,0.15) 0%, transparent 70%)' }} />
        </div>
        <div style={{ position:'relative', zIndex:1, maxWidth:'640px', margin:'0 auto' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'20px' }}>Comunidad Punto Norte</p>
          <h2 style={{ color:'#fff', fontSize:'clamp(32px, 5vw, 56px)', fontWeight:'800', letterSpacing:'-1.5px', lineHeight:'1.1', marginBottom:'20px' }}>
            Únete y recibe<br /><span className="text-gradient">descuentos exclusivos</span>
          </h2>
          <p style={{ color:'rgba(232,229,226,0.6)', fontSize:'16px', lineHeight:'1.7', marginBottom:'40px' }}>
            Sé el primero en conocer nuevas llegadas, ofertas especiales y contenido exclusivo vía WhatsApp.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://wa.me/584140906768?text=Hola%2C%20quiero%20recibir%20novedades%20de%20Punto%20Norte" target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'#25d366', color:'#fff', padding:'16px 36px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'15px', letterSpacing:'0.3px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Unirme por WhatsApp
            </a>
            <Link href="/tienda" className="btn-ghost" style={{ padding:'16px 32px', borderRadius:'12px', fontSize:'14px' }}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
