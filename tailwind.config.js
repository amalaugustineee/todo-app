/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9fe',
          100: '#e1f3fc',
          200: '#c3e7fa',
          300: '#8ecae6',
          400: '#219ebc',
          500: '#1b8aa6',
          600: '#177693',
          700: '#136275',
          800: '#0f4d5c',
          900: '#023047',
          950: '#01202f',
        },
        accent: {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#ffb703',
          600: '#fb8500',
          700: '#cc6a00',
          800: '#995000',
          900: '#663500',
          950: '#331a00',
        },
        background: {
          light: '#ffffff',
          dark: '#023047',
        },
        surface: {
          light: '#f8fafc',
          dark: '#033a58',
        },
      },
      boxShadow: {
        'task': '0 4px 6px -1px rgba(2, 48, 71, 0.1), 0 2px 4px -1px rgba(2, 48, 71, 0.06)',
        'task-hover': '0 10px 15px -3px rgba(2, 48, 71, 0.1), 0 4px 6px -2px rgba(2, 48, 71, 0.05)',
        'glow': '0 0 15px rgba(33, 158, 188, 0.5)',
        'glow-accent': '0 0 15px rgba(251, 133, 0, 0.5)',
        'card': '0 10px 30px -5px rgba(2, 48, 71, 0.2)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 3s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'card-flip': 'cardFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'card-hover': 'cardHover 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'card-drag': 'cardDrag 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'card-return': 'cardReturn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.05)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
          '100%': { transform: 'translateY(-8px) scale(1.02)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
        },
        cardDrag: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '100%': { transform: 'rotate(2deg) scale(1.05)' },
        },
        cardReturn: {
          '0%': { transform: 'rotate(2deg) scale(1.05)' },
          '100%': { transform: 'rotate(0deg) scale(1)' },
        },
      },
      fontSize: {
        'title': ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'subtitle': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-card': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #8ecae6, #219ebc, #023047)',
        'gradient-accent': 'linear-gradient(135deg, #ffb703, #fb8500)',
      },
      fontFamily: {
        'sans': ['"Space Mono"', 'monospace'],
        'serif': ['Prata', 'serif'],
        'mono': ['"Space Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'card-spring': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

