import { Api } from './api';

const STORAGE_KEY = 'market_pending_items';

export type PendingItemRecord = {
  id: string;
  shopAddress: string;
  title: string;
  description: string;
  imageSrc: string;
  price: string;
};

function isStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readQueue(): PendingItemRecord[] {
  if (!isStorageAvailable()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingItemRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry) =>
        Boolean(entry?.id) &&
        typeof entry.imageSrc === 'string' &&
        typeof entry.price === 'string' &&
        typeof entry.title === 'string',
    );
  } catch (error) {
    console.warn('[pending-items] parse failed', error);
    return [];
  }
}

function writeQueue(entries: PendingItemRecord[]) {
  if (!isStorageAvailable()) {
    return;
  }
  try {
    if (!entries.length) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.warn('[pending-items] persist failed', error);
  }
}

export function enqueuePendingItem(record: PendingItemRecord) {
  if (!isStorageAvailable()) {
    return;
  }
  const queue = readQueue();
  const next = queue.filter((entry) => entry.id !== record.id);
  next.push(record);
  writeQueue(next);
}

function removePendingItem(id: string) {
  if (!isStorageAvailable()) return;
  const queue = readQueue();
  const next = queue.filter((entry) => entry.id !== id);
  writeQueue(next);
}

export function hasPendingItems() {
  return readQueue().length > 0;
}

export async function syncPendingItems(token: string) {
  if (!isStorageAvailable()) {
    return false;
  }
  const queue = readQueue();
  if (!queue.length) {
    return false;
  }
  let changed = false;
  for (const entry of queue) {
    const priceTon = Number.parseFloat(entry.price);
    if (!Number.isFinite(priceTon) || priceTon <= 0) {
      removePendingItem(entry.id);
      changed = true;
      continue;
    }
    try {
      await Api.createProduct(token, {
        id: entry.id,
        title: entry.title,
        description: entry.description,
        priceTon,
        imageData: entry.imageSrc,
        shopAddress: entry.shopAddress,
        contractAddress: entry.id,
      });
      removePendingItem(entry.id);
      changed = true;
    } catch (error) {
      const message = (error as Error)?.message ?? '';
      if (/API 4\d\d/.test(message)) {
        console.warn('[pending-items] dropped item due to client error', error);
        removePendingItem(entry.id);
        changed = true;
        continue;
      }
      // Сервер или сеть всё ещё недоступны — остановим цикл.
      break;
    }
  }
  return changed;
}
