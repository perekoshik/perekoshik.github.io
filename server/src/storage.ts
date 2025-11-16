import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { config } from './config.js';

const DATA_URL_RE = /^data:(?<mime>[\w/+.-]+);base64,(?<payload>.+)$/;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type StoredImage = {
  relativePath: string;
  size: number;
};

export async function saveProductImage(dataUrl: string): Promise<StoredImage> {
  const parsed = DATA_URL_RE.exec(dataUrl.trim());
  if (!parsed?.groups) {
    throw new Error('Изображение должно быть передано как data URL.');
  }
  const mime = parsed.groups.mime.toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error('Поддерживаются только JPEG, PNG или WebP.');
  }

  const buffer = Buffer.from(parsed.groups.payload, 'base64');
  if (!buffer.length) {
    throw new Error('Пустые изображения запрещены.');
  }

  let optimized: Buffer = buffer;
  const transformer = sharp(buffer).rotate().resize({
    width: config.maxImageDimension,
    height: config.maxImageDimension,
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Конвертируем в JPEG для единообразия и экономии места.
  optimized = await transformer.jpeg({ quality: 82 }).toBuffer();

  if (optimized.byteLength > config.maxImageBytes) {
    throw new Error('Изображение слишком большое после сжатия (лимит 600 КБ).');
  }

  const fileName = `${randomUUID()}.jpg`;
  const folder = join(config.uploadsDir, 'products');
  if (!existsSync(folder)) {
    await mkdir(folder, { recursive: true });
  }
  const absolutePath = join(folder, fileName);
  await sharp(optimized).toFile(absolutePath);

  return {
    relativePath: `/uploads/products/${fileName}`,
    size: optimized.byteLength,
  };
}
