/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes:{
        slideFromRight:{
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        diagonalReveal:{
          '0%': {clipPath: 'polygon(0% 100%, 32% 100%, 32% 100%, 0% 100%)',},
          '100%': {clipPath: 'polygon(0% 0%, 32% 0%, 12% 100%, 0% 100%)',},
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation:{
        'slide-right': 'slideFromRight 0.85s ease-in-out 0.1s both',
        'diagonal': 'diagonalReveal 0.45s ease-in 0.2s both',
        'fade-up': 'fadeUp 0.5s ease-in-out 1.2s both',
      },
    },
  },
  plugins: [],
}
