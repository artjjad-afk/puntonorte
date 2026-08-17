'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, size?: string, color?: string) => void
  removeItem: (productId: number, size?: string, color?: string) => void
  updateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

function matches(item: CartItem, id: number, size?: string, color?: string) {
  return item.product.id === id
    && item.selectedSize  === size
    && item.selectedColor === color
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, size, color) => {
        const items = get().items
        const existing = items.find(i => matches(i, product.id, size, color))
        if (existing) {
          set({
            items: items.map(i =>
              matches(i, product.id, size, color)
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
        set({ items: get().items.filter(i => !matches(i, productId, size, color)) })
      },

      updateQuantity: (productId, quantity, size, color) => {
        if (quantity <= 0) { get().removeItem(productId, size, color); return }
        set({
          items: get().items.map(i =>
            matches(i, productId, size, color) ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    {
      name: 'punto-norte-cart',
      // No persistir el estado de apertura del carrito
      partialize: (state) => ({ items: state.items }),
    }
  )
)
