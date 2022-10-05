
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          transparent: 'rgba(59, 130, 246, 0.5)'
        }
      },
      screens: {
        'xs': '480px'
      }
    },
  },
  plugins: [
      require('tailwind-scrollbar'),
      plugin(({addComponents, addVariant, e}) => {
        addComponents({
          '.scrollbar-thin-blue': {
            '@apply !scrollbar-thin !scrollbar-track-transparent !scrollbar-thumb-blue-transparent': {}
          },
          '.scrollbar-thin-transparent': {
            '@apply !scrollbar-thin !scrollbar-track-transparent !scrollbar-thumb-transparent': {}
          }
        })

        addVariant('not-first', ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`not-first${separator}${className}`)}:not(:first-child)`
          })
        })

        addVariant('not-last', ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`not-last${separator}${className}`)}:not(:last-child)`
          })
        })
      })
  ],
}
