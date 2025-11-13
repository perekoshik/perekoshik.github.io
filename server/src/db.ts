import Database from 'better-sqlite3';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { ItemRecord, OrderRecord, ProfileRecord, ShopRecord } from './types.js';

let db: Database.Database | null = null;

async function initDatabase(filePath: string) {
  if (db) {
    return db;
  }
  const resolvedPath = resolve(filePath);
  const dir = dirname(resolvedPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS shops (
      address TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      shop_address TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      image_src TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (shop_address) REFERENCES shops(address) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profiles (
      wallet TEXT PRIMARY KEY,
      delivery_address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer TEXT NOT NULL,
      shop_address TEXT NOT NULL,
      item_id TEXT NOT NULL,
      price TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_items_shop ON items(shop_address);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer);
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_address);
  `);
  return db;
}

export interface DatabaseApi {
  listShops(): ShopRecord[];
  upsertShop(input: ShopRecord): ShopRecord;
  listItems(shopAddress?: string): ItemRecord[];
  getItem(id: string): ItemRecord | null;
  upsertItem(input: ItemRecord): ItemRecord;
  getProfile(wallet: string): ProfileRecord | null;
  saveProfile(record: ProfileRecord): ProfileRecord;
  listOrders(params?: { buyer?: string; shopAddress?: string }): OrderRecord[];
  createOrder(input: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>): OrderRecord;
  updateOrderStatus(id: string, status: string): OrderRecord | null;
}

export async function createDatabaseApi(databasePath: string): Promise<DatabaseApi> {
  const database = await initDatabase(databasePath);

  const listShopsStmt = database.prepare('SELECT address, owner, shop_name as shopName, category, created_at as createdAt, updated_at as updatedAt FROM shops');
  const insertShopStmt = database.prepare(
    `INSERT INTO shops(address, owner, shop_name, category, created_at, updated_at)
     VALUES(@address, @owner, @shopName, @category, @createdAt, @updatedAt)
     ON CONFLICT(address) DO UPDATE SET
       owner=excluded.owner,
       shop_name=excluded.shop_name,
       category=excluded.category,
       created_at=excluded.created_at,
       updated_at=excluded.updated_at`
  );

  const listItemsStmt = database.prepare(
    `SELECT id, shop_address as shopAddress, title, description, price, image_src as imageSrc, category, created_at as createdAt
     FROM items`
  );
  const listItemsByShopStmt = database.prepare(
    `SELECT id, shop_address as shopAddress, title, description, price, image_src as imageSrc, category, created_at as createdAt
     FROM items WHERE shop_address = ?`
  );
  const getItemStmt = database.prepare(
    `SELECT id, shop_address as shopAddress, title, description, price, image_src as imageSrc, category, created_at as createdAt
     FROM items WHERE id = ?`
  );
  const insertItemStmt = database.prepare(
    `INSERT INTO items(id, shop_address, title, description, price, image_src, category, created_at)
     VALUES(@id, @shopAddress, @title, @description, @price, @imageSrc, @category, @createdAt)
     ON CONFLICT(id) DO UPDATE SET
       shop_address=excluded.shop_address,
       title=excluded.title,
       description=excluded.description,
       price=excluded.price,
       image_src=excluded.image_src,
       category=excluded.category,
       created_at=excluded.created_at`
  );

  const getProfileStmt = database.prepare('SELECT wallet, delivery_address as deliveryAddress FROM profiles WHERE wallet = ?');
  const saveProfileStmt = database.prepare(
    `INSERT INTO profiles(wallet, delivery_address)
     VALUES(@wallet, @deliveryAddress)
     ON CONFLICT(wallet) DO UPDATE SET delivery_address = excluded.delivery_address`
  );

  const listOrdersStmtBase = `SELECT id, buyer, shop_address as shopAddress, item_id as itemId, price, delivery_address as deliveryAddress, status, created_at as createdAt, updated_at as updatedAt FROM orders`;
  const insertOrderStmt = database.prepare(
    `INSERT INTO orders(id, buyer, shop_address, item_id, price, delivery_address, status, created_at, updated_at)
     VALUES(@id, @buyer, @shopAddress, @itemId, @price, @deliveryAddress, @status, @createdAt, @updatedAt)`
  );
  const updateOrderStatusStmt = database.prepare(
    `UPDATE orders SET status = ?, updated_at = ? WHERE id = ? RETURNING id, buyer, shop_address as shopAddress, item_id as itemId, price, delivery_address as deliveryAddress, status, created_at as createdAt, updated_at as updatedAt`
  );

  return {
    listShops: () => listShopsStmt.all() as ShopRecord[],
    upsertShop: (input) => {
      insertShopStmt.run(input);
      return input;
    },
    listItems: (shopAddress) =>
      (shopAddress ? listItemsByShopStmt.all(shopAddress) : listItemsStmt.all()) as ItemRecord[],
    getItem: (id) => getItemStmt.get(id) as ItemRecord | undefined ?? null,
    upsertItem: (input) => {
      insertItemStmt.run(input);
      return input;
    },
    getProfile: (wallet) => getProfileStmt.get(wallet) as ProfileRecord | undefined ?? null,
    saveProfile: (record) => {
      saveProfileStmt.run(record);
      return record;
    },
    listOrders: (params) => {
      const clauses: string[] = [];
      const values: string[] = [];
      if (params?.buyer) {
        clauses.push('buyer = ?');
        values.push(params.buyer);
      }
      if (params?.shopAddress) {
        clauses.push('shop_address = ?');
        values.push(params.shopAddress);
      }
      const sql = clauses.length ? `${listOrdersStmtBase} WHERE ${clauses.join(' AND ')}` : listOrdersStmtBase;
      return database.prepare(sql).all(...values) as OrderRecord[];
    },
    createOrder: (input) => {
      const order: OrderRecord = {
        id: randomUUID(),
        ...input,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      insertOrderStmt.run(order);
      return order;
    },
    updateOrderStatus: (id, status) => {
      const updated = updateOrderStatusStmt.get(status, Date.now(), id) as OrderRecord | undefined;
      return updated ?? null;
    },
  };
}
