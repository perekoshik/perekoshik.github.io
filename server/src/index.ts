import cors from 'cors';
import express, { type Request } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import { config } from './config.js';
import { createDatabaseApi } from './db.js';
import { generateToken, hashToken } from './auth.js';
import { saveProductImage } from './storage.js';
import { decryptDeliveryAddress, encryptDeliveryAddress } from './encryption.js';
import type { OrderRecord } from './types.js';

function splitOrderAmounts(priceTon: number) {
  if (!Number.isFinite(priceTon) || priceTon <= 0) {
    throw new Error('Некорректная цена заказа');
  }
  const priceNano = BigInt(Math.round(priceTon * 1_000_000_000));
  const feeBps = Math.round(config.platformFee * 10_000);
  const feeNano = (priceNano * BigInt(feeBps)) / 10_000n;
  const sellerNano = priceNano - feeNano;
  const toTon = (value: bigint) => Number(value) / 1_000_000_000;
  return { fee: toTon(feeNano), sellerAmount: toTon(sellerNano) };
}

type ApiOrder = Omit<OrderRecord, 'deliveryAddress' | 'publicTokenHash'> & {
  deliveryAddress: string | null;
};

function serializeOrder(order: OrderRecord, includeAddress: boolean): ApiOrder {
  const { publicTokenHash, ...rest } = order;
  return {
    ...rest,
    deliveryAddress: includeAddress ? decryptDeliveryAddress(order.deliveryAddress ?? null) : null,
  };
}

