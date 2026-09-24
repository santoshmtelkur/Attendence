/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16233F',
        navy: '#1B2A4A',
        navy2: '#28406E',
        paper: '#F3F5F9',
        surface: '#FFFFFF',
        amber: '#C8863A',
        good: '#2E7D53',
        warn: '#C9A227',
        bad: '#B3432B',
        line: '#DCE1EA'
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
