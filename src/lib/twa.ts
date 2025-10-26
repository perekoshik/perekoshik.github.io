import WebApp from '@twa-dev/sdk'

// Init once when app boots
export function initTWA() {
  try {
    WebApp.ready()
    WebApp.expand()

    // Sync theme colors with Telegram
    const bg = WebApp.themeParams.bg_color || '#0b0f14'
    document.documentElement.classList.add('dark')
    document.body.style.backgroundColor = bg

    // Optional: set app header color
    WebApp.setHeaderColor('secondary')
  } catch (e) {
    console.warn('TWA init error', e)
  }
}

export const TWA = WebApp