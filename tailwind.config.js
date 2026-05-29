/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonGreen: {
          DEFAULT: '#deff9a',
          dark: '#c4ef69',
          light: '#e9ffb5',
        },
        darkBg: {
          DEFAULT: '#0b0f19',
          card: '#161d30',
          border: '#242f4c',
          input: '#1d273f',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
