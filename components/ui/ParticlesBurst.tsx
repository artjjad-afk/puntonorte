'use client'
import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  r: number; alpha: number; hue: number; gravity: number
  shrink: number
}

interface ParticlesBurstProps {
  /** si true, dispara ráfaga al montar */
  autoFire?: boolean
}

export function ParticlesBurst({ autoFire = false }: ParticlesBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)
  const runningRef = useRef(false)

  const spawnBurst = useCallback((x: number, y: number, count = 60) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const cx = x - rect.left
    const cy = y - rect.top

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 8
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        r: 2 + Math.random() * 5,
        alpha: 1,
        hue: Math.random() < 0.5
          ? 20 + Math.random() * 30    // cobre
          : 30 + Math.random() * 20,   // dorado
        gravity: 0.12 + Math.random() * 0.1,
        shrink: 0.96 + Math.random() * 0.02,
      })
    }

    if (!runningRef.current) {
      runningRef.current = true
      loop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.02)

    for (const p of particlesRef.current) {
      p.x  += p.vx
      p.y  += p.vy
      p.vy += p.gravity
      p.vx *= 0.98
      p.r  *= p.shrink
      p.alpha -= 0.018

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
      grad.addColorStop(0, `hsla(${p.hue}, 95%, 75%, ${p.alpha})`)
      grad.addColorStop(1, `hsla(${p.hue + 20}, 80%, 50%, 0)`)

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    if (particlesRef.current.length > 0) {
      animRef.current = requestAnimationFrame(loop)
    } else {
      runningRef.current = false
    }
  }, [])

  /* Resize canvas al tamaño del contenedor */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    if (autoFire) {
      setTimeout(() => spawnBurst(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 80), 400)
    }

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [autoFire, spawnBurst])

  /* Exponer el método de disparo al padre vía data-attribute hack */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; count?: number }>
      spawnBurst(ce.detail.x, ce.detail.y, ce.detail.count ?? 60)
    }
    parent.addEventListener('particleBurst', handler as EventListener)
    return () => parent.removeEventListener('particleBurst', handler as EventListener)
  }, [spawnBurst])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
}

/** Helper: dispara una ráfaga desde un evento de click */
export function fireBurst(e: React.MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const container = target.closest('[data-burst]') as HTMLElement | null
  if (!container) return
  container.dispatchEvent(new CustomEvent('particleBurst', {
    detail: { x: e.clientX, y: e.clientY, count: 55 },
    bubbles: false,
  }))
}
