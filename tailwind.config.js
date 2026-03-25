/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#03040e',
        surface: '#06081a',
        'surface-2': '#0c1028',
        border: '#141830',
        accent: '#00e5a0',
        'accent-hover': '#00cc8f',
        'accent-dim': 'rgba(0, 229, 160, 0.1)',
        cyan: '#00b8d4',
        pink: '#ff4d6d',
        green: '#7fff7a',
        muted: '#4a5580',
        'text-1': '#e8eeff',
        'text-2': '#7a8ab5',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
