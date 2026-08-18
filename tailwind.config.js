/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mcd: {
          red: '#DA291C',
          'red-dark': '#B71C1C',
          'red-light': '#F4635A',
          'red-50': '#FEF2F2',
          'red-glow': 'rgb(218 41 28 / 0.35)',
          yellow: '#FFC72C',
          'yellow-dark': '#B45309',
          'yellow-light': '#FFD966',
          black: '#1A1A1A',
          'gray-25': '#FCFCFD',
          'gray-50': '#F8FAFB',
          'gray-100': '#EEF1F5',
          'gray-200': '#E3E8EF',
          'gray-300': '#C9D2DE',
          'gray-400': '#9AA5B5',
          'gray-500': '#7A8699',
          'gray-600': '#5B6678',
          'gray-700': '#414B5C',
          'gray-800': '#1D2635',
          'gray-850': '#161D2B',
          'gray-900': '#0E1420',
          'gray-950': '#080C14',
          // Semantic accent colors
          'accent-blue': '#3B82F6',
          'accent-blue-light': '#60A5FA',
          'accent-green': '#10B981',
          'accent-green-light': '#34D399',
          'accent-amber': '#F59E0B',
          'accent-purple': '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(16 24 40 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(16 24 40 / 0.08), 0 1px 2px -1px rgb(16 24 40 / 0.06)',
        md: '0 4px 10px -2px rgb(16 24 40 / 0.08), 0 2px 6px -2px rgb(16 24 40 / 0.05)',
        lg: '0 10px 24px -6px rgb(16 24 40 / 0.12), 0 4px 8px -4px rgb(16 24 40 / 0.08)',
        xl: '0 18px 40px -8px rgb(16 24 40 / 0.18), 0 6px 12px -6px rgb(16 24 40 / 0.10)',
        '2xl': '0 28px 56px -12px rgb(16 24 40 / 0.22)',
        // Card system
        card: '0 1px 3px rgb(16 24 40 / 0.04), 0 6px 24px -8px rgb(16 24 40 / 0.08)',
        'card-hover': '0 4px 6px rgb(16 24 40 / 0.04), 0 20px 40px -12px rgb(16 24 40 / 0.15)',
        'card-active': '0 1px 2px rgb(16 24 40 / 0.04), 0 4px 12px -4px rgb(218 41 28 / 0.12)',
        // Glass
        glass: '0 8px 32px -8px rgb(16 24 40 / 0.12), inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
        'glass-dark': '0 8px 32px -8px rgb(0 0 0 / 0.4), inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
        // Glow
        'glow-red': '0 0 20px -4px rgb(218 41 28 / 0.30), 0 0 6px -1px rgb(218 41 28 / 0.15)',
        'glow-red-sm': '0 0 12px -2px rgb(218 41 28 / 0.25)',
        // Inner
        'inner-soft': 'inset 0 2px 4px 0 rgb(16 24 40 / 0.04)',
        // Nav
        'nav-active': '0 1px 3px rgb(218 41 28 / 0.15), 0 0 0 1px rgb(218 41 28 / 0.08)',
      },
      backgroundImage: {
        // Gradient utilities
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(110deg, transparent 25%, rgb(255 255 255 / 0.1) 37%, transparent 63%)',
        'shimmer-dark': 'linear-gradient(110deg, transparent 25%, rgb(255 255 255 / 0.04) 37%, transparent 63%)',
        // Noise overlay
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'backdrop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px -2px rgb(218 41 28 / 0.20)' },
          '50%': { boxShadow: '0 0 20px -2px rgb(218 41 28 / 0.40)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgb(218 41 28 / 0.15)' },
          '50%': { borderColor: 'rgb(218 41 28 / 0.35)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'page-enter': 'page-enter 0.34s cubic-bezier(0.22, 1, 0.36, 1) both',
        'toast-in': 'toast-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        'toast-out': 'toast-out 0.22s ease-in both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        'backdrop-in': 'backdrop-in 0.2s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
        'border-glow': 'border-glow 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'progress-fill': 'progress-fill 1s ease-out both',
      },
    },
  },
  plugins: [],
}
