import cors from 'cors';
import express, { type Request } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import { config } from './config.js';
import { createDatabaseApi } from './db.js';
import { generateToken, hashToken } from './auth.js';
import { createChallenge, verifyTonProof } from './tonProof.js';
import { saveProductImage } from './storage.js';

async function bootstrap() {
  const db = await createDatabaseApi(config.dbPath);
  const app = express();

  type SellerRequest = Request & { seller: NonNullable<ReturnType<typeof db.findSellerByToken>> };

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use('/uploads', express.static(config.uploadsDir));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/auth/challenge', (_req, res) => {
    const payload = createChallenge();
    const expiresAt = Date.now() + config.challengeTtlMs;
    db.issueChallenge(payload.payload, expiresAt);
    res.json({ domain: payload.domain, payload: payload.payload, expiresAt });
  });

  app.post('/auth/verify', (req, res) => {
    const { proof, wallet } = req.body as {
      proof?: ReturnType<typeof createChallenge> & { signature?: string; timestamp?: number };
      wallet?: { address: string; publicKey?: string; telegram?: { id?: number; username?: string; name?: string } };
    };
    if (!proof || !proof.signature || !proof.timestamp || !proof.payload || !wallet?.address || !wallet?.publicKey) {
      res.status(400).json({ error: 'Invalid proof payload' });
      return;
    }
    const validChallenge = db.consumeChallenge(proof.payload);
    if (!validChallenge) {
      res.status(400).json({ error: 'Challenge expired or unknown' });
      return;
    }
    const isValid = verifyTonProof(
      {
        timestamp: proof.timestamp,
        domain: { lengthBytes: proof.domain?.length ?? config.tonProofDomain.length, value: proof.domain ?? config.tonProofDomain },
        payload: proof.payload,
        signature: proof.signature,
      },
      wallet.publicKey,
      wallet.address,
    );
    if (!isValid) {
      res.status(401).json({ error: 'Invalid ton-proof signature' });
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
      const { title, description, priceTon, imageData } = req.body as {
        title?: string;
        description?: string;
        priceTon?: number;
        imageData?: string;
      };
      if (!title?.trim() || !description?.trim() || !priceTon || priceTon <= 0 || !imageData) {
        res.status(400).json({ error: 'Invalid product payload' });
        return;
      }
      const image = await saveProductImage(imageData);
      const product = db.createProduct({
        id: nanoid(),
        sellerWallet: seller.wallet,
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
    const { productId, buyerWallet, priceTon } = req.body as {
      productId?: string;
      buyerWallet?: string;
      priceTon?: number;
    };
    if (!productId || !buyerWallet || !priceTon) {
      res.status(400).json({ error: 'Invalid order payload' });
      return;
    }
    const product = db.findProductById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const fee = Number((priceTon * config.platformFee).toFixed(4));
    const sellerAmount = Number((priceTon - fee).toFixed(4));
    const order = db.createOrder({
      id: nanoid(),
      productId,
      sellerWallet: seller.wallet,
      buyerWallet,
      priceTon,
      platformFeeTon: fee,
      sellerAmountTon: sellerAmount,
      status: 'pending',
    });
    res.status(201).json(order);
  });

  app.get('/orders', requireAuth, (req, res) => {
    const seller = (req as SellerRequest).seller;
    res.json(db.listOrders({ sellerWallet: seller.wallet }));
  });

  app.patch('/orders/:id', requireAuth, (req, res) => {
    const { status, txHash } = req.body as { status?: string; txHash?: string };
    if (!status || !['pending', 'paid', 'delivered', 'canceled', 'refunded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    db.updateOrderStatus(req.params.id, status as any, txHash);
    res.status(204).end();
  });

  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[api] failed to bootstrap', error);
  process.exit(1);
});
