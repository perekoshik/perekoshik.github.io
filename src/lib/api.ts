import type { Product, ProductPayload } from '@/types/product'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await safeGetError(response)
    throw new Error(message)
  }

  return response.status === 204 ? (undefined as T) : await response.json()
}

async function safeGetError(response: Response) {
  try {
    const data = await response.json()
    if (typeof data?.error === 'string') return data.error
  } catch (error) {
    // ignore
  }
  return `Request failed with status ${response.status}`
}

export async function fetchProducts(params: { category?: string; limit?: number; offset?: number } = {}) {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (typeof params.limit === 'number') search.set('limit', `${params.limit}`)
  if (typeof params.offset === 'number') search.set('offset', `${params.offset}`)
  const query = search.toString() ? `?${search.toString()}` : ''
  const data: { items: ServerProduct[]; total: number } = await request(`/products${query}`, { method: 'GET' })
  return {
    items: data.items.map(mapProduct),
    total: data.total,
  }
}

export async function fetchProduct(id: string) {
  const data: ServerProduct = await request(`/products/${id}`, { method: 'GET' })
  return mapProduct(data)
}

export async function createProduct(payload: ProductPayload, token: string) {
  const data = await request<ServerProduct>('/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toServerPayload(payload)),
  })
  return mapProduct(data)
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>, token: string) {
  await request<void>(`/products/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toServerPayload(payload)),
  })
}

export async function deleteProduct(id: number, token: string) {
  await request<void>(`/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function uploadImage(file: File, token: string) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const message = await safeGetError(response)
    throw new Error(message)
  }

  const data: { url: string; filename: string } = await response.json()
  return {
    ...data,
    url: toAbsoluteFileUrl(data.url),
  }
}

type ServerProduct = {
  id: number
  seller_id: number
  title: string
  description: string
  highlights: string[]
  price_ton: number
  category: string
  images: string[]
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function mapProduct(server: ServerProduct): Product {
  return {
    id: server.id,
    sellerId: server.seller_id,
    title: server.title,
    description: server.description,
    highlights: server.highlights ?? [],
    priceTon: server.price_ton,
    category: server.category,
    images: server.images ?? [],
    stock: server.stock,
    isActive: server.is_active,
    createdAt: server.created_at,
    updatedAt: server.updated_at,
  }
}

function toServerPayload(payload: Partial<ProductPayload>) {
  const mapped: Record<string, unknown> = {}
  if ('title' in payload && payload.title !== undefined) mapped.title = payload.title
  if ('description' in payload && payload.description !== undefined) mapped.description = payload.description
  if ('highlights' in payload && payload.highlights !== undefined) mapped.highlights = payload.highlights
  if ('priceTon' in payload && payload.priceTon !== undefined) mapped.price_ton = payload.priceTon
  if ('category' in payload && payload.category !== undefined) mapped.category = payload.category
  if ('images' in payload && payload.images !== undefined) mapped.images = payload.images
  if ('stock' in payload && payload.stock !== undefined) mapped.stock = payload.stock
  if ('isActive' in payload && payload.isActive !== undefined) mapped.is_active = payload.isActive
  return mapped
}

function toAbsoluteFileUrl(url: string) {
  if (!url) return url
  try {
    const constructed = new URL(url, API_ORIGIN)
    return constructed.toString()
  } catch (error) {
    return url
  }
}
