/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cu: {
          navy: '#002561',        // Chanakya Royal Navy
          navydark: '#0E1B38',    // Sidebar Navy
          navylight: '#16284F',   // Secondary Navy
          saffron: '#DB6C29',     // Terracotta Saffron
          saffronlight: '#E67E3C',
          gold: '#C69930',        // Chanakya Antique Gold
          goldlight: '#E5B94E',
          slate: '#212529',       // Typography Dark
          muted: '#6C757D',       // Gray Muted
          border: '#DEE2E6',      // Light border
          canvas: '#F4F6F9',      // Dashboard Canvas Background
          pill: '#E6F0FA'         // Lecture badge pill
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
