/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#04040a',
        surface: '#0c0c14',
        'surface-2': '#14141f',
        border: '#1e1e2e',
        accent: '#8b5cf6',
        'accent-hover': '#7c3aed',
        'accent-dim': 'rgba(139, 92, 246, 0.15)',
        cyan: '#22d3ee',
        pink: '#f472b6',
        green: '#34d399',
        muted: '#6b7280',
        'text-1': '#f4f4f8',
        'text-2': '#a1a1aa',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['clamp(3.5rem, 10vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
      },
    },
  },
  plugins: [],
}
