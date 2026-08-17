'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  ids: number[]
  toggle: (id: number) => void
  has: (id: number) => boolean
  count: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (id) => {
        const ids = get().ids
        set({ ids: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] })
      },

      has: (id) => get().ids.includes(id),

      count: () => get().ids.length,
    }),
    { name: 'punto-norte-wishlist' }
  )
)
