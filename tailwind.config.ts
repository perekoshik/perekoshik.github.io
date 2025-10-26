import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '16px' },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0f14', // fragment-like deep
          soft: '#0f141b',
          card: '#121821',
        },
        txt: {
          DEFAULT: '#e6edf3',
          muted: '#98a2b3',
        },
        brand: {
          DEFAULT: '#3b82f6', // OpenSea blue vibe
          hover: '#2563eb',
        },
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.3)'
      }
    }
  },
  plugins: [],
} satisfies Config