import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Redefine purple and violet to orange & amber so all components adopt the orange theme
        purple: colors.orange,
        violet: colors.amber,
        indigo: colors.orange,
        navy: {
          950: '#0c0a09', // Stone-950 warm obsidian
          900: '#1c1917', // Stone-900 warm charcoal
          850: '#292524', // Deep bronze charcoal
          800: '#342f2b', // Dark ember stone
          700: '#44403c',
        },
        orange: {
          ...colors.orange,
          glow: '#fb923c',
          accent: '#ea580c',
          electric: '#f97316',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-mesh': 'radial-gradient(circle at 15% 20%, rgba(249, 115, 22, 0.16) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(245, 158, 11, 0.14) 0%, transparent 45%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(249, 115, 22, 0.35)',
        'glow': '0 0 25px -5px rgba(249, 115, 22, 0.45)',
        'glow-lg': '0 0 40px -8px rgba(249, 115, 22, 0.55)',
      }
    },
  },
  plugins: [],
}
