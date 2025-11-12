import express from 'express';
import cors from 'cors';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, 'data.json');

const app = express();
app.use(cors());
app.use(express.json());

interface Database {
  shops: ShopRecord[];
  items: ItemRecord[];
  profiles: ProfileRecord[];
  orders: OrderRecord[];
}

let db: Database = await loadDb();

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/shops', (_req, res) => {
  res.json(db.shops);
});

app.post('/shops', (req, res) => {
  const { address, owner, shopName, category } = req.body as Partial<ShopRecord>;
  if (!address || !owner || !shopName) {
    res.status(400).json({ error: 'address, owner, shopName required' });
    return;
  }
  const existingIndex = db.shops.findIndex((shop) => shop.address === address);
  const record: ShopRecord = {
    address,
    owner,
    shopName,
    category: category ?? 'All',
    createdAt: existingIndex >= 0 ? db.shops[existingIndex].createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  if (existingIndex >= 0) {
    db.shops[existingIndex] = record;
  } else {
    db.shops.push(record);
  }
  saveDb();
  res.json(record);
});

app.get('/items', (req, res) => {
  const { shopAddress } = req.query;
  const list = shopAddress
    ? db.items.filter((item) => item.shopAddress === shopAddress)
    : db.items;
  res.json(list);
});

app.get('/items/:id', (req, res) => {
  const item = db.items.find((entry) => entry.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'item not found' });
    return;
  }
  res.json(item);
});

app.post('/items', (req, res) => {
  const { id, shopAddress, title, description, price, imageSrc, category } =
    req.body as Partial<ItemRecord>;
  if (!id || !shopAddress || !title || !description || !price || !imageSrc) {
    res
      .status(400)
      .json({ error: 'id, shopAddress, title, description, price, imageSrc are required' });
    return;
  }
  const record: ItemRecord = {
    id,
    shopAddress,
    title,
    description,
    price,
    imageSrc,
    category: category ?? 'All',
    createdAt: Date.now(),
  };
  const existingIndex = db.items.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    db.items[existingIndex] = record;
  } else {
    db.items.push(record);
  }
  saveDb();
  res.json(record);
});

app.get('/profiles/:wallet', (req, res) => {
  const profile = db.profiles.find((entry) => entry.wallet === req.params.wallet);
  res.json(profile ?? { wallet: req.params.wallet, deliveryAddress: '' });
});

app.put('/profiles/:wallet', (req, res) => {
  const { deliveryAddress } = req.body as Partial<ProfileRecord>;
  if (typeof deliveryAddress !== 'string') {
    res.status(400).json({ error: 'deliveryAddress must be a string' });
    return;
  }
  const existingIndex = db.profiles.findIndex((entry) => entry.wallet === req.params.wallet);
  const record: ProfileRecord = { wallet: req.params.wallet, deliveryAddress };
  if (existingIndex >= 0) {
    db.profiles[existingIndex] = record;
  } else {
    db.profiles.push(record);
  }
  saveDb();
  res.json(record);
});

app.get('/orders', (req, res) => {
  const { buyer, shopAddress } = req.query as { buyer?: string; shopAddress?: string };
  const list = db.orders.filter((order) => {
    if (buyer && order.buyer !== buyer) {
      return false;
    }
    if (shopAddress && order.shopAddress !== shopAddress) {
      return false;
    }
    return true;
  });
  res.json(list);
});

app.post('/orders', (req, res) => {
  const { buyer, shopAddress, itemId, price, deliveryAddress } = req.body as Partial<OrderRecord>;
  if (!buyer || !shopAddress || !itemId || !price || !deliveryAddress) {
    res.status(400).json({ error: 'buyer, shopAddress, itemId, price, deliveryAddress required' });
    return;
  }
  const record: OrderRecord = {
    id: randomUUID(),
    buyer,
    shopAddress,
    itemId,
    price,
    deliveryAddress,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.orders.push(record);
  saveDb();
  res.json(record);
});

app.patch('/orders/:id', (req, res) => {
  const { status } = req.body as Partial<OrderRecord>;
  if (typeof status !== 'string' || !status.trim()) {
    res.status(400).json({ error: 'status must be a non-empty string' });
    return;
  }
  const order = db.orders.find((entry) => entry.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'order not found' });
    return;
  }
  order.status = status;
  order.updatedAt = Date.now();
  saveDb();
  res.json(order);
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

async function loadDb(): Promise<Database> {
  if (!existsSync(DATA_PATH)) {
    await mkdir(dirname(DATA_PATH), { recursive: true });
    await writeFile(
      DATA_PATH,
      JSON.stringify({ shops: [], items: [], profiles: [], orders: [] }, null, 2),
      'utf-8',
    );
  }
  const raw = await readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Database;
}

function saveDb() {
  writeFile(DATA_PATH, JSON.stringify(db, null, 2), 'utf-8').catch((error) =>
    console.error('Failed to persist DB', error),
  );
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
