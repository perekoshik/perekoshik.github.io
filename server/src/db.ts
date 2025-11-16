import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type {
  ChallengeRecord,
  OrderRecord,
  OrderStatus,
  ProductRecord,
  RatingRecord,
  SellerRecord,
  SellerTokenRecord,
} from './types.js';

const ISO = () => new Date().toISOString();

export type NewSeller = {
  wallet: string;
  telegramId?: number;
  telegramUsername?: string;
  telegramName?: string;
};

export type NewProduct = {
  id: string;
  sellerWallet: string;
  title: string;
  description: string;
  priceTon: number;
  imageUrl: string;
  imageSizeBytes: number;
};

export type NewRating = {
  productId: string;
  wallet: string;
  rating: number;
  comment?: string;
};

export type NewOrder = {
  id: string;
  productId: string;
  sellerWallet: string;
  buyerWallet: string;
  priceTon: number;
  platformFeeTon: number;
  sellerAmountTon: number;
  status: OrderStatus;
};

export interface DatabaseApi {
  issueChallenge(payload: string, expiresAt: number): void;
  consumeChallenge(payload: string): boolean;
  upsertSeller(input: NewSeller): SellerRecord;
  createSellerToken(wallet: string, tokenHash: string, expiresAt: number): SellerTokenRecord;
  findSellerByToken(tokenHash: string): SellerRecord | null;
  createProduct(product: NewProduct): ProductRecord;
  listProducts(): ProductRecord[];
  listSellerProducts(wallet: string): ProductRecord[];
  findProductById(id: string): ProductRecord | null;
  saveRating(entry: NewRating): RatingRecord;
  createOrder(order: NewOrder): OrderRecord;
  listOrders(filter: { sellerWallet?: string; buyerWallet?: string }): OrderRecord[];
  updateOrderStatus(id: string, status: OrderStatus, txHash?: string): void;
}

export function createDatabaseApi(path: string): DatabaseApi {
  const resolved = resolve(path);
  const dir = dirname(resolved);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const db = new Database(resolved);
  db.pragma('journal_mode = WAL');
  migrate(db);

  const statements = prepareStatements(db);

  return {
    issueChallenge(payload, expiresAt) {
      statements.insertChallenge.run({ payload, expiresAt });
    },
    consumeChallenge(payload) {
      const record = statements.selectChallenge.get(payload) as ChallengeRecord | undefined;
      if (!record) return false;
      if (record.expiresAt < Date.now()) {
        statements.deleteChallenge.run(payload);
        return false;
      }
      statements.deleteChallenge.run(payload);
      return true;
    },
    upsertSeller(input) {
      const timestamps = { createdAt: ISO(), updatedAt: ISO() };
      statements.upsertSeller.run({ ...input, ...timestamps });
      return statements.selectSeller.get(input.wallet) as SellerRecord;
    },
    createSellerToken(wallet, tokenHash, expiresAt) {
      const record: SellerTokenRecord = {
        tokenHash,
        wallet,
        expiresAt,
        createdAt: ISO(),
      };
      statements.upsertToken.run(record);
      return record;
    },
    findSellerByToken(tokenHash) {
      const seller = statements.selectSellerByToken.get(tokenHash) as SellerRecord | undefined;
      return seller ?? null;
    },
    createProduct(product) {
      const timestamps = { createdAt: ISO(), updatedAt: ISO() };
      statements.insertProduct.run({ ...product, ...timestamps });
      return statements.selectProductById.get(product.id) as ProductRecord;
    },
    listProducts() {
      return statements.selectProducts.all() as ProductRecord[];
    },
    listSellerProducts(wallet) {
      return statements.selectProductsBySeller.all(wallet) as ProductRecord[];
    },
    findProductById(id) {
      const record = statements.selectProductById.get(id) as ProductRecord | undefined;
      return record ?? null;
    },
    saveRating(entry) {
      const payload = { ...entry, createdAt: ISO() };
      statements.upsertRating.run(payload);
      statements.recalculateRating.run({ productId: entry.productId, updatedAt: ISO() });
      return payload;
    },
    createOrder(order) {
      const timestamps = { createdAt: ISO(), updatedAt: ISO() };
      statements.insertOrder.run({ ...order, ...timestamps });
      return statements.selectOrderById.get(order.id) as OrderRecord;
    },
    listOrders(filter) {
      if (filter.sellerWallet) {
        return statements.selectOrdersBySeller.all(filter.sellerWallet) as OrderRecord[];
      }
      if (filter.buyerWallet) {
        return statements.selectOrdersByBuyer.all(filter.buyerWallet) as OrderRecord[];
      }
      return [];
    },
    updateOrderStatus(id, status, txHash) {
      statements.updateOrderStatus.run({
        id,
        status,
        txHash,
        updatedAt: ISO(),
      });
    },
  };
}

