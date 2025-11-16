import { randomBytes, createHash } from 'node:crypto';
import { config } from './config.js';

export function generateToken(): string {
  return randomBytes(48).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(`${token}:${config.tokenSecret}`).digest('hex');
}
