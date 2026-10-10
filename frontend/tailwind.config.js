/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060714',
          900: '#0b0c22',
          850: '#101231',
          800: '#161942',
          700: '#21255e',
        },
        violet: {
          glow: '#9d4edd',
          accent: '#7928ca',
          electric: '#b5179e',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-mesh': 'radial-gradient(circle at 15% 20%, rgba(121, 40, 202, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(67, 24, 255, 0.12) 0%, transparent 45%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.3)',
        'glow': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-lg': '0 0 40px -8px rgba(139, 92, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
