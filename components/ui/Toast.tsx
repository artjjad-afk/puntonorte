'use client'
import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, X, ShoppingCart, AlertCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'cart'
interface Toast { id: number; message: string; sub?: string; type: ToastType }
interface ToastCtx { show: (msg: string, sub?: string, type?: ToastType) => void }

const ToastContext = createContext<ToastCtx>({ show: () => {} })
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, sub?: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, sub, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  const remove = (id: number) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position:'fixed', bottom:'90px', right:'24px', zIndex:999, display:'flex', flexDirection:'column', gap:'10px', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display:'flex', alignItems:'center', gap:'12px',
            background:'#211f1e', color:'#fff', padding:'14px 16px',
            borderRadius:'14px', boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
            border:'1px solid rgba(255,255,255,0.08)',
            minWidth:'280px', maxWidth:'340px',
            animation:'toastIn .3s cubic-bezier(0.34,1.56,0.64,1) both',
            pointerEvents:'all',
          }}>
            <style>{`
              @keyframes toastIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
            `}</style>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
              background: t.type === 'cart' ? 'rgba(193,105,43,0.2)' : t.type === 'error' ? 'rgba(229,62,62,0.2)' : 'rgba(37,211,102,0.2)' }}>
              {t.type === 'cart' && <ShoppingCart size={17} color="#c1692b" />}
              {t.type === 'success' && <CheckCircle size={17} color="#25d366" />}
              {t.type === 'error' && <AlertCircle size={17} color="#e53e3e" />}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontWeight:'700', fontSize:'13px', lineHeight:'1.3' }}>{t.message}</p>
              {t.sub && <p style={{ margin:'2px 0 0', fontSize:'12px', color:'rgba(232,229,226,0.6)', lineHeight:'1.3' }}>{t.sub}</p>}
            </div>
            <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', color:'rgba(232,229,226,0.5)', cursor:'pointer', padding:'2px', flexShrink:0 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
