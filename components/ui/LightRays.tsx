'use client'
import { useEffect, useRef } from 'react'

interface LightRaysProps {
  dark?: boolean
  rayCount?: number
}

export function LightRays({ dark = false, rayCount = 6 }: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const SCALE = 0.5
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })!
    let animId: number
    let W = 0, H = 0
    let t = 0
    let lastFrame = 0
    const FRAME_MS = 1000 / 28  // 28 FPS — fluido pero económico
    let visible = true

    const resize = () => {
      W = canvas.offsetWidth  * SCALE
      H = canvas.offsetHeight * SCALE
      canvas.width  = W
      canvas.height = H
    }
    resize()
    window.addEventListener('resize', resize)

    // Pausa cuando el canvas está fuera de pantalla
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting },
      { rootMargin: '200px' }
    )
    observer.observe(canvas.parentElement ?? canvas)

    type Ray = { angle: number; speed: number; hue: number; opacity: number; length: number; offset: number }
    const rays: Ray[] = Array.from({ length: rayCount }, (_, i) => ({
      angle:   (i / rayCount) * Math.PI * 2,
      speed:   0.0025 + (i % 3) * 0.0018,
      hue:     dark ? 20 + (i / rayCount) * 40 : (i / rayCount) * 360,
      opacity: 0.025 + (i % 4) * 0.012,
      length:  0.55 + (i % 3) * 0.18,
      offset:  (i / rayCount) * Math.PI * 2,
    }))

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw)
      if (!visible) return
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now
      t += 0.003

      ctx.clearRect(0, 0, W, H)
      const cx = W * 0.5, cy = H * 0.5

      for (const ray of rays) {
        const a = ray.angle + t * ray.speed * 16 + Math.sin(t + ray.offset) * 0.2
        const len = Math.max(W, H) * ray.length
        const op = ray.opacity * (0.65 + Math.sin(t * 1.6 + ray.offset) * 0.35)

        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a)*len, cy + Math.sin(a)*len)
        grad.addColorStop(0, `hsla(${ray.hue},82%,68%,${op * 1.3})`)
        grad.addColorStop(0.65, `hsla(${ray.hue+20},70%,58%,${op * 0.35})`)
        grad.addColorStop(1, 'hsla(0,0%,0%,0)')

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a - 0.032)*len, cy + Math.sin(a - 0.032)*len)
        ctx.lineTo(cx + Math.cos(a + 0.032)*len, cy + Math.sin(a + 0.032)*len)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Glow central
      const gr = Math.min(W, H) * 0.2
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr)
      glow.addColorStop(0, `rgba(193,105,43,${0.045 + Math.sin(t)*0.018})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI*2)
      ctx.fillStyle = glow; ctx.fill()
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [dark, rayCount])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
        mixBlendMode: dark ? 'screen' : 'multiply',
        willChange: 'contents',
        imageRendering: 'pixelated',
      }}
    />
  )
}
