'use client'
import { useEffect, useRef } from 'react'

interface BubblesCanvasProps {
  count?: number
  dark?: boolean
}

export function BubblesCanvas({ count = 12, dark = false }: BubblesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const SCALE = 0.45
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })!
    let animId: number
    let W = 0, H = 0
    let lastFrame = 0
    const FRAME_MS = 1000 / 22  // 22 FPS para burbujas — imperceptible
    let visible = true

    const resize = () => {
      W = canvas.offsetWidth  * SCALE
      H = canvas.offsetHeight * SCALE
      canvas.width  = W
      canvas.height = H
    }
    resize()
    window.addEventListener('resize', resize)

    // Pausar animación cuando sección está fuera del viewport
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting },
      { rootMargin: '200px' }
    )
    observer.observe(canvas.parentElement ?? canvas)

    type Bubble = {
      x: number; y: number; r: number; vx: number; vy: number
      opacity: number; hue: number; phase: number; phaseSpeed: number
    }

    const bubbles: Bubble[] = Array.from({ length: count }, () => ({
      x:          Math.random() * (W || 300),
      y:          (H || 300) + Math.random() * (H || 300),
      r:          3 + Math.random() * 13,
      vx:         (Math.random() - 0.5) * 0.35,
      vy:         -(0.22 + Math.random() * 0.65),
      opacity:    0.06 + Math.random() * 0.16,
      hue:        dark ? 22 + Math.random() * 28 : Math.random() * 360,
      phase:      Math.random() * Math.PI * 2,
      phaseSpeed: 0.007 + Math.random() * 0.016,
    }))

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw)
      if (!visible) return
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now

      ctx.clearRect(0, 0, W, H)

      for (const b of bubbles) {
        b.phase += b.phaseSpeed
        const r = b.r + Math.sin(b.phase) * 1.2
        b.x += b.vx + Math.sin(b.phase * 0.35) * 0.2
        b.y += b.vy
        if (b.y + r < 0) { b.y = H + r; b.x = Math.random() * W }

        const grad = ctx.createRadialGradient(
          b.x - r * 0.22, b.y - r * 0.22, r * 0.04,
          b.x, b.y, r
        )
        if (dark) {
          grad.addColorStop(0, `hsla(${b.hue},85%,76%,${b.opacity * 1.25})`)
          grad.addColorStop(0.55, `hsla(${b.hue},72%,50%,${b.opacity * 0.45})`)
          grad.addColorStop(1, 'hsla(0,0%,0%,0)')
        } else {
          grad.addColorStop(0, `hsla(${b.hue},78%,70%,${b.opacity})`)
          grad.addColorStop(0.55, `hsla(${b.hue},62%,50%,${b.opacity * 0.3})`)
          grad.addColorStop(1, 'hsla(0,0%,0%,0)')
        }

        ctx.beginPath()
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Highlight
        ctx.beginPath()
        ctx.arc(b.x - r * 0.25, b.y - r * 0.25, r * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.5})`
        ctx.fill()
      }
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [count, dark])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
        willChange: 'contents',
        imageRendering: 'pixelated',
      }}
    />
  )
}
