import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts}',
    '../../packages/vue-renderer/src/**/*.{vue,ts}',
    '../../packages/workbench/src/**/*.{vue,ts}'
  ],
  theme: {
    extend: {
      colors: {
        eff: {
          bg: '#f7f7f4',
          surface: '#ffffff',
          'surface-raised': '#fbfbf9',
          'muted-surface': '#eeeeea',
          text: '#1f1f1c',
          muted: '#6f6f68',
          subtle: '#9a9a92',
          border: '#deded8',
          'border-strong': '#c8c8c0',
          accent: '#20201d',
          info: '#0f766e',
          danger: '#b42318',
          success: '#047857',
          warning: '#b45309'
        }
      },
      borderRadius: {
        'eff-sm': '6px',
        'eff-lg': '8px',
        'eff-xl': '10px',
        'eff-2xl': '12px'
      },
      boxShadow: {
        'eff-hairline': '0 0 0 1px rgba(31, 31, 28, 0.06)',
        'eff-soft': '0 12px 34px rgba(31, 31, 28, 0.08)',
        'eff-pop': '0 18px 48px rgba(31, 31, 28, 0.12)'
      },
      keyframes: {
        'eff-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'eff-slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      },
      animation: {
        'eff-fade-up': 'eff-fade-up 180ms ease-out both',
        'eff-slide-in': 'eff-slide-in 180ms ease-out both'
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
} satisfies Config
