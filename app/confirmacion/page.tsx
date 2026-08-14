'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MessageCircle, Home, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react'

const steps = [
  { num: '01', text: 'Envía tu pedido por WhatsApp con el botón de abajo' },
  { num: '02', text: 'Te confirmamos disponibilidad y datos de pago' },
  { num: '03', text: 'Realizas el pago y nos envías el comprobante' },
  { num: '04', text: 'Coordinamos la entrega a tu dirección' },
]

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const msg = searchParams.get('msg') || ''

  // Si no hay mensaje, redirigir a la tienda (acceso directo sin haber completado el checkout)
  useEffect(() => {
    if (!msg) {
      router.replace('/tienda')
    }
  }, [msg, router])

  // Abrir WhatsApp automáticamente solo si hay mensaje válido
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => window.open(`https://wa.me/584140906768?text=${msg}`, '_blank'), 800)
      return () => clearTimeout(t)
    }
  }, [msg])

  if (!msg) return null

  const waUrl = `https://wa.me/584140906768?text=${msg}`

  return (
    <>
      <style>{`
        @keyframes checkPop { 0%{transform:scale(0.3);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        .check-anim { animation: checkPop .5s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.3);opacity:0} }
        .ring-pulse { animation: ringPulse 2s ease-in-out infinite; }
        .step-item { display:flex; gap:16px; align-items:flex-start; padding:16px 0; border-bottom:1px solid #f0eeec; }
        .step-item:last-child { border-bottom:none; }
        @media(max-width:700px){ .confirm-grid{ grid-template-columns:1fr !important; } .confirm-grid>div:first-child{ border-right:none !important; border-bottom:1px solid #e8e5e2; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9f7f5 0%, #fff 60%, #f9f7f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,105,43,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 80px rgba(33,31,30,0.1)', border: '1px solid #e8e5e2' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding: '48px 48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '24px' }}>
                <div className="ring-pulse" style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: '2px solid rgba(37,211,102,0.4)' }} />
                <div className="check-anim" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #25d366, #1aad52)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}>
                  <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
                </div>
              </div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 10px' }}>
                ¡Pedido Recibido!
              </h1>
              <p style={{ color: 'rgba(232,229,226,0.65)', fontSize: '16px', margin: 0, lineHeight: '1.6', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                Tu pedido fue guardado y el resumen está listo para enviarse por WhatsApp.
              </p>
            </div>

            {/* Body */}
            <div className="confirm-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              {/* Pasos */}
              <div style={{ padding: '36px 40px', borderRight: '1px solid #e8e5e2' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#211f1e', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>¿Qué sigue?</h2>
                <div>
                  {steps.map((s, i) => (
                    <div key={i} className="step-item">
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#c1692b', letterSpacing: '1px', minWidth: '28px', paddingTop: '2px' }}>{s.num}</span>
                      <p style={{ margin: 0, fontSize: '14px', color: '#393738', lineHeight: '1.6' }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                <div style={{ padding: '14px 16px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} color="#25d366" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#393738', lineHeight: '1.6' }}>
                    WhatsApp se abrió automáticamente. Si no, usa el botón de abajo.
                  </p>
                </div>

                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#25d366', color: '#fff', padding: '17px 24px', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', fontSize: '15px', boxShadow: '0 8px 24px rgba(37,211,102,0.3)', transition: 'all .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  <MessageCircle size={20} /> Enviar pedido por WhatsApp <ArrowRight size={16} />
                </a>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', border: '1.5px solid #e8e5e2', borderRadius: '12px', textDecoration: 'none', color: '#393738', fontWeight: '600', fontSize: '13px', transition: 'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#c1692b')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e5e2')}>
                    <Home size={15} /> Inicio
                  </Link>
                  <Link href="/tienda" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', border: '1.5px solid #c1692b', borderRadius: '12px', textDecoration: 'none', color: '#c1692b', fontWeight: '700', fontSize: '13px', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#c1692b'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c1692b' }}>
                    <ShoppingBag size={15} /> Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e8e5e2', borderTopColor: '#c1692b', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
