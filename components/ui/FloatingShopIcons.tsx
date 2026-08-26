'use client'
import {
  ShoppingBag, Tag, Gift, Heart, Sparkles, Star, Percent,
  ShoppingCart, Shirt, Crown, Flame, BadgePercent, Diamond,
} from 'lucide-react'

type IconCmp = React.ComponentType<{ size?: number; strokeWidth?: number }>

type FloatItem = {
  Icon: IconCmp
  top: string; left: string
  size: number; color: string
  dur: number; delay: number; rot: number
  anim: 'pn-fl-a' | 'pn-fl-b' | 'pn-fl-c'
}

// Posiciones/colores fijos (no aleatorios) para evitar mismatch de hidratación.
const ITEMS: FloatItem[] = [
  { Icon: ShoppingBag,  top: '12%', left: '6%',  size: 40, color: '#ec4899', dur: 7,   delay: 0,   rot: -12, anim: 'pn-fl-a' },
  { Icon: Tag,          top: '22%', left: '88%', size: 34, color: '#10b981', dur: 8,   delay: 1,   rot: 10,  anim: 'pn-fl-b' },
  { Icon: Gift,         top: '66%', left: '4%',  size: 38, color: '#8b5cf6', dur: 9,   delay: 0.5, rot: 8,   anim: 'pn-fl-c' },
  { Icon: Heart,        top: '78%', left: '90%', size: 30, color: '#f43f5e', dur: 7.5, delay: 1.5, rot: -8,  anim: 'pn-fl-a' },
  { Icon: Percent,      top: '8%',  left: '46%', size: 28, color: '#f59e0b', dur: 6.5, delay: 0.8, rot: 14,  anim: 'pn-fl-b' },
  { Icon: Sparkles,     top: '82%', left: '40%', size: 32, color: '#0ea5e9', dur: 8.5, delay: 0.3, rot: -10, anim: 'pn-fl-c' },
  { Icon: Star,         top: '40%', left: '12%', size: 26, color: '#fbbf24', dur: 7,   delay: 2,   rot: 6,   anim: 'pn-fl-a' },
  { Icon: ShoppingCart, top: '54%', left: '92%', size: 36, color: '#14b8a6', dur: 9,   delay: 0.2, rot: -14, anim: 'pn-fl-b' },
  { Icon: Shirt,        top: '30%', left: '30%', size: 30, color: '#6366f1', dur: 10,  delay: 1.2, rot: 12,  anim: 'pn-fl-c' },
  { Icon: Crown,        top: '60%', left: '68%', size: 28, color: '#eab308', dur: 8,   delay: 0.6, rot: -6,  anim: 'pn-fl-a' },
  { Icon: Flame,        top: '15%', left: '72%', size: 30, color: '#f97316', dur: 7.2, delay: 1.8, rot: 10,  anim: 'pn-fl-b' },
  { Icon: BadgePercent, top: '88%', left: '64%', size: 30, color: '#d946ef', dur: 9.5, delay: 0.9, rot: -12, anim: 'pn-fl-c' },
  { Icon: Diamond,      top: '48%', left: '82%', size: 26, color: '#22d3ee', dur: 7.8, delay: 1.4, rot: 8,   anim: 'pn-fl-a' },
]

/**
 * Capa decorativa de iconos de tienda flotando en colores.
 * Puramente CSS (transform/opacity) → ligera, no afecta el rendimiento móvil.
 * `offset` rota el arreglo para que dos instancias no se vean idénticas.
 */
export function FloatingShopIcons({ offset = 0, opacity = 0.65 }: { offset?: number; opacity?: number }) {
  const items = offset ? [...ITEMS.slice(offset), ...ITEMS.slice(0, offset)] : ITEMS
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}
    >
      {items.map((it, i) => (
        <span
          key={i}
          className={`pn-floaticon ${it.anim}`}
          style={{
            position: 'absolute',
            top: it.top,
            left: it.left,
            color: it.color,
            opacity,
            animationDuration: `${it.dur}s`,
            animationDelay: `${it.delay}s`,
            ['--r' as string]: `${it.rot}deg`,
          }}
        >
          <it.Icon size={it.size} strokeWidth={2.2} />
        </span>
      ))}
    </div>
  )
}
