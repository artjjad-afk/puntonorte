'use client'
import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (!visible) return null

  return (
    <button
      onClick={scrollUp}
      aria-label="Volver arriba"
      style={{
        position: 'fixed', bottom: '100px', right: '24px', zIndex: 998,
        width: '44px', height: '44px', borderRadius: '12px',
        background: '#211f1e', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        animation: 'fadeIn .3s ease both',
        transition: 'background .2s, transform .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#c1692b'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#211f1e'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <ChevronUp size={20} />
    </button>
  )
}
