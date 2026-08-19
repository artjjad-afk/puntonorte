'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Inter, Syne } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800'], display: 'swap' })
const syne  = Syne({ subsets: ['latin'], weight: ['600','700','800'], display: 'swap' })

function BgCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    let raf: number
    let visible = true
    let lastFrame = 0
    const FPS_CAP = 30
    const FRAME_MS = 1000 / FPS_CAP

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    // Pausar cuando la pestaña está oculta — ahorra CPU significativamente
    const onVisibility = () => { visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVisibility)

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.7 + 0.2, p: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible) return
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now
      t += 0.008
      const W = c.width, H = c.height
      ctx.clearRect(0, 0, W, H)

      // Rich dark blue-charcoal base
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#141028')
      bg.addColorStop(0.4, '#1a1230')
      bg.addColorStop(0.7, '#120e24')
      bg.addColorStop(1, '#0d0a1e')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Copper bloom — top center, large and visible
      const g1 = ctx.createRadialGradient(W * .5, -H * .05, 0, W * .5, -H * .05, W * .7)
      g1.addColorStop(0, `rgba(193,105,43,${0.32 + Math.sin(t * .6) * .08})`)
      g1.addColorStop(0.35, `rgba(193,105,43,${0.12 + Math.sin(t * .4) * .03})`)
      g1.addColorStop(1, 'rgba(193,105,43,0)')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Purple bloom — bottom right
      const g2 = ctx.createRadialGradient(W * .85, H * .9, 0, W * .85, H * .9, W * .5)
      g2.addColorStop(0, `rgba(140,70,220,${0.18 + Math.sin(t * .5 + 1) * .05})`)
      g2.addColorStop(0.5, `rgba(100,50,180,0.06)`)
      g2.addColorStop(1, 'rgba(60,20,120,0)')
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

      // Blue accent — left
      const g3 = ctx.createRadialGradient(0, H * .5, 0, 0, H * .5, W * .45)
      g3.addColorStop(0, `rgba(60,120,240,${0.12 + Math.sin(t * .7 + 2) * .03})`)
      g3.addColorStop(1, 'rgba(40,100,200,0)')
      ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H)

      // Center light — makes glassmorphism visible
      const gc = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, W*.35)
      gc.addColorStop(0, `rgba(193,105,43,${0.06 + Math.sin(t*.3)*.02})`)
      gc.addColorStop(1, 'rgba(193,105,43,0)')
      ctx.fillStyle = gc; ctx.fillRect(0, 0, W, H)

      // Light rays from top
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI + Math.PI * 0.5 + Math.sin(t * 0.3 + i) * 0.15
        const len = H * (1.2 + Math.sin(t * 0.4 + i * 0.7) * 0.2)
        const x1 = W * .5, y1 = -50
        const x2 = x1 + Math.cos(angle) * len * 1.5
        const y2 = y1 + Math.sin(angle) * len
        const rg = ctx.createLinearGradient(x1, y1, x2, y2)
        const a = 0.018 + Math.sin(t * 0.5 + i) * 0.008
        rg.addColorStop(0, `rgba(193,105,43,${a * 3})`)
        rg.addColorStop(0.3, `rgba(193,105,43,${a})`)
        rg.addColorStop(1, 'rgba(193,105,43,0)')
        const sp = 14 + i * 3
        const perp = angle + Math.PI / 2
        ctx.save(); ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2 + Math.cos(perp) * sp, y2 + Math.sin(perp) * sp)
        ctx.lineTo(x2 - Math.cos(perp) * sp, y2 - Math.sin(perp) * sp)
        ctx.closePath(); ctx.fillStyle = rg; ctx.fill(); ctx.restore()
      }

      // Subtle grid
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      ctx.restore()

      // Glowing particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.p += 0.02
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        const a = p.a * (0.4 + Math.sin(p.p) * 0.6)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grad.addColorStop(0, `rgba(220,160,80,${a})`)
        grad.addColorStop(1, 'rgba(220,160,80,0)')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()
      })

      // Connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(193,105,43,${(1 - d / 100) * 0.12})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw(0)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
}

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => { router.push('/admin'); router.refresh() }, 700)
      } else {
        const d = await res.json(); setError(d.error || 'Credenciales incorrectas')
      }
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const F = focused

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          background: #0d0a1a !important;
          font-family: var(--font-inter, Inter, -apple-system, sans-serif);
          -webkit-font-smoothing: antialiased;
        }

        /* Animations */
        @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleReveal   { from{opacity:0;transform:scale(.94) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes logoPulse {
          0%,100%{ filter: drop-shadow(0 0 8px rgba(193,105,43,.0)) }
          50%    { filter: drop-shadow(0 0 24px rgba(193,105,43,.55)) drop-shadow(0 0 48px rgba(193,105,43,.2)) }
        }
        @keyframes dotBlink { 0%,100%{opacity:1;box-shadow:0 0 6px #c1692b,0 0 14px rgba(193,105,43,.4)} 50%{opacity:.5;box-shadow:none} }
        @keyframes shimmer  { 0%{left:-80%} 100%{left:120%} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes successIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        @keyframes scanLine { 0%{top:-2px;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }

        /* Page layout */
        .pg {
          position: relative; z-index: 2;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 32px 20px;
          gap: 28px;
        }

        /* Logo section */
        .logo-section {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          animation: fadeSlideDown .7s cubic-bezier(.16,1,.3,1) both;
        }
        .logo-img {
          height: 72px; width: auto;
          filter: brightness(0) invert(1) drop-shadow(0 0 14px rgba(193,105,43,.5));
          animation: logoPulse 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        @keyframes logoPulse {
          0%,100%{ filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(193,105,43,.3)); }
          50%    { filter: brightness(0) invert(1) drop-shadow(0 0 24px rgba(193,105,43,.7)) drop-shadow(0 0 48px rgba(193,105,43,.25)); }
        }
        .brand {
          font-family: var(--font-syne, Syne, sans-serif);
          font-size: 20px; font-weight: 800;
          letter-spacing: 7px; text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          text-shadow: 0 0 30px rgba(193,105,43,0.3);
        }
        .admin-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 100px;
          background: rgba(193,105,43,0.1);
          border: 1px solid rgba(193,105,43,0.28);
          backdrop-filter: blur(8px);
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c1692b;
          animation: dotBlink 2s ease-in-out infinite;
        }
        .badge-txt {
          font-size: 10px; font-weight: 700;
          color: #d4862e; letter-spacing: 2.5px; text-transform: uppercase;
        }

        /* Card */
        .card {
          width: 100%; max-width: 420px;
          position: relative; overflow: hidden;
          background: rgba(15,12,28,0.45);
          backdrop-filter: blur(60px) saturate(180%) brightness(1.1);
          -webkit-backdrop-filter: blur(60px) saturate(180%) brightness(1.1);
          border-top: 1px solid rgba(255,255,255,0.18);
          border-left: 1px solid rgba(255,255,255,0.1);
          border-right: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          border-radius: 28px;
          padding: 40px 36px 36px;
          box-shadow:
            0 0 80px rgba(193,105,43,0.08),
            0 40px 100px rgba(0,0,0,0.55),
            0 0 0 1px rgba(193,105,43,0.06) inset;
          animation: scaleReveal .65s cubic-bezier(.16,1,.3,1) .1s both;
        }

        /* Scan line inside card */
        .card-scan {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(193,105,43,0.7) 50%, transparent 100%);
          animation: scanLine 5s ease-in-out infinite;
          pointer-events: none; z-index: 10;
        }

        /* Top border glow */
        .card::before {
          content: '';
          position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(193,105,43,0.8), rgba(255,255,255,0.5), rgba(193,105,43,0.8), transparent);
          pointer-events: none; border-radius: 100%;
          box-shadow: 0 0 12px rgba(193,105,43,0.4), 0 0 30px rgba(193,105,43,0.15);
        }

        /* Inner ambient */
        .card::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 180px;
          background: linear-gradient(180deg, rgba(193,105,43,0.05) 0%, transparent 100%);
          pointer-events: none; border-radius: 28px 28px 0 0;
        }

        /* Headings */
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #ffffff; letter-spacing: -.3px;
          margin-bottom: 5px;
          position: relative; z-index: 1;
        }
        .card-sub {
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.38);
          margin-bottom: 30px;
          position: relative; z-index: 1;
          letter-spacing: .1px;
        }

        /* Fields */
        .field { display: flex; flex-direction: column; gap: 7px; position: relative; z-index: 1; }
        .field-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          transition: color .2s;
        }
        .label-idle    { color: rgba(255,255,255,0.35); }
        .label-active  { color: #c1692b; }

        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none; transition: opacity .2s;
        }
        .field-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.9);
          font-size: 15px; font-weight: 400;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          caret-color: #c1692b;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); font-weight: 300; }
        .field-input:focus {
          border-color: rgba(193,105,43,0.6);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(193,105,43,0.12);
        }
        .eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); padding: 4px;
          display: flex; align-items: center;
          transition: color .2s;
          font-family: 'Inter', sans-serif;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.7); }

        /* Error */
        .field-error {
          padding: 11px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #f87171; font-size: 13px;
          display: flex; align-items: center; gap: 9px;
          animation: shake .35s ease both;
          position: relative; z-index: 1;
          font-family: 'Inter', sans-serif;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 8px 0;
          position: relative; z-index: 1;
        }

        /* Button */
        .submit-btn {
          width: 100%; padding: 15px 20px;
          background: linear-gradient(135deg, #d4752f 0%, #c1692b 45%, #9e5020 100%);
          border: none; border-radius: 14px;
          color: #fff; font-weight: 700; font-size: 15px;
          letter-spacing: .4px;
          cursor: pointer; position: relative; overflow: hidden;
          font-family: 'Inter', sans-serif;
          transition: transform .15s, box-shadow .2s;
          box-shadow: 0 4px 20px rgba(193,105,43,0.4), 0 1px 0 rgba(255,255,255,0.15) inset;
          z-index: 1;
        }
        .submit-btn::after {
          content: '';
          position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(193,105,43,0.55), 0 1px 0 rgba(255,255,255,0.15) inset;
        }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
        .submit-btn.success {
          background: linear-gradient(135deg, #22c55e, #16a34a) !important;
          animation: successIn .4s ease both;
          box-shadow: 0 4px 20px rgba(34,197,94,0.4) !important;
        }

        /* Footer */
        .pg-footer {
          font-size: 12px; color: rgba(255,255,255,0.5);
          letter-spacing: .5px; text-align: center;
          animation: fadeSlideUp .6s ease .5s both;
          font-family: 'Inter', sans-serif;
        }

        /* Global screen scan */
        .screen-scan {
          position: fixed; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(193,105,43,0.08), rgba(255,255,255,0.04), rgba(193,105,43,0.08), transparent);
          animation: scanLine 9s linear infinite;
          pointer-events: none; z-index: 3;
        }
      `}</style>

      <BgCanvas />
      <div className="screen-scan" />

      <div className={`pg ${inter.className}`} style={{ ['--font-syne' as string]: syne.style.fontFamily }}>

        {/* Logo */}
        <div className="logo-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-removebg-preview.png" alt="Punto Norte" className="logo-img" />
          <span className="brand">Punto Norte</span>
          <div className="admin-badge">
            <span className="badge-dot" />
            <span className="badge-txt">Admin Access</span>
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-scan" />

          <h1 className="card-title">Bienvenido</h1>
          <p className="card-sub">Ingresa tus credenciales para acceder al panel</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="field">
              <label className={`field-label ${F === 'u' ? 'label-active' : 'label-idle'}`}>Usuario</label>
              <div className="field-wrap">
                <span className="field-icon" style={{ opacity: F === 'u' ? 0.9 : 0.28 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={F === 'u' ? '#c1692b' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input className="field-input" type="text" placeholder="admin"
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  onFocus={() => setFocused('u')} onBlur={() => setFocused(null)}
                  autoComplete="username" required />
              </div>
            </div>

            <div className="field">
              <label className={`field-label ${F === 'p' ? 'label-active' : 'label-idle'}`}>Contraseña</label>
              <div className="field-wrap">
                <span className="field-icon" style={{ opacity: F === 'p' ? 0.9 : 0.28 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={F === 'p' ? '#c1692b' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input className="field-input" type={showPass ? 'text' : 'password'} placeholder="••••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onFocus={() => setFocused('p')} onBlur={() => setFocused(null)}
                  autoComplete="current-password" required style={{ paddingRight: '46px' }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="field-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="divider" />

            <button type="submit" disabled={loading || success} className={`submit-btn${success ? ' success' : ''}`}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{ width: '17px', height: '17px', border: '2.5px solid rgba(255,255,255,.25)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  Verificando...
                </span>
              ) : success ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Acceso concedido
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  Entrar al panel
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </span>
              )}
            </button>

          </form>
        </div>

        <p className="pg-footer">Punto Norte &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Acceso restringido &nbsp;·&nbsp; Barcelona, Anzoátegui</p>
      </div>
    </>
  )
}
