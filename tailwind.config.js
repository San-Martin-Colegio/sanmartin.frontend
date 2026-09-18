/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          hover: '#172e4c',
          dark: '#10213d',
          light: '#315c91',
        },
        secondary: {
          DEFAULT: '#14b8a6',
          hover: '#0f9488',
          light: '#ccfbf1',
        },
        smp: {
          navy: '#1e3a5f',
          gold: '#d4a843',
          bg: '#f8fafc',
          sidebar: '#ffffff',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
