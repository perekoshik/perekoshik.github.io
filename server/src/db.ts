import Database from 'better-sqlite3';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { ShopRecord } from './types.js';

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
      created_at INTEGER NOT NULL
    );
  `);
  return db;
}

export interface DatabaseApi {
  listShops(): ShopRecord[];
  saveShop(address: string): ShopRecord;
}

export async function createDatabaseApi(databasePath: string): Promise<DatabaseApi> {
  const database = await initDatabase(databasePath);

  const listShopsStmt = database.prepare('SELECT address, created_at as createdAt FROM shops ORDER BY created_at DESC');
  const getShopStmt = database.prepare('SELECT address, created_at as createdAt FROM shops WHERE address = ?');
  const insertShopStmt = database.prepare(
    `INSERT INTO shops(address, created_at)
     VALUES(@address, @createdAt)
     ON CONFLICT(address) DO NOTHING`
  );

  return {
    listShops: () => listShopsStmt.all() as ShopRecord[],
    saveShop: (address) => {
      const row = getShopStmt.get(address) as ShopRecord | undefined;
      if (row) {
        return row;
      }
      const record: ShopRecord = { address, createdAt: Date.now() };
      insertShopStmt.run(record);
      return record;
    },
  };
}
