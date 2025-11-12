const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type ShopRecord = {
  address: string;
  owner: string;
  shopName: string;
  category: string;
  createdAt: number;
  updatedAt: number;
};

export type ItemRecord = {
  id: string;
  shopAddress: string;
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  category: string;
  createdAt: number;
};

export type ProfileRecord = {
  wallet: string;
  deliveryAddress: string;
};

export type OrderRecord = {
  id: string;
  buyer: string;
  shopAddress: string;
  itemId: string;
  price: string;
  deliveryAddress: string;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export const Api = {
  listShops: () => request<ShopRecord[]>('/shops'),
  saveShop: (payload: Partial<ShopRecord>) =>
    request<ShopRecord>('/shops', { method: 'POST', body: JSON.stringify(payload) }),
  listItems: (shopAddress?: string) => {
    const query = shopAddress ? `?shopAddress=${encodeURIComponent(shopAddress)}` : '';
    return request<ItemRecord[]>(`/items${query}`);
  },
  getItem: (id: string) => request<ItemRecord>(`/items/${encodeURIComponent(id)}`),
  saveItem: (payload: Partial<ItemRecord>) =>
    request<ItemRecord>('/items', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: (wallet: string) => request<ProfileRecord>(`/profiles/${wallet}`),
  saveProfile: (wallet: string, deliveryAddress: string) =>
    request<ProfileRecord>(`/profiles/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify({ deliveryAddress }),
    }),
  listOrders: (params?: { buyer?: string; shopAddress?: string }) => {
    const search = new URLSearchParams();
    if (params?.buyer) search.set('buyer', params.buyer);
    if (params?.shopAddress) search.set('shopAddress', params.shopAddress);
    const query = search.toString();
    return request<OrderRecord[]>(`/orders${query ? `?${query}` : ''}`);
  },
  createOrder: (payload: Partial<OrderRecord>) =>
    request<OrderRecord>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (id: string, status: string) =>
    request<OrderRecord>(`/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
