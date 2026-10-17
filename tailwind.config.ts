import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Teal — Islamic night sky palette
        slate: {
          950: '#0A1628',
        },
        navy: {
          900: '#0D1B2A',
          800: '#122540',
          700: '#1B3558',
          600: '#24456F',
        },
        gold: {
          50:  '#FDF9ED',
          100: '#F9EFC7',
          300: '#E8C96A',
          400: '#C9A84C',
          500: '#A88630',
          600: '#856819',
        },
        jade: {
          400: '#4DB88A',
          500: '#2D9B6F',
          600: '#1E7A54',
        },
        rose: {
          hafiz: '#E5637A',
        },
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Amiri', 'serif'],
        ui: ['var(--font-ui)', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'night-gradient': 'radial-gradient(ellipse at top, #122540 0%, #0A1628 60%)',
        'gold-shimmer': 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
      },
      animation: {
        'streak-pulse': 'streak-pulse 2s ease-in-out infinite',
        'xp-fill': 'xp-fill 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        'streak-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'xp-fill': {
          from: { width: 'var(--xp-from)' },
          to: { width: 'var(--xp-to)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
