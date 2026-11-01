/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f1f4f9', 100: '#dde4f0', 200: '#b9c7df', 400: '#5d77a6', 600: '#243d6b', 700: '#1a2f57', 800: '#13234a', 900: '#0c1733' },
      },
      fontFamily: { sans: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'], mono: ['"JetBrains Mono"', 'Consolas', 'monospace'] },
    },
  },
  plugins: [],
};
