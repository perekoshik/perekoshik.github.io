export type ISODate = string;

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'canceled' | 'refunded';

export interface SellerRecord {
  wallet: string;
  telegramId?: number;
  telegramUsername?: string;
  telegramName?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ProductRecord {
  id: string;
  sellerWallet: string;
  title: string;
  description: string;
  priceTon: number;
  imageUrl: string;
  imageSizeBytes: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  active: boolean;
}

export interface OrderRecord {
  id: string;
  productId: string;
  sellerWallet: string;
  buyerWallet: string;
  priceTon: number;
  platformFeeTon: number;
  sellerAmountTon: number;
  status: OrderStatus;
  txHash?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface RatingRecord {
  productId: string;
  wallet: string;
  rating: number;
  comment?: string;
  createdAt: ISODate;
}

export interface SellerTokenRecord {
  tokenHash: string;
  wallet: string;
  expiresAt: number;
  createdAt: ISODate;
}

export interface ChallengeRecord {
  payload: string;
  expiresAt: number;
}
