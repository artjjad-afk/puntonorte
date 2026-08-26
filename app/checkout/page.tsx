'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { CustomerInfo } from '@/types'
import { ChevronLeft, Check, MapPin, CreditCard, ClipboardCheck, ShoppingBag } from 'lucide-react'
import { buildOrderWAMessage } from '@/lib/whatsappOrder'

const PAYMENT_METHODS = [
  { id: 'zelle',     label: 'Zelle',               desc: 'Transferencia USD desde banco americano', icon: '🏦' },
  { id: 'pago-movil',label: 'Pago Móvil',          desc: 'Transferencia instantánea bancos venezolanos', icon: '📱' },
  { id: 'efectivo',  label: 'Efectivo USD',         desc: 'Pago en efectivo al momento de entrega', icon: '💵' },
  { id: 'whatsapp',  label: 'Coordinar por WhatsApp', desc: 'Te contactamos para acordar el método', icon: '💬' },
]

const STEPS = [
  { label: 'Datos de envío', icon: MapPin },
  { label: 'Método de pago', icon: CreditCard },
  { label: 'Confirmar pedido', icon: ClipboardCheck },
]


export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [step, setStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderError, setOrderError] = useState(false)
  const [form, setForm] = useState<CustomerInfo>({ name:'', phone:'', address:'', city:'', notes:'' })
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  if (items.length === 0) return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px', padding:'40px', textAlign:'center' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#f9f7f5', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
        <ShoppingBag size={36} color="#7a7675" strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#211f1e', margin:0 }}>Tu carrito está vacío</h2>
      <p style={{ color:'#7a7675', margin:0 }}>Agrega productos antes de continuar</p>
      <Link href="/tienda" className="btn-primary" style={{ padding:'14px 32px', borderRadius:'12px', fontSize:'14px' }}>
        Ir a la tienda
      </Link>
    </div>
  )

  const subtotal = total()

  // Valida números venezolanos: 04XX-XXXXXXX con operadoras reales
  // Acepta: 0414-1234567 / 04141234567 / 0414 123 4567 / +58414...
  const validateVenPhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '')
    // Quitar prefijo internacional si viene con 58
    const local = digits.startsWith('58') ? '0' + digits.slice(2) : digits
    return /^0(412|414|416|424|426)\d{7}$/.test(local)
  }

  const validate = () => {
    const e: Partial<CustomerInfo> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.phone.trim()) {
      e.phone = 'Requerido'
    } else if (!validateVenPhone(form.phone)) {
      e.phone = 'Ingresa un número venezolano válido (ej: 0414-1234567)'
    }
    if (!form.address.trim()) e.address = 'Requerido'
    if (!form.city.trim()) e.city = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validate()) return
    if (step === 1 && !paymentMethod) return
    setStep(s => s + 1)
  }

  const buildMsg = () => {
    const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || paymentMethod
    return buildOrderWAMessage({
      items: items.map(i => ({
        name: i.product.name,
        size: i.selectedSize,
        color: i.selectedColor,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: subtotal,
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      notes: form.notes,
      paymentLabel: pm,
    })
  }

  const handleConfirm = async () => {
    setLoading(true)
    setOrderError(false)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          address: form.address,
          city: form.city,
          notes: form.notes || null,
          paymentMethod,
          items: items.map(i => ({
            product: { name: i.product.name, price: i.product.price },
            quantity: i.quantity,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor,
          })),
          total: subtotal,
        }),
      })

      if (!res.ok) {
        // El servidor respondió con error — mostrar aviso pero no bloquear
        console.error('Error guardando pedido, status:', res.status)
        setOrderError(true)
        setLoading(false)
        return
      }

      // Solo el ID y el token viajan por URL
      const savedOrder = await res.json()
      clearCart()
      router.push(`/confirmacion?orderId=${savedOrder.id}&token=${savedOrder.accessToken}`)
    } catch (e) {
      // Error de red o servidor caído
      console.error('Error de conexión al guardar pedido:', e)
      setOrderError(true)
      setLoading(false)
    }
  }

  const field = (key: keyof CustomerInfo, label: string, placeholder: string, type = 'text') => {
    const isPhone = key === 'phone'
    const phoneValid = isPhone && form.phone.length > 6 && validateVenPhone(form.phone)
    const phoneInvalid = isPhone && form.phone.length > 6 && !validateVenPhone(form.phone)

    const borderColor = errors[key]
      ? '#e53e3e'
      : (isPhone && phoneValid) ? '#25a244'
      : '#e8e5e2'

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        <label style={{ fontSize:'12px', fontWeight:'700', color:'#393738', letterSpacing:'0.8px', textTransform:'uppercase' }}>
          {label} {key !== 'notes' && <span style={{ color:'#c1692b' }}>*</span>}
        </label>

        {key === 'notes' ? (
          <textarea placeholder={placeholder} value={form.notes || ''} rows={3}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            style={{ padding:'13px 16px', borderRadius:'12px', border:`1.5px solid ${borderColor}`, fontSize:'14px', outline:'none', resize:'vertical', fontFamily:'Arial,sans-serif', transition:'border-color .2s' }}
            onFocus={e => (e.target.style.borderColor = '#c1692b')}
            onBlur={e => (e.target.style.borderColor = borderColor)} />
        ) : (
          <div style={{ position:'relative' }}>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key] || ''}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{
                width: '100%', padding:'13px 16px', paddingRight: isPhone ? '44px' : '16px',
                borderRadius:'12px', border:`1.5px solid ${borderColor}`,
                fontSize:'14px', outline:'none', transition:'border-color .2s',
                boxSizing:'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#c1692b')}
              onBlur={e => (e.target.style.borderColor = borderColor)}
            />
            {/* Indicador visual teléfono */}
            {isPhone && form.phone.length > 6 && (
              <span style={{
                position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                fontSize:'16px', pointerEvents:'none',
              }}>
                {phoneValid ? '✅' : '❌'}
              </span>
            )}
          </div>
        )}

        {/* Mensaje de error */}
        {errors[key] && (
          <span style={{ fontSize:'12px', color:'#e53e3e', display:'flex', alignItems:'center', gap:'4px' }}>
            ⚠️ {errors[key]}
          </span>
        )}

        {/* Ayuda teléfono */}
        {isPhone && !errors[key] && (
          <span style={{ fontSize:'11px', color: phoneValid ? '#25a244' : phoneInvalid ? '#e53e3e' : '#7a7675' }}>
            {phoneValid
              ? '✓ Número válido'
              : phoneInvalid
                ? 'Operadora no reconocida. Válidas: 0412, 0414, 0416, 0424, 0426'
                : 'Formato: 0414-1234567'}
          </span>
        )}
      </div>
    )
  }


  return (
    <>
      <style>{`
        .checkout-layout { display:grid; grid-template-columns:1fr 400px; gap:32px; align-items:start; }
        @media(max-width:900px){
          .checkout-layout { grid-template-columns:1fr !important; }
          .checkout-layout > div:first-child { order:1 !important; }              /* formulario arriba */
          .checkout-layout > div:last-child  { order:2 !important; position:static !important; } /* resumen debajo */
          .checkout-summary { border-radius:16px !important; }
        }
        .pay-option { padding:18px 20px; border-radius:14px; border:1.5px solid #e8e5e2; cursor:pointer; transition:all .2s; background:#fff; text-align:left; width:100%; }
        .pay-option:hover { border-color:#c1692b; background:#fff7f3; }
        .pay-option.selected { border-color:#c1692b; background:#fff7f3; box-shadow:0 0 0 3px rgba(193,105,43,0.12); }
        @media(max-width:480px){
          .checkout-steps-label { display:none; }
          .checkout-confirm-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* Header oscuro */}
      <div style={{ background:'linear-gradient(135deg, #211f1e 0%, #393738 100%)', padding:'48px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'240px', height:'240px', borderRadius:'50%', border:'1px solid rgba(193,105,43,0.12)', pointerEvents:'none' }} />
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <Link href="/tienda" style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'rgba(232,229,226,0.6)', textDecoration:'none', fontSize:'13px', marginBottom:'16px', transition:'color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c1692b')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,229,226,0.6)')}>
            <ChevronLeft size={15} /> Seguir comprando
          </Link>
          <h1 style={{ color:'#fff', fontSize:'clamp(28px, 4vw, 40px)', fontWeight:'800', letterSpacing:'-1px', margin:'0 0 28px' }}>
            Finalizar Compra
          </h1>

          {/* Progress steps */}
          <div style={{ display:'flex', alignItems:'center', gap:'0' }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = i < step
              const active = i === step
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                    <div style={{
                      width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      background: done ? '#c1692b' : active ? '#fff' : 'rgba(255,255,255,0.12)',
                      border: active ? '2px solid #c1692b' : 'none',
                      transition:'all .3s',
                    }}>
                      {done
                        ? <Check size={16} color="#fff" />
                        : <Icon size={16} color={active ? '#c1692b' : 'rgba(255,255,255,0.4)'} />
                      }
                    </div>
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span style={{ fontSize:'10px', color: done || active ? '#c1692b' : 'rgba(232,229,226,0.35)', letterSpacing:'1px', textTransform:'uppercase', fontWeight:'600' }}>Paso {i+1}</span>
                      <span style={{ fontSize:'13px', color: done || active ? '#fff' : 'rgba(232,229,226,0.45)', fontWeight: active ? '700' : '400' }}>{s.label}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex:1, height:'1px', margin:'0 16px', background: done ? '#c1692b' : 'rgba(255,255,255,0.12)', transition:'background .3s' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'40px 32px 80px' }}>
        <div className="checkout-layout">

          {/* Form card */}
          <div style={{ background:'#fff', borderRadius:'20px', padding:'36px', boxShadow:'0 4px 40px rgba(33,31,30,0.08)', border:'1px solid #e8e5e2' }}>

            {/* STEP 0 */}
            {step === 0 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(193,105,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <MapPin size={20} color="#c1692b" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#211f1e', margin:0, letterSpacing:'-0.3px' }}>Datos de envío</h2>
                    <p style={{ fontSize:'13px', color:'#7a7675', margin:0 }}>¿A dónde enviamos tu pedido?</p>
                  </div>
                </div>
                <div style={{ display:'grid', gap:'18px' }}>
                  {field('name', 'Nombre completo', 'Ej: María González')}
                  {field('phone', 'Teléfono / WhatsApp', 'Ej: 0414-1234567')}
                  {field('address', 'Dirección de entrega', 'Av. Principal, Edificio Norte, Apto 3B')}
                  {field('city', 'Ciudad / Estado', 'Ej: Caracas, Miranda')}
                  {field('notes', 'Notas adicionales', 'Instrucciones especiales para la entrega... (opcional)')}
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(193,105,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CreditCard size={20} color="#c1692b" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#211f1e', margin:0 }}>Método de pago</h2>
                    <p style={{ fontSize:'13px', color:'#7a7675', margin:0 }}>Elige cómo prefieres pagar</p>
                  </div>
                </div>
                <div style={{ display:'grid', gap:'12px', marginBottom:'24px' }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} className={`pay-option ${paymentMethod === pm.id ? 'selected' : ''}`}>
                      <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                        <span style={{ fontSize:'24px' }}>{pm.icon}</span>
                        <div style={{ flex:1 }}>
                          <p style={{ margin:0, fontWeight:'700', fontSize:'15px', color:'#211f1e' }}>{pm.label}</p>
                          <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#7a7675' }}>{pm.desc}</p>
                        </div>
                        <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${paymentMethod === pm.id ? '#c1692b' : '#e8e5e2'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                          {paymentMethod === pm.id && <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#c1692b' }} />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {!paymentMethod && <p style={{ color:'#e53e3e', fontSize:'13px' }}>Selecciona un método para continuar</p>}
                <div style={{ background:'linear-gradient(135deg, rgba(193,105,43,0.08), rgba(193,105,43,0.04))', border:'1px solid rgba(193,105,43,0.2)', borderRadius:'14px', padding:'16px 20px' }}>
                  <p style={{ margin:0, fontSize:'13px', color:'#393738', lineHeight:'1.7' }}>
                    <strong style={{ color:'#c1692b' }}>¿Cómo funciona?</strong> Confirmas el pedido → te enviamos los datos de pago por WhatsApp → pagas y nos envías el comprobante → coordinamos la entrega. ¡Así de simple!
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(193,105,43,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ClipboardCheck size={20} color="#c1692b" />
                  </div>
                  <div>
                    <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#211f1e', margin:0 }}>Confirmar pedido</h2>
                    <p style={{ fontSize:'13px', color:'#7a7675', margin:0 }}>Revisa todo antes de enviar</p>
                  </div>
                </div>
                <div style={{ display:'grid', gap:'16px', marginBottom:'28px' }}>
                  <div style={{ background:'#f9f7f5', borderRadius:'14px', padding:'20px 24px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                      <h3 style={{ fontSize:'13px', fontWeight:'700', color:'#7a7675', textTransform:'uppercase', letterSpacing:'1px', margin:0 }}>Envío a</h3>
                      <button onClick={() => setStep(0)} style={{ background:'none', border:'none', color:'#c1692b', fontSize:'12px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.3px' }}>Editar</button>
                    </div>
                    <p style={{ margin:'0 0 2px', fontWeight:'700', color:'#211f1e', fontSize:'15px' }}>{form.name}</p>
                    <p style={{ margin:'0 0 2px', color:'#393738', fontSize:'13px' }}>{form.phone}</p>
                    <p style={{ margin:'0 0 2px', color:'#393738', fontSize:'13px' }}>{form.address}</p>
                    <p style={{ margin:0, color:'#393738', fontSize:'13px' }}>{form.city}</p>
                    {form.notes && <p style={{ margin:'8px 0 0', color:'#7a7675', fontSize:'12px', fontStyle:'italic' }}>📝 {form.notes}</p>}
                  </div>
                  <div style={{ background:'#f9f7f5', borderRadius:'14px', padding:'20px 24px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <h3 style={{ fontSize:'13px', fontWeight:'700', color:'#7a7675', textTransform:'uppercase', letterSpacing:'1px', margin:0 }}>Pago</h3>
                      <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'#c1692b', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>Editar</button>
                    </div>
                    <p style={{ margin:0, fontWeight:'700', color:'#211f1e', fontSize:'15px' }}>
                      {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.icon} {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'32px', gap:'12px', borderTop:'1px solid #e8e5e2', paddingTop:'24px' }}>
              {step > 0
                ? <button onClick={() => setStep(s => s - 1)} style={{ padding:'13px 24px', border:'1.5px solid #e8e5e2', borderRadius:'12px', background:'#fff', cursor:'pointer', fontWeight:'700', color:'#393738', fontSize:'14px', transition:'all .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#c1692b')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e5e2')}>
                    ← Anterior
                  </button>
                : <div />
              }
              {step < 2
                ? <button onClick={handleNext} className="btn-primary" style={{ padding:'13px 36px', borderRadius:'12px', border:'none', cursor:'pointer', fontSize:'14px' }}>
                    Continuar →
                  </button>
                : <div style={{ display:'flex', flexDirection:'column', gap:'12px', alignItems:'flex-end', flex:1 }}>
                    {/* Error de conexión */}
                    {orderError && (
                      <div style={{ width:'100%', background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:'12px', padding:'14px 18px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                        <span style={{ fontSize:'18px', flexShrink:0 }}>⚠️</span>
                        <div>
                          <p style={{ margin:'0 0 4px', fontWeight:'700', fontSize:'14px', color:'#dc2626' }}>
                            No pudimos registrar tu pedido
                          </p>
                          <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#7f1d1d', lineHeight:'1.5' }}>
                            Hay un problema de conexión. Tu pedido <strong>no se guardó</strong>. Puedes intentarlo de nuevo o enviarlo directamente por WhatsApp.
                          </p>
                          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                            <button
                              onClick={() => { if (!loading) { setOrderError(false); handleConfirm() } }}
                              disabled={loading}
                              style={{ padding:'8px 16px', borderRadius:'8px', border:'1.5px solid #dc2626', background: loading ? '#7a7675' : '#dc2626', color:'#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight:'700', fontSize:'12px' }}
                            >
                              {loading ? 'Procesando...' : 'Reintentar'}
                            </button>
                            <a
                              href={`https://wa.me/584140906768?text=${buildMsg()}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={() => clearCart()}
                              style={{ padding:'8px 16px', borderRadius:'8px', border:'1.5px solid #25d366', background:'#25d366', color:'#fff', textDecoration:'none', fontWeight:'700', fontSize:'12px', display:'inline-flex', alignItems:'center', gap:'6px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              Enviar igual por WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón confirmar */}
                    {!orderError && (
                      <button
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{
                          display:'inline-flex', alignItems:'center', gap:'10px',
                          padding:'14px 32px', borderRadius:'12px', border:'none',
                          background: loading ? '#7a7675' : '#25d366',
                          color:'#fff',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          pointerEvents: loading ? 'none' : 'auto',
                          fontWeight:'700', fontSize:'14px', transition:'all .2s',
                        }}
                      >
                        {loading
                          ? (<><div style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} /> Procesando...</>)
                          : (<><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Confirmar por WhatsApp</>)
                        }
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      </button>
                    )}
                  </div>
              }
            </div>
          </div>

          {/* Resumen */}
          <div style={{ background:'#211f1e', borderRadius:'20px', padding:'28px', position:'sticky', top:'90px' }}>
            <h3 style={{ color:'#fff', fontSize:'16px', fontWeight:'800', margin:'0 0 24px', letterSpacing:'-0.3px' }}>Resumen del pedido</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                  <div style={{ width:'56px', height:'56px', borderRadius:'10px', overflow:'hidden', flexShrink:0, position:'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <span style={{ position:'absolute', top:'-5px', right:'-5px', background:'#c1692b', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="line-clamp-1" style={{ margin:'0 0 2px', fontSize:'13px', color:'#e8e5e2', fontWeight:'600' }}>{item.product.name}</p>
                    {item.selectedSize && <p style={{ margin:0, fontSize:'11px', color:'rgba(232,229,226,0.45)' }}>Talla: {item.selectedSize}</p>}
                  </div>
                  <span style={{ fontSize:'14px', fontWeight:'700', color:'#fff', flexShrink:0 }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'rgba(232,229,226,0.55)' }}>Subtotal</span>
                <span style={{ fontSize:'13px', color:'#e8e5e2' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                <span style={{ fontSize:'13px', color:'rgba(232,229,226,0.55)' }}>Envío</span>
                <span style={{ fontSize:'13px', color:'#25d366', fontWeight:'700' }}>A coordinar</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'14px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize:'16px', fontWeight:'700', color:'#fff' }}>Total</span>
                <span style={{ fontSize:'24px', fontWeight:'800', color:'#c1692b', letterSpacing:'-0.5px' }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ marginTop:'20px', padding:'14px 16px', background:'rgba(193,105,43,0.12)', border:'1px solid rgba(193,105,43,0.2)', borderRadius:'12px' }}>
              <p style={{ margin:0, fontSize:'12px', color:'rgba(232,229,226,0.7)', lineHeight:'1.6', textAlign:'center' }}>
                🔒 Tu información está segura.<br />Pago coordinado directamente contigo.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
