/** @type {import('tailwindcss').Config} */
module.exports = {
    future: {
      hoverOnlyWhenSupported: true,
    },
    content: [
      './src/**/*.{html,ts,scss}',
    ],
    theme: {
      extend: {
        appearance: ['webkit', 'moz'],
        colors: {
          pastelYellow: '#ffca28',
          pastelIndigo: '#ab47bc',
          pastelBlue: '#26c6da',
          pastelGreen: '#26a69a',
          pastelOrange: '#ff7043',
          pastelRed: '#ef5350',
          pastelVioleta: '#7d54c4',
        },
        fontFamily: {
          poppins: ['Poppins', 'sans-serif'],
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          mono: ['Courier New', 'monospace'],
        },
        screens: {
          '3xl': '1600px',
          '4xl': '1920px',
        },
        animation: {
          draw: 'draw 2s ease-out forwards',
        },
        keyframes: {
          draw: {
            '0%': { 'stroke-dashoffset': '300' },
            '100%': { 'stroke-dashoffset': '0' },
          },
        },
      },
    },
    plugins: [
      require('daisyui'),
    ],
  }
  