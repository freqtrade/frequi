/** @type {import('tailwindcss').Config} */

import primeui from 'tailwindcss-primeui';

export default {
  content: ['./index.html', './src/**/*.{html,js,vue}'],
  darkMode: 'selector',
  theme: {
    extend: {},
  },
  plugins: [primeui],
};