function prepareStatements(db: Database.Database) {
  return {
    insertChallenge: db.prepare(
      `INSERT INTO auth_challenges(payload, expires_at)
       VALUES(@payload, @expiresAt)
       ON CONFLICT(payload) DO UPDATE SET expires_at = excluded.expires_at`,
    ),
    selectChallenge: db.prepare('SELECT payload, expires_at as expiresAt FROM auth_challenges WHERE payload = ?'),
    deleteChallenge: db.prepare('DELETE FROM auth_challenges WHERE payload = ?'),
    upsertSeller: db.prepare(
      `INSERT INTO sellers(wallet, telegram_id, telegram_username, telegram_name, created_at, updated_at)
       VALUES(@wallet, @telegramId, @telegramUsername, @telegramName, @createdAt, @updatedAt)
       ON CONFLICT(wallet) DO UPDATE SET telegram_id=excluded.telegram_id,
         telegram_username=excluded.telegram_username,
         telegram_name=excluded.telegram_name,
         updated_at=excluded.updated_at`,
    ),
    selectSeller: db.prepare(
      `SELECT wallet, telegram_id as telegramId, telegram_username as telegramUsername,
              telegram_name as telegramName, created_at as createdAt, updated_at as updatedAt
       FROM sellers WHERE wallet = ?`,
    ),
    upsertToken: db.prepare(
      `INSERT INTO seller_tokens(token_hash, wallet, expires_at, created_at)
       VALUES(@tokenHash, @wallet, @expiresAt, @createdAt)
       ON CONFLICT(token_hash) DO UPDATE SET wallet=excluded.wallet, expires_at=excluded.expires_at`,
    ),
    selectSellerByToken: db.prepare(
      `SELECT s.wallet, s.telegram_id as telegramId, s.telegram_username as telegramUsername,
              s.telegram_name as telegramName, s.created_at as createdAt, s.updated_at as updatedAt
       FROM seller_tokens t
       JOIN sellers s ON s.wallet = t.wallet
       WHERE t.token_hash = ? AND t.expires_at > strftime('%s','now') * 1000`,
    ),
    insertProduct: db.prepare(
      `INSERT INTO products(id, seller_wallet, title, description, price_ton, image_url, image_size_bytes,
                            rating_average, rating_count, active, created_at, updated_at)
       VALUES(@id, @sellerWallet, @title, @description, @priceTon, @imageUrl, @imageSizeBytes,
              0, 0, 1, @createdAt, @updatedAt)`,
    ),
    selectProducts: db.prepare(
      `SELECT id, seller_wallet as sellerWallet, title, description, price_ton as priceTon,
              image_url as imageUrl, image_size_bytes as imageSizeBytes, rating_average as ratingAverage,
              rating_count as ratingCount, active, created_at as createdAt, updated_at as updatedAt
       FROM products
       WHERE active = 1
       ORDER BY created_at DESC`,
    ),
    selectProductsBySeller: db.prepare(
      `SELECT id, seller_wallet as sellerWallet, title, description, price_ton as priceTon,
              image_url as imageUrl, image_size_bytes as imageSizeBytes, rating_average as ratingAverage,
              rating_count as ratingCount, active, created_at as createdAt, updated_at as updatedAt
       FROM products
       WHERE seller_wallet = ?
       ORDER BY created_at DESC`,
    ),
    selectProductById: db.prepare(
      `SELECT id, seller_wallet as sellerWallet, title, description, price_ton as priceTon,
              image_url as imageUrl, image_size_bytes as imageSizeBytes, rating_average as ratingAverage,
              rating_count as ratingCount, active, created_at as createdAt, updated_at as updatedAt
       FROM products WHERE id = ?`,
    ),
    upsertRating: db.prepare(
      `INSERT INTO product_ratings(product_id, wallet, rating, comment, created_at)
       VALUES(@productId, @wallet, @rating, @comment, @createdAt)
       ON CONFLICT(product_id, wallet)
       DO UPDATE SET rating=excluded.rating, comment=excluded.comment, created_at=excluded.created_at`,
    ),
    recalculateRating: db.prepare(
      `UPDATE products
        SET rating_average = (
              SELECT COALESCE(avg(rating), 0) FROM product_ratings WHERE product_id = @productId
            ),
            rating_count = (
              SELECT count(*) FROM product_ratings WHERE product_id = @productId
            ),
            updated_at = @updatedAt
        WHERE id = @productId`,
    ),
    insertOrder: db.prepare(
      `INSERT INTO orders(id, product_id, seller_wallet, buyer_wallet, price_ton, platform_fee_ton,
                          seller_amount_ton, status, created_at, updated_at)
       VALUES(@id, @productId, @sellerWallet, @buyerWallet, @priceTon, @platformFeeTon,
              @sellerAmountTon, @status, @createdAt, @updatedAt)`,
    ),
    selectOrderById: db.prepare(
      `SELECT id, product_id as productId, seller_wallet as sellerWallet, buyer_wallet as buyerWallet,
              price_ton as priceTon, platform_fee_ton as platformFeeTon, seller_amount_ton as sellerAmountTon,
              status, tx_hash as txHash, created_at as createdAt, updated_at as updatedAt
       FROM orders WHERE id = ?`,
    ),
    selectOrdersBySeller: db.prepare(
      `SELECT id, product_id as productId, seller_wallet as sellerWallet, buyer_wallet as buyerWallet,
              price_ton as priceTon, platform_fee_ton as platformFeeTon, seller_amount_ton as sellerAmountTon,
              status, tx_hash as txHash, created_at as createdAt, updated_at as updatedAt
       FROM orders
       WHERE seller_wallet = ?
       ORDER BY created_at DESC`,
    ),
    selectOrdersByBuyer: db.prepare(
      `SELECT id, product_id as productId, seller_wallet as sellerWallet, buyer_wallet as buyerWallet,
              price_ton as priceTon, platform_fee_ton as platformFeeTon, seller_amount_ton as sellerAmountTon,
              status, tx_hash as txHash, created_at as createdAt, updated_at as updatedAt
       FROM orders
       WHERE buyer_wallet = ?
       ORDER BY created_at DESC`,
    ),
    updateOrderStatus: db.prepare(
      `UPDATE orders
       SET status = @status,
           tx_hash = COALESCE(@txHash, tx_hash),
           updated_at = @updatedAt
       WHERE id = @id`,
    ),
  };
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      wallet TEXT PRIMARY KEY,
      telegram_id INTEGER,
      telegram_username TEXT,
      telegram_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_challenges (
      payload TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seller_tokens (
      token_hash TEXT PRIMARY KEY,
      wallet TEXT NOT NULL REFERENCES sellers(wallet) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_wallet TEXT NOT NULL REFERENCES sellers(wallet) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price_ton REAL NOT NULL,
      image_url TEXT NOT NULL,
      image_size_bytes INTEGER NOT NULL,
      rating_average REAL NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_ratings (
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      wallet TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL,
      PRIMARY KEY (product_id, wallet)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      seller_wallet TEXT NOT NULL,
      buyer_wallet TEXT NOT NULL,
      price_ton REAL NOT NULL,
      platform_fee_ton REAL NOT NULL,
      seller_amount_ton REAL NOT NULL,
      status TEXT NOT NULL,
      tx_hash TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_wallet);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_wallet);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_wallet);
  `);
}
