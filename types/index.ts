export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  category: 'dama' | 'caballero' | 'accesorios' | 'perfumes' | 'cargadores'
  subcategory?: string
  images: string[]
  description: string
  sizes?: string[]
  colors?: string[]
  inStock: boolean
  featured: boolean
  badge?: string
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
  id: string
  items: CartItem[]
  total: number
  customer: CustomerInfo
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: string
}
