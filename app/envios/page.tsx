'use client'
import { Truck, Clock, MapPin, Package, AlertCircle, MessageCircle, CheckCircle } from 'lucide-react'

const zonas = [
  { zona: 'Barcelona y Anzoátegui', tiempo: '1 – 2 días hábiles', precio: 'A coordinar', icon: '📍' },
  { zona: 'Caracas y Miranda', tiempo: '2 – 3 días hábiles', precio: 'A coordinar', icon: '🏙️' },
  { zona: 'Valencia y Carabobo', tiempo: '2 – 3 días hábiles', precio: 'A coordinar', icon: '🏭' },
  { zona: 'Maracaibo y Zulia', tiempo: '3 – 4 días hábiles', precio: 'A coordinar', icon: '⛽' },
  { zona: 'Oriente (Sucre, Monagas)', tiempo: '2 – 3 días hábiles', precio: 'A coordinar', icon: '🌊' },
  { zona: 'Llanos y interior', tiempo: '3 – 5 días hábiles', precio: 'A coordinar', icon: '🌾' },
  { zona: 'Andes (Mérida, Táchira)', tiempo: '3 – 5 días hábiles', precio: 'A coordinar', icon: '⛰️' },
  { zona: 'Resto del país', tiempo: '3 – 5 días hábiles', precio: 'A coordinar', icon: '🇻🇪' },
]

const pasos = [
  { titulo: 'Confirmamos tu pedido', desc: 'Una vez recibido el pago, procesamos tu pedido de inmediato.' },
  { titulo: 'Preparamos el paquete', desc: 'Empacamos tu pedido con cuidado para que llegue en perfectas condiciones.' },
  { titulo: 'Enviamos con mensajería', desc: 'Usamos servicios de mensajería confiables según tu zona.' },
  { titulo: 'Te enviamos el seguimiento', desc: 'Te notificamos por WhatsApp con el número de guía para que puedas rastrear tu envío.' },
]

export default function EnviosPage() {
  return (
    <>
      <style>{`
        .zona-card { padding:20px 24px; background:#fff; border-radius:14px; border:1px solid #e8e5e2; display:flex; align-items:center; gap:16px; transition:all .3s; }
        .zona-card:hover { border-color:#c1692b; box-shadow:0 4px 20px rgba(193,105,43,0.08); }
        .paso-envio { display:flex; gap:16px; align-items:flex-start; }
      `}</style>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding:'80px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.1)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:'600px', margin:'0 auto' }}>
          <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Logística</p>
          <h1 style={{ color:'#fff', fontSize:'clamp(30px, 5vw, 48px)', fontWeight:'800', letterSpacing:'-1.5px', margin:'0 0 16px', lineHeight:'1.1' }}>
            Envíos a toda <span className="text-gradient">Venezuela</span>
          </h1>
          <p style={{ color:'rgba(232,229,226,0.65)', fontSize:'16px', lineHeight:'1.8', margin:0 }}>
            Desde Barcelona, Anzoátegui, llevamos tu pedido a cualquier rincón del país con seguridad y rapidez.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding:'48px 32px', background:'#c1692b' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'24px', textAlign:'center' }}>
          {[
            { icon: <Truck size={28} color="#fff" />, val: 'Nacional', label: 'Cobertura' },
            { icon: <Clock size={28} color="#fff" />, val: '1-5 días', label: 'Tiempo de entrega' },
            { icon: <Package size={28} color="#fff" />, val: '100%', label: 'Embalaje seguro' },
            { icon: <MapPin size={28} color="#fff" />, val: 'Barcelona', label: 'Ciudad origen' },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              {s.icon}
              <p style={{ color:'#fff', fontSize:'22px', fontWeight:'800', margin:0 }}>{s.val}</p>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', margin:0, letterSpacing:'0.5px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zonas */}
      <section style={{ padding:'80px 32px', background:'#f9f7f5' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Tiempos de entrega</p>
            <h2 style={{ fontSize:'clamp(24px, 4vw, 36px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px', marginBottom:'12px' }}>
              Cobertura por zona
            </h2>
            <p style={{ color:'#7a7675', fontSize:'15px', margin:0 }}>Los tiempos son estimados en días hábiles desde la confirmación del pago</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'14px' }}>
            {zonas.map((z, i) => (
              <div key={i} className="zona-card">
                <span style={{ fontSize:'28px', flexShrink:0 }}>{z.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', fontWeight:'700', color:'#211f1e', margin:'0 0 2px' }}>{z.zona}</p>
                  <p style={{ fontSize:'12px', color:'#7a7675', margin:0 }}>{z.tiempo}</p>
                </div>
                <div style={{ background:'rgba(193,105,43,0.1)', border:'1px solid rgba(193,105,43,0.2)', borderRadius:'8px', padding:'4px 10px' }}>
                  <span style={{ fontSize:'11px', color:'#c1692b', fontWeight:'700' }}>{z.precio}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'24px', padding:'16px 20px', background:'rgba(193,105,43,0.08)', border:'1px solid rgba(193,105,43,0.2)', borderRadius:'12px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
            <AlertCircle size={18} color="#c1692b" style={{ flexShrink:0, marginTop:'1px' }} />
            <p style={{ fontSize:'13px', color:'#393738', margin:0, lineHeight:'1.7' }}>
              El costo exacto del envío se informa por WhatsApp antes de confirmar el pedido, según tu ubicación y el peso del paquete. No hay sorpresas.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding:'80px 32px', background:'#fff' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p className="section-label" style={{ justifyContent:'center', marginBottom:'14px' }}>Proceso</p>
            <h2 style={{ fontSize:'clamp(24px, 4vw, 36px)', fontWeight:'800', color:'#211f1e', letterSpacing:'-1px' }}>
              ¿Cómo funciona el envío?
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {pasos.map((p, i) => (
              <div key={i} className="paso-envio">
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0', flexShrink:0 }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: '#c1692b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <CheckCircle size={18} color="#fff" />
                  </div>
                  {i < pasos.length - 1 && <div style={{ width:'2px', height:'40px', background:'#e8e5e2' }} />}
                </div>
                <div style={{ paddingBottom: i < pasos.length - 1 ? '24px' : '0', paddingLeft:'16px', paddingTop:'8px' }}>
                  <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#211f1e', margin:'0 0 6px' }}>{p.titulo}</h3>
                  <p style={{ fontSize:'14px', color:'#7a7675', margin:0, lineHeight:'1.7' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'60px 32px', background:'#211f1e', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:'clamp(22px, 3vw, 32px)', fontWeight:'800', marginBottom:'12px', letterSpacing:'-0.5px' }}>¿Tienes preguntas sobre tu envío?</h2>
        <p style={{ color:'rgba(232,229,226,0.55)', marginBottom:'28px', fontSize:'15px' }}>Escríbenos y te respondemos al instante</p>
        <a href="https://wa.me/584140906768?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20los%20env%C3%ADos" target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'#25d366', color:'#fff', padding:'14px 32px', borderRadius:'12px', textDecoration:'none', fontWeight:'700', fontSize:'14px' }}>
          <MessageCircle size={16} /> Consultar por WhatsApp
        </a>
      </section>
    </>
  )
}
