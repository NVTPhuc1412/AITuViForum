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
          950: '#FFFFFF',
          900: '#F7F5F0',
          850: '#FFFFFF',
          800: '#F2EFE7',
          700: '#E8E3D4',
          600: '#DCD5C0',
          line: '#E2DDCE',
        },
        brass: {
          DEFAULT: '#8A6A1E',
          light: '#A3801F',
          dim: '#5F4818',
        },
        lacquer: {
          DEFAULT: '#9C3430',
          light: '#B8463E',
          dim: '#6E2420',
        },
        jade: {
          DEFAULT: '#2F6A5C',
          light: '#3F8572',
          dim: '#1E4A3F',
        },
        parchment: {
          DEFAULT: '#201E1B',
          muted: '#5C5950',
          dim: '#8F8A7F',
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
