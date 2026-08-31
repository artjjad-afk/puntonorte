'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { SearchDropdown } from '@/components/ui/SearchDropdown'

export type NavLink = {
  href: string
  label: string
  subs?: { href: string; label: string }[]
}

const FALLBACK_LINKS: NavLink[] = []
// Sin fallback — si no hay categorías en la DB, el menú queda vacío

export function Navbar({ initialLinks }: { initialLinks?: NavLink[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openSub, setOpenSub] = useState<string | null>(null) // acordeón móvil
  // Iniciar con los links pre-cargados desde el servidor — sin delay
  const [navLinks, setNavLinks] = useState<NavLink[]>(initialLinks ?? FALLBACK_LINKS)
  const { openCart, count } = useCartStore()
  const cartCount = count()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/categories', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const links: NavLink[] = [
            { href: '/tienda', label: 'Tienda' },
            ...data
              .filter((c: { slug: string; name: string; showInNav?: boolean }) => c.showInNav !== false)
              .slice(0, 6)
              .map((c: { slug: string; name: string; subcategories?: { slug: string; name: string }[] }) => ({
                href: `/tienda?cat=${c.slug}`,
                label: c.name,
                subs: Array.isArray(c.subcategories)
                  ? c.subcategories.map(s => ({ href: `/tienda?cat=${c.slug}&sub=${s.slug}`, label: s.name }))
                  : [],
              }))
          ]
          setNavLinks(links)
        } else {
          // Sin categorías — solo mostrar Tienda
          setNavLinks([{ href: '/tienda', label: 'Tienda' }])
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        .nav-desktop { display: flex; gap: 4px; }
        .nav-cta { display: inline-flex; }
        .nav-hamburger { display: none !important; }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .nav-link { color: rgba(232,229,226,0.85); text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.8px; padding: 8px 14px; border-radius: 8px; transition: all 0.2s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
        /* Dropdown de subopciones (desktop) */
        .nav-item { position: relative; display: inline-flex; }
        .nav-item::after { content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 10px; } /* puente para no perder el hover */
        .nav-dropdown { position: absolute; top: calc(100% + 8px); left: 0; min-width: 190px; background: #211f1e; border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; padding: 6px; box-shadow: 0 14px 44px rgba(0,0,0,0.45); opacity: 0; visibility: hidden; transform: translateY(6px); transition: opacity .18s, transform .18s, visibility .18s; z-index: 60; }
        .nav-item:hover .nav-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
        .nav-dropdown-link { display: block; padding: 9px 12px; border-radius: 8px; color: rgba(232,229,226,0.8); text-decoration: none; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all .15s; }
        .nav-dropdown-link:hover { background: rgba(255,255,255,0.08); color: #fff; padding-left: 16px; }
        .nav-dropdown-all { border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 4px; color: rgba(232,229,226,0.55); font-size: 12px; }
        .mobile-sublink { display: block; padding: 12px 0 12px 4px; color: rgba(232,229,226,0.62); text-decoration: none; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: color .2s; }
        .mobile-sublink:hover { color: #c1692b; }
        .mobile-link { display: flex; align-items: center; justify-content: space-between; color: #e8e5e2; text-decoration: none; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 16px; font-weight: 500; transition: color 0.2s; }
        .mobile-link:hover { color: #c1692b; }
        .mobile-link:last-child { border-bottom: none; }
        .nav-icon-btn { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: rgba(232,229,226,0.8); background: rgba(255,255,255,0.06); border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .nav-icon-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
      `}</style>

      {/* Announcement bar con gradiente animado */}
      <div className="announcement-bar" style={{ color: '#fff', fontSize: '12px', textAlign: 'center', padding: '9px 16px', fontWeight: '700', letterSpacing: '0.8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div className="animate-marquee" style={{ display: 'inline-flex', gap: '60px', width: 'max-content' }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ display: 'inline-flex', gap: '48px' }}>
              <span>✦ ENVÍO A TODA VENEZUELA</span>
              <span>✦ ZELLE · PAGO MÓVIL · EFECTIVO</span>
              <span>✦ ATENCIÓN POR WHATSAPP</span>
              <span>✦ BARCELONA, ANZOÁTEGUI</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(33,31,30,0.94)' : '#211f1e',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.25)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        <div className="navbar-inner" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-removebg-preview.png" alt="Punto Norte" style={{ height: '44px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">
            {navLinks.map(link => (
              link.subs && link.subs.length > 0 ? (
                <div key={link.href} className="nav-item">
                  <Link href={link.href} className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {link.label} <ChevronDown size={13} style={{ opacity: 0.6 }} />
                  </Link>
                  <div className="nav-dropdown">
                    <Link href={link.href} className="nav-dropdown-link nav-dropdown-all">Ver todo {link.label}</Link>
                    {link.subs.map(s => (
                      <Link key={s.href} href={s.href} className="nav-dropdown-link">{s.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setSearchOpen(true)} className="nav-icon-btn" title="Buscar">
              <Search size={18} />
            </button>

            <button onClick={openCart} className="nav-icon-btn" style={{ position: 'relative' }}>
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  background: 'linear-gradient(135deg, #e88c4a, #c1692b)',
                  color: '#fff', borderRadius: '50%',
                  width: '17px', height: '17px', fontSize: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', boxShadow: '0 0 8px rgba(193,105,43,.7), 0 0 0 2px #211f1e',
                  animation: 'badge-pulse 2s ease-in-out infinite',
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <Link href="/tienda" className="btn-primary nav-cta" style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '13px' }}>
              <span className="shine" />
              Comprar ahora
            </Link>

            <button onClick={() => setMenuOpen(o => !o)} className="nav-icon-btn nav-hamburger" aria-label="Menú">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Search dropdown */}
      {searchOpen && <SearchDropdown onClose={() => setSearchOpen(false)} />}

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Mobile menu drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: '320px',
        background: '#1a1817', zIndex: 99, display: 'flex', flexDirection: 'column',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.4)',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-removebg-preview.png" alt="Punto Norte" style={{ height: '36px', filter: 'brightness(0) invert(1)' }} />
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#e8e5e2', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
          {navLinks.map(link => (
            link.subs && link.subs.length > 0 ? (
              <div key={link.href}>
                <div className="mobile-link" style={{ cursor: 'pointer' }}
                  onClick={() => setOpenSub(o => o === link.href ? null : link.href)}>
                  {link.label}
                  <ChevronDown size={16} style={{ opacity: 0.5, transition: 'transform .2s', transform: openSub === link.href ? 'rotate(180deg)' : 'none' }} />
                </div>
                {openSub === link.href && (
                  <div style={{ padding: '4px 0 10px 12px' }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)} className="mobile-sublink">Ver todo {link.label}</Link>
                    {link.subs.map(s => (
                      <Link key={s.href} href={s.href} onClick={() => setMenuOpen(false)} className="mobile-sublink">{s.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="mobile-link">
                {link.label}
                <ChevronRight size={16} style={{ opacity: 0.4 }} />
              </Link>
            )
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/tienda" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ padding: '14px', borderRadius: '12px', fontSize: '14px', width: '100%', textAlign: 'center' }}>
            <span className="shine" />
            Ver toda la tienda
          </Link>
          <a href="https://wa.me/584140906768" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', borderRadius: '12px', background: '#25d366', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>

        {/* Location badge */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(232,229,226,0.35)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> Barcelona, Anzoátegui · Envíos nacionales</span>
        </div>
      </div>
    </>
  )
}