async function bootstrap() {
  const db = await createDatabaseApi(config.dbPath);
  const app = express();
  app.set('trust proxy', true);
  const publicLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use((_req, res, next) => {
    // CHANGE: disable caching so Telegram WebView/mini-app always fetches fresh JSON
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  type SellerRequest = Request & { seller: NonNullable<ReturnType<typeof db.findSellerByToken>> };

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(config.uploadsDir));

  const requireAuth: express.RequestHandler = (req, res, next) => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }
    const token = header.slice('Bearer '.length).trim();
    const seller = db.findSellerByToken(hashToken(token));
    if (!seller) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    (req as SellerRequest).seller = seller;
    next();
  };

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/shops', (_req, res) => {
    res.json(db.listShops());
  });

  app.post('/shops', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    const { address, shopName, category } = req.body as {
      address?: string;
      shopName?: string;
      category?: string;
    };
    if (!address?.trim() || !shopName?.trim()) {
      res.status(400).json({ error: 'address и shopName обязательны' });
      return;
    }
    const record = db.upsertShop({
      address: address.trim(),
      owner: seller.wallet,
      shopName: shopName.trim(),
      category: category?.trim() || 'All',
    });
    res.status(201).json(record);
  });

  app.post('/auth/verify', (req, res) => {
    const { wallet } = req.body as {
      wallet?: { address?: string; telegram?: { id?: number; username?: string; name?: string } };
    };
    if (!wallet?.address) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }
    const seller = db.upsertSeller({
      wallet: wallet.address,
      telegramId: wallet.telegram?.id,
      telegramName: wallet.telegram?.name,
      telegramUsername: wallet.telegram?.username,
    });
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = Date.now() + config.tokenTtlMs;
    db.createSellerToken(seller.wallet, tokenHash, expiresAt);
    res.json({ token, expiresAt, seller });
  });

  app.get('/products', (_req, res) => {
    res.json(db.listProducts());
  });

  app.get('/products/:id', (req, res) => {
    const product = db.findProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  app.post('/products', requireAuth, async (req, res) => {
    try {
      const seller = (req as SellerRequest).seller;
      const { id, title, description, priceTon, imageData, shopAddress, contractAddress, imageKey } = req.body as {
        id?: string;
        title?: string;
        description?: string;
        priceTon?: number;
        imageData?: string;
        shopAddress?: string;
        contractAddress?: string;
        imageKey?: string;
      };
      if (!title?.trim() || !description?.trim() || !priceTon || priceTon <= 0 || !imageData) {
        res.status(400).json({ error: 'Invalid product payload' });
        return;
      }
      const image = await saveProductImage(imageData, imageKey?.trim());
      const product = db.createProduct({
        id: (id?.trim() || nanoid()).toLowerCase(),
        sellerWallet: seller.wallet,
        shopAddress: shopAddress?.trim() || null,
        contractAddress: contractAddress?.trim() || id?.trim() || null,
        title: title.trim(),
        description: description.trim(),
        priceTon,
        imageUrl: `${config.publicBaseUrl}${image.relativePath}`,
        imageSizeBytes: image.size,
      });
      res.status(201).json(product);
    } catch (error) {
      console.error('[api] product creation failed', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.post('/products/:id/rating', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    const { rating, comment } = req.body as { rating?: number; comment?: string };
    const productId = req.params.id;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }
    const product = db.findProductById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    db.saveRating({
      productId,
      wallet: seller.wallet,
      rating,
      comment,
    });
    res.status(204).end();
  });

  app.post('/orders', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    const { productId, buyerWallet } = req.body as {
      productId?: string;
      buyerWallet?: string;
    };
    if (!productId?.trim() || !buyerWallet?.trim()) {
      res.status(400).json({ error: 'productId и buyerWallet обязательны' });
      return;
    }
    const product = db.findProductById(productId.trim());
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (product.sellerWallet !== seller.wallet) {
      res.status(403).json({ error: 'Вы можете создавать заказы только на свои товары' });
      return;
    }
    const { fee, sellerAmount } = splitOrderAmounts(product.priceTon);
    const order = db.createOrder({
      id: nanoid(),
      productId: product.id,
      sellerWallet: seller.wallet,
      buyerWallet: buyerWallet.trim(),
      priceTon: product.priceTon,
      platformFeeTon: fee,
      sellerAmountTon: sellerAmount,
      status: 'pending',
      deliveryAddress: null,
      tonOrderId: Date.now().toString(),
    });
    res.status(201).json(serializeOrder(order, true));
  });

  app.get('/orders', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    const orders = db.listOrders({ sellerWallet: seller.wallet }).map((order) => serializeOrder(order, true));
    res.json(orders);
  });

  app.patch('/orders/:id', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    const { status, txHash } = req.body as { status?: string; txHash?: string };
    if (!status || !['pending', 'paid', 'delivered', 'canceled', 'refunded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const order = db.findOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.sellerWallet !== seller.wallet) {
      res.status(403).json({ error: 'Недостаточно прав для обновления заказа' });
      return;
    }
    db.updateOrderStatus(order.id, status as any, txHash?.trim() || undefined);
    res.status(204).end();
  });

  app.post('/orders/public', publicLimiter, (req, res) => {
    const { productId, buyerWallet, deliveryAddress } = req.body as {
      productId?: string;
      buyerWallet?: string;
      deliveryAddress?: string;
    };
    if (!productId?.trim() || !buyerWallet?.trim() || !deliveryAddress?.trim()) {
      res.status(400).json({ error: 'productId, buyerWallet и deliveryAddress обязательны' });
      return;
    }
    const product = db.findProductById(productId.trim());
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (!product.contractAddress) {
      res.status(400).json({ error: 'Product is not linked to a contract' });
      return;
    }
    const { fee, sellerAmount } = splitOrderAmounts(product.priceTon);
    const secret = generateToken();
    const order = db.createOrder({
      id: nanoid(),
      productId: product.id,
      sellerWallet: product.sellerWallet,
      buyerWallet: buyerWallet.trim(),
      priceTon: product.priceTon,
      platformFeeTon: fee,
      sellerAmountTon: sellerAmount,
      status: 'pending',
      deliveryAddress: encryptDeliveryAddress(deliveryAddress.trim()),
      tonOrderId: Date.now().toString(),
      publicTokenHash: hashToken(secret),
    });
    res.status(201).json({
      order: serializeOrder(order, true),
      clientSecret: secret,
    });
  });

  app.patch('/orders/:id/public', publicLimiter, (req, res) => {
    const { status, txHash, secret } = req.body as { status?: string; txHash?: string; secret?: string };
    if (!status || !['paid', 'canceled'].includes(status)) {
      res.status(400).json({ error: 'Only "paid" or "canceled" statuses are allowed' });
      return;
    }
    if (!secret?.trim()) {
      res.status(400).json({ error: 'secret обязателен' });
      return;
    }
    const order = db.findOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (!order.publicTokenHash || hashToken(secret.trim()) !== order.publicTokenHash) {
      res.status(403).json({ error: 'Неверный токен заказа' });
      return;
    }
    if (status === 'paid' && !txHash?.trim()) {
      res.status(400).json({ error: 'txHash обязателен для paid' });
      return;
    }
    db.updateOrderStatus(order.id, status as any, txHash?.trim());
    const updated = db.findOrderById(order.id);
    res.json(serializeOrder(updated!, true));
  });

  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[api] failed to bootstrap', error);
  process.exit(1);
});
