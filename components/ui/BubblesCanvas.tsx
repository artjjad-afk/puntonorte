'use client'
import { useEffect, useRef } from 'react'

interface Bubble {
  x: number; y: number; r: number; vx: number; vy: number
  opacity: number; hue: number; pulse: number; pulseSpeed: number
}

interface BubblesCanvasProps {
  count?: number
  colors?: string[]
  dark?: boolean
}

export function BubblesCanvas({ count = 28, dark = false }: BubblesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const bubbles: Bubble[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * H,
      r: 4 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.3 + Math.random() * 0.9),
      opacity: 0.08 + Math.random() * 0.22,
      hue: dark
        ? 25 + Math.random() * 30          // cobre/naranja para fondo oscuro
        : 20 + Math.random() * 340,        // todo el espectro para fondo claro
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.025,
    }))

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      for (const b of bubbles) {
        b.pulse += b.pulseSpeed
        const r = b.r + Math.sin(b.pulse) * 2
        b.x += b.vx + Math.sin(b.pulse * 0.5) * 0.3
        b.y += b.vy

        if (b.y + r < 0) {
          b.y = H + r
          b.x = Math.random() * W
        }

        // Burbuja con gradiente interno
        const grad = ctx.createRadialGradient(
          b.x - r * 0.3, b.y - r * 0.3, r * 0.05,
          b.x, b.y, r
        )
        if (dark) {
          grad.addColorStop(0, `hsla(${b.hue}, 90%, 80%, ${b.opacity * 1.4})`)
          grad.addColorStop(0.5, `hsla(${b.hue}, 80%, 55%, ${b.opacity * 0.6})`)
          grad.addColorStop(1, `hsla(${b.hue}, 70%, 35%, 0)`)
        } else {
          grad.addColorStop(0, `hsla(${b.hue}, 85%, 75%, ${b.opacity * 1.2})`)
          grad.addColorStop(0.6, `hsla(${b.hue}, 70%, 55%, ${b.opacity * 0.4})`)
          grad.addColorStop(1, `hsla(${b.hue}, 60%, 40%, 0)`)
        }

        ctx.beginPath()
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Brillo especular (highlight)
        const shine = ctx.createRadialGradient(
          b.x - r * 0.35, b.y - r * 0.35, 0,
          b.x - r * 0.35, b.y - r * 0.35, r * 0.5
        )
        shine.addColorStop(0, `rgba(255,255,255,${b.opacity * 0.9})`)
        shine.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
        ctx.fillStyle = shine
        ctx.fill()

        // Borde de la burbuja
        ctx.beginPath()
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = dark
          ? `hsla(${b.hue}, 80%, 65%, ${b.opacity * 0.8})`
          : `hsla(${b.hue}, 70%, 60%, ${b.opacity * 0.5})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [count, dark])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}
