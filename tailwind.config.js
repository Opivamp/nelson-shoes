/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0A0A',
          surface: '#121212',
          card: '#161616',
          border: '#222222',
          subtle: '#2A2A2A',
        },
        ivory: {
          DEFAULT: '#F5F1E8',
          soft: '#EBE5D8',
          muted: '#D8CBB8',
        },
        espresso: {
          DEFAULT: '#241711',
          dark: '#180F0B',
          light: '#34221A',
        },
        chocolate: {
          DEFAULT: '#3A2418',
          deep: '#2A180E',
          accent: '#4C3021',
        },
        champagne: {
          DEFAULT: '#B89B5E',
          light: '#CDB682',
          muted: '#8E7543',
        },
        neutral: {
          warm: '#D8CBB8',
          sand: '#C5B6A0',
          taupe: '#7D7365',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.2em',
        'editorial': '0.28em',
        'monumental': '0.38em',
      },
      boxShadow: {
        'luxury-subtle': '0 10px 40px -10px rgba(0, 0, 0, 0.7)',
        'luxury-gold': '0 0 25px rgba(184, 155, 94, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
