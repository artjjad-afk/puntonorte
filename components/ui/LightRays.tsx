'use client'
import { useEffect, useRef } from 'react'

interface Ray {
  angle: number; speed: number; width: number
  hue: number; opacity: number; length: number; offset: number
}

interface LightRaysProps {
  dark?: boolean
  rayCount?: number
}

export function LightRays({ dark = false, rayCount = 8 }: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W; canvas.height = H
    let t = 0

    const rays: Ray[] = Array.from({ length: rayCount }, (_, i) => ({
      angle: (i / rayCount) * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
      width: 60 + Math.random() * 120,
      hue: dark
        ? 20 + (i / rayCount) * 40          // cálido para oscuro
        : 0  + (i / rayCount) * 360,        // todo espectro para claro
      opacity: 0.03 + Math.random() * 0.07,
      length: 0.6 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.006

      const cx = W * 0.5
      const cy = H * 0.5

      for (const ray of rays) {
        const angle = ray.angle + t * ray.speed * 20 + Math.sin(t + ray.offset) * 0.3
        const halfW = ray.width * (0.8 + Math.sin(t * 1.2 + ray.offset) * 0.2)
        const len = Math.max(W, H) * ray.length

        // Punto origen: esquina o borde aleatorio
        const ox = cx
        const oy = cy

        const x1 = ox + Math.cos(angle - 0.04) * len
        const y1 = oy + Math.sin(angle - 0.04) * len
        const x2 = ox + Math.cos(angle + 0.04) * len
        const y2 = oy + Math.sin(angle + 0.04) * len

        const grad = ctx.createLinearGradient(ox, oy, (x1 + x2) / 2, (y1 + y2) / 2)
        const op = ray.opacity * (0.7 + Math.sin(t * 2 + ray.offset) * 0.3)
        grad.addColorStop(0, `hsla(${ray.hue}, 90%, 70%, ${op * 1.5})`)
        grad.addColorStop(0.5, `hsla(${ray.hue + 20}, 80%, 60%, ${op * 0.5})`)
        grad.addColorStop(1, `hsla(${ray.hue + 40}, 70%, 50%, 0)`)

        ctx.beginPath()
        ctx.moveTo(ox - Math.cos(angle) * 5, oy - Math.sin(angle) * 5)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Glow central
      const glowR = Math.min(W, H) * 0.25
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      if (dark) {
        glow.addColorStop(0, `rgba(193,105,43,${0.06 + Math.sin(t) * 0.02})`)
        glow.addColorStop(1, 'rgba(193,105,43,0)')
      } else {
        glow.addColorStop(0, `rgba(232,140,74,${0.08 + Math.sin(t) * 0.03})`)
        glow.addColorStop(1, 'rgba(232,140,74,0)')
      }
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
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
      }}
    />
  )
}
