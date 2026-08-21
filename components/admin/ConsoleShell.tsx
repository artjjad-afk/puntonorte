'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebarNav } from './AdminSidebarNav'

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin/login')) {
    return <>{children}</>
  }

  return (
    <div className="console" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar fijo — siempre visible al hacer scroll */}
      <AdminSidebarNav />
      {/* Contenido con scroll independiente */}
      <main
        className="console-stage"
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          height: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  )
}
