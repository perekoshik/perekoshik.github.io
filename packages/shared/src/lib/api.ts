const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type RequestOptions = RequestInit & { token?: string; parse?: boolean };

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onApiUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function notifyUnauthorized() {
  for (const listener of unauthorizedListeners) {
    try {
      listener();
    } catch (error) {
      console.warn('[api] unauthorized listener failed', error);
    }
  }
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { token, parse = true, ...rest } = init ?? {};
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(rest.headers ?? {}),
      ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
    ...rest,
  });
  if (!response.ok) {
    if (response.status === 401 && token) {
      notifyUnauthorized();
    }
    throw new Error(`API ${response.status}`);
  }
  if (!parse) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

export type SellerProfile = {
  wallet: string;
  telegramId?: number;
  telegramUsername?: string;
  telegramName?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  expiresAt: number;
  seller: SellerProfile;
};

export type AuthChallenge = {
  payload: string;
  domain: string;
  expiresAt: number;
};

export type ShopRecord = {
  address: string;
  owner: string;
  shopName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductRecord = {
  id: string;
  sellerWallet: string;
  shopAddress?: string | null;
  contractAddress?: string | null;
  title: string;
  description: string;
  priceTon: number;
  imageUrl: string;
  imageSizeBytes: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'canceled' | 'refunded';

export type OrderRecord = {
  id: string;
  productId: string;
  sellerWallet: string;
  buyerWallet: string;
  priceTon: number;
  platformFeeTon: number;
  sellerAmountTon: number;
  status: OrderStatus;
  txHash?: string;
  deliveryAddress?: string | null;
  tonOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TonProofPayload = {
  proof: {
    timestamp: number;
    domain: { lengthBytes: number; value: string };
    payload: string;
    signature: string;
  };
  state_init?: string;
};

export type BuyerOrderResponse = {
  order: OrderRecord;
  clientSecret: string;
};

export const Api = {
  requestAuthChallenge: () =>
    request<AuthChallenge>('/auth/challenge', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  login: (payload: unknown) =>
    request<AuthSession>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listProducts: () => request<ProductRecord[]>('/products'),
  getProduct: (id: string) => request<ProductRecord>(`/products/${encodeURIComponent(id)}`),
  createProduct: (
    token: string,
    payload: {
      id?: string;
      title: string;
      description: string;
      priceTon: number;
      imageData: string;
      shopAddress?: string;
      contractAddress?: string;
    },
  ) =>
    request<ProductRecord>('/products', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  rateProduct: (token: string, productId: string, payload: { rating: number; comment?: string }) =>
    request<void>(`/products/${encodeURIComponent(productId)}/rating`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
      parse: false,
    }),
  listOrders: (token: string) =>
    request<OrderRecord[]>('/orders', {
      method: 'GET',
      token,
    }),
  createOrder: (token: string, payload: { productId: string; buyerWallet: string }) =>
    request<OrderRecord>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  updateOrder: (token: string, id: string, payload: { status: OrderStatus; txHash?: string }) =>
    request<void>(`/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
      parse: false,
    }),
  saveShop: (token: string, payload: { address: string; owner: string; shopName: string; category?: string }) =>
    request<ShopRecord>('/shops', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  createBuyerOrder: (payload: { productId: string; buyerWallet: string; deliveryAddress: string }) =>
    request<BuyerOrderResponse>('/orders/public', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePublicOrder: (id: string, payload: { status: 'paid' | 'canceled'; txHash?: string; secret: string }) =>
    request<OrderRecord>(`/orders/${encodeURIComponent(id)}/public`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
