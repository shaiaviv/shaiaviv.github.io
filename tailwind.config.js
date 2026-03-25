/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#020a06',
        surface: '#081208',
        'surface-2': '#0f1e12',
        border: '#172e1e',
        accent: '#00e5a0',
        'accent-hover': '#00cc8f',
        'accent-dim': 'rgba(0, 229, 160, 0.1)',
        cyan: '#00b8d4',
        pink: '#ff4d6d',
        green: '#7fff7a',
        muted: '#4d7a6a',
        'text-1': '#edfaf3',
        'text-2': '#8ab8a0',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
