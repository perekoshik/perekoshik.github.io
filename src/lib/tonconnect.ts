import { TonConnectUI } from '@tonconnect/ui'

type TonConnectInstance = TonConnectUI | null

const baseManifestUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/tonconnect-manifest.json`
  : '/tonconnect-manifest.json'

export const TONCONNECT_MANIFEST_URL = baseManifestUrl

let cachedTonConnectUI: TonConnectInstance = null

export const getTonConnectUI = (): TonConnectInstance => {
  if (typeof window === 'undefined') return null
  if (!cachedTonConnectUI) {
    cachedTonConnectUI = new TonConnectUI({
      manifestUrl: TONCONNECT_MANIFEST_URL,
      uiPreferences: {
        theme: 'SYSTEM',
      },
    })
  }
  return cachedTonConnectUI
}
