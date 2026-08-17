export interface Product {
  id: number                // número — igual que en la DB (era string, causaba bugs en el carrito)
  name: string
  slug: string
  price: number
  originalPrice?: number | null
  category: string          // string abierto — las categorías son dinámicas desde la DB
  subcategory?: string | null
  images: string[]
  description: string
  sizes?: string[]
  colors?: string[]
  inStock: boolean
  featured: boolean
  active?: boolean
  badge?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  city: string
  notes?: string
}

export interface Order {
  id: number               // número — igual que en la DB
  items: CartItem[]
  total: number
  customer: CustomerInfo
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}
