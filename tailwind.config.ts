import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './stores/**/*.{js,ts,jsx,tsx}',
    './lib/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070B14',
        surface: '#0E1421',
        'surface-soft': '#121A2A',
        'surface-hover': '#162032',
        border: '#243047',
        'border-soft': '#1A2740',
        'text-main': '#F8FAFC',
        'text-muted': '#94A3B8',
        'text-dim': '#64748B',
        // accent-blue is driven by CSS variable so users can swap accent colour
        'accent-blue': 'rgb(var(--accent-blue) / <alpha-value>)',
        'accent-violet': '#7C3AED',
        'accent-green': '#22C55E',
        'accent-yellow': '#FACC15',
        'accent-orange': '#F97316',
        'accent-cyan': '#06B6D4',
        'accent-pink': '#EC4899',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        glow: '0 0 0 1px rgb(var(--accent-blue) / 0.3), 0 0 12px rgb(var(--accent-blue) / 0.15)',
        'glow-violet': '0 0 0 1px rgba(124,58,237,0.3), 0 0 12px rgba(124,58,237,0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
