import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createDatabaseApi } from './db.js';
import type { ShopRecord } from './types.js';

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
    const { address } = req.body as Partial<ShopRecord>;
    if (!address?.trim()) {
      res.status(400).json({ error: 'address is required' });
      return;
    }
    const record = db.saveShop(address.trim());
    res.json(record);
  });

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
