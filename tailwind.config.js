module.exports = {
  purge: [
    './pages/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        jade: {
          DEFAULT: '#00A960',
          50: '#8FFFCF',
          100: '#76FFC4',
          200: '#43FFAE',
          300: '#10FF98',
          400: '#00DC7D',
          500: '#00A960',
          600: '#007643',
          700: '#004326',
          800: '#001009',
          900: '#000000',
        },
        orange: {
          DEFAULT: '#ED8936',
          50: '#FFFFFF',
          100: '#FEF7F1',
          200: '#FADBC2',
          300: '#F5C094',
          400: '#F1A465',
          500: '#ED8936',
          600: '#DC6F14',
          700: '#AD5710',
          800: '#7F400B',
          900: '#502807',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
