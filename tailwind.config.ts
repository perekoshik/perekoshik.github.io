import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '16px' },
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        bg: {
          DEFAULT: 'hsl(var(--bg) / <alpha-value>)',
          soft: 'hsl(var(--bg-soft) / <alpha-value>)',
          card: 'hsl(var(--bg-card) / <alpha-value>)',
        },
        txt: {
          DEFAULT: 'hsl(var(--txt) / <alpha-value>)',
          muted: 'hsl(var(--txt-muted) / <alpha-value>)',
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
