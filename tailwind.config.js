/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fdf9ef',
        surface: '#ffffff',
        'surface-2': '#f5efdd',
        border: '#171310',
        accent: '#6c5ce7',
        'accent-hover': '#5a48d6',
        'accent-dim': 'rgba(108, 92, 231, 0.12)',
        cyan: '#06d6a0',
        pink: '#ff6b57',
        green: '#ffc23c',
        muted: '#8a8172',
        'text-1': '#171310',
        'text-2': '#544d3f',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        hand: ['Caveat', 'ui-rounded', 'cursive'],
      },
      boxShadow: {
        pop: '5px 5px 0 0 #171310',
        'pop-sm': '3px 3px 0 0 #171310',
        'pop-lg': '9px 9px 0 0 #171310',
        'pop-accent': '5px 5px 0 0 #6c5ce7',
      },
    },
  },
  plugins: [],
}
