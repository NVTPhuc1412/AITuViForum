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
        night: {
          950: '#07080F',
          900: '#0D0F1A',
          800: '#13151F',
          700: '#1B1E2C',
          600: '#272B3C',
          line: '#2A2E3F',
        },
        brass: {
          DEFAULT: '#C9A24B',
          light: '#E3C878',
          dim: '#8C7230',
        },
        lacquer: {
          DEFAULT: '#B4433F',
          light: '#D4716A',
          dim: '#7A2E2B',
        },
        jade: {
          DEFAULT: '#4F9C8C',
          light: '#7CC4B4',
          dim: '#2F5E54',
        },
        parchment: {
          DEFAULT: '#ECE7D9',
          muted: '#A6A1B0',
          dim: '#716C7D',
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'star-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'star-pulse': 'star-pulse 3.2s ease-in-out infinite',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
