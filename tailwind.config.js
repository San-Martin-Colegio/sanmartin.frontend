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
          dark: '#112239',
          light: '#2a4f7e',
        },
        secondary: {
          DEFAULT: '#d4a843',
          hover: '#bf9432',
          light: '#f5e8c7',
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
