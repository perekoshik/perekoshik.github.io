export interface ShopRecord {
  address: string;
  owner: string;
  shopName: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface ItemRecord {
  id: string;
  shopAddress: string;
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  category: string;
  createdAt: number;
}

export interface ProfileRecord {
  wallet: string;
  deliveryAddress: string;
}

export interface OrderRecord {
  id: string;
  buyer: string;
  shopAddress: string;
  itemId: string;
  price: string;
  deliveryAddress: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}
