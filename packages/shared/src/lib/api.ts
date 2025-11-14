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
  createdAt: number;
};

export const Api = {
  listShops: () => request<ShopRecord[]>('/shops'),
  saveShop: (address: string) =>
    request<ShopRecord>('/shops', { method: 'POST', body: JSON.stringify({ address }) }),
};
