const IPFS_PREFIX = 'ipfs://';
const AR_PROTOCOL = 'ar://';

function stripPrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function resolveMediaUrl(value?: string | null, fallback?: string) {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith(IPFS_PREFIX)) {
    const path = stripPrefix(trimmed, IPFS_PREFIX);
    return `https://ipfs.io/ipfs/${path}`;
  }
  if (trimmed.startsWith(AR_PROTOCOL)) {
    const path = stripPrefix(trimmed, AR_PROTOCOL);
    return `https://arweave.net/${path}`;
  }
  return trimmed;
}
