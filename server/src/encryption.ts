import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from './config.js';

const KEY = (() => {
  const buffer = Buffer.from(config.deliveryEncryptionKey, 'base64');
  if (buffer.length !== 32) {
    throw new Error('DELIVERY_ENCRYPTION_KEY должен быть 32 байта в base64');
  }
  return buffer;
})();

const PREFIX = 'enc:v1:';

export function encryptDeliveryAddress(address: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(address, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, authTag, encrypted]).toString('base64url')}`;
}

export function decryptDeliveryAddress(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith(PREFIX)) {
    // старые записи ещё не зашифрованы
    return value;
  }
  const payload = Buffer.from(value.slice(PREFIX.length), 'base64url');
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const data = payload.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
