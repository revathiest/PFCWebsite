/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'pfc-red': '#87021b',
        'pfc-gold': '#b59f3b'
      }
    }
  },
  plugins: []
};
d