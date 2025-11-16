import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));

const DEFAULTS = {
  port: 4000,
  dbPath: './server/data.sqlite',
  uploadsDir: './server/uploads',
  publicBaseUrl: 'https://web3market.shop',
  tonProofDomain: 'web3market.shop',
  challengeTtlMs: 5 * 60 * 1000,
  tokenTtlMs: 30 * 24 * 60 * 60 * 1000,
  platformFee: 0.03,
  maxImageBytes: 600 * 1024, // 600 KB
  maxImageDimension: 600,
  tonNetwork: 'testnet',
  rateWindowMs: 60_000,
  rateMaxRequests: 100,
};

const REQUIRED_KEYS = ['TOKEN_SECRET'] as const;

function ensureRequiredEnv() {
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  }
}

ensureRequiredEnv();

const resolvePath = (input: string | undefined, fallback: string) =>
  resolve(projectRoot, input ?? fallback);

const uploadsDir = resolvePath(process.env.UPLOADS_DIR, DEFAULTS.uploadsDir);
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? DEFAULTS.port),
  dbPath: resolvePath(process.env.DATABASE_PATH, DEFAULTS.dbPath),
  uploadsDir,
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? DEFAULTS.publicBaseUrl,
  tonProofDomain: process.env.TON_PROOF_DOMAIN ?? DEFAULTS.tonProofDomain,
  tonNetwork: (process.env.TON_NETWORK ?? DEFAULTS.tonNetwork).toLowerCase(),
  challengeTtlMs: Number(process.env.CHALLENGE_TTL_MS ?? DEFAULTS.challengeTtlMs),
  tokenTtlMs: Number(process.env.TOKEN_TTL_MS ?? DEFAULTS.tokenTtlMs),
  tokenSecret: process.env.TOKEN_SECRET!,
  platformFee: Number(process.env.PLATFORM_FEE ?? DEFAULTS.platformFee),
  maxImageBytes: Number(process.env.MAX_IMAGE_BYTES ?? DEFAULTS.maxImageBytes),
  maxImageDimension: Number(process.env.MAX_IMAGE_DIMENSION ?? DEFAULTS.maxImageDimension),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? DEFAULTS.rateWindowMs),
    max: Number(process.env.RATE_LIMIT_MAX ?? DEFAULTS.rateMaxRequests),
  },
} as const;
