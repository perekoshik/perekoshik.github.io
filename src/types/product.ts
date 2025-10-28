export type Product = {
  id: number
  sellerId: number
  title: string
  description: string
  highlights: string[]
  priceTon: number
  category: string
  images: string[]
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ProductPayload = {
  title: string
  description: string
  highlights: string[]
  priceTon: number
  category: string
  images: string[]
  stock: number
  isActive?: boolean
}
