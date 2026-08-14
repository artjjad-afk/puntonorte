'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

// Helper: compara IDs como string para soportar tanto IDs numéricos (DB) como string (legacy)
function sameId(a: string | number, b: string | number): boolean {
  return String(a) === String(b)
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, size?: string, color?: string) => void
  removeItem: (productId: string | number, size?: string, color?: string) => void
  updateQuantity: (productId: string | number, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, size, color) => {
        const items = get().items
        const existing = items.find(
          i => sameId(i.product.id, product.id) && i.selectedSize === size && i.selectedColor === color
        )
        if (existing) {
          set({
            items: items.map(i =>
              sameId(i.product.id, product.id) && i.selectedSize === size && i.selectedColor === color
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, quantity: 1, selectedSize: size, selectedColor: color }] })
        }
        set({ isOpen: true })
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            i => !(sameId(i.product.id, productId) && i.selectedSize === size && i.selectedColor === color)
          ),
        })
      },

      updateQuantity: (productId, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        set({
          items: get().items.map(i =>
            sameId(i.product.id, productId) && i.selectedSize === size && i.selectedColor === color
              ? { ...i, quantity }
              : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'punto-norte-cart' }
  )
)
