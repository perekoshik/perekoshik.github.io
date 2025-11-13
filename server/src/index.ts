import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createDatabaseApi } from './db.js';
import type { ItemRecord, ProfileRecord, ShopRecord } from './types.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const DATABASE_PATH = process.env.DATABASE_PATH ?? './data.sqlite';

async function bootstrap() {
  const db = await createDatabaseApi(DATABASE_PATH);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  // Простая проверка для uptime-монитора и CI.
  res.json({ ok: true });
});

  app.get('/shops', (_req, res) => {
    res.json(db.listShops());
  });

  app.post('/shops', (req, res) => {
    const { address, owner, shopName, category } = req.body as Partial<ShopRecord>;
    if (!address || !owner || !shopName) {
      res.status(400).json({ error: 'address, owner, shopName are required' });
      return;
    }
    const now = Date.now();
    const record: ShopRecord = {
      address,
      owner,
      shopName,
      category: category ?? 'All',
      createdAt: now,
      updatedAt: now,
    };
    db.upsertShop(record);
    res.json(record);
  });

  app.get('/items', (req, res) => {
    const { shopAddress } = req.query as { shopAddress?: string };
    res.json(db.listItems(shopAddress));
  });

  app.get('/items/:id', (req, res) => {
    const item = db.getItem(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'item not found' });
      return;
    }
    res.json(item);
  });

  app.post('/items', (req, res) => {
    const { id, shopAddress, title, description, price, imageSrc, category } = req.body as Partial<ItemRecord>;
    if (!id || !shopAddress || !title || !description || !price || !imageSrc) {
      res.status(400).json({ error: 'id, shopAddress, title, description, price, imageSrc are required' });
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
    db.upsertItem(record);
    res.json(record);
  });

  app.get('/profiles/:wallet', (req, res) => {
    const profile = db.getProfile(req.params.wallet);
    res.json(profile ?? { wallet: req.params.wallet, deliveryAddress: '' });
  });

  app.put('/profiles/:wallet', (req, res) => {
    const { deliveryAddress } = req.body as Partial<ProfileRecord>;
    if (typeof deliveryAddress !== 'string') {
      res.status(400).json({ error: 'deliveryAddress must be a string' });
      return;
    }
    const record: ProfileRecord = { wallet: req.params.wallet, deliveryAddress };
    db.saveProfile(record);
    res.json(record);
  });

  app.get('/orders', (req, res) => {
    const { buyer, shopAddress } = req.query as { buyer?: string; shopAddress?: string };
    res.json(db.listOrders({ buyer, shopAddress }));
  });

  app.post('/orders', (req, res) => {
    const { buyer, shopAddress, itemId, price, deliveryAddress } = req.body as Partial<{
      buyer: string;
      shopAddress: string;
      itemId: string;
      price: string;
      deliveryAddress: string;
    }>;
    if (!buyer || !shopAddress || !itemId || !price || !deliveryAddress) {
      res.status(400).json({ error: 'buyer, shopAddress, itemId, price, deliveryAddress required' });
      return;
    }
    const record = db.createOrder({
      buyer,
      shopAddress,
      itemId,
      price,
      deliveryAddress,
      status: 'pending',
    });
    res.json(record);
  });

  app.patch('/orders/:id', (req, res) => {
    const { status } = req.body as { status?: string };
    if (!status?.trim()) {
      res.status(400).json({ error: 'status must be provided' });
      return;
    }
    const updated = db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'order not found' });
      return;
    }
    res.json(updated);
  });

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
