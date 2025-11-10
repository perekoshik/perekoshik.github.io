import { TWA } from '@/lib/twa';

export function getTwaReturnUrl() {
  try {
    const raw = TWA?.initDataUnsafe?.start_param;
    if (!raw) return undefined;
    return normalizeReturnUrl(raw);
  } catch {
    return undefined;
  }
}

export function isTelegramWebApp() {
  return Boolean(window.Telegram?.WebApp?.initDataUnsafe);
}

function normalizeReturnUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (/^([a-z0-9_.-]+)+$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return undefined;
}
