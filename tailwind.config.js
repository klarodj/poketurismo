/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        win98: {
          bg: '#008080', // Classic teal background
          gray: '#c0c0c0', // Main window face
          darkGray: '#808080', // Shadow
          darkerGray: '#404040', // Deep shadow
          white: '#ffffff', // Highlight
          blue: '#000080', // Active titlebar start
          lightBlue: '#1084d0', // Active titlebar end (gradient)
          inactiveBlue: '#808080', // Inactive titlebar start
          inactiveLightBlue: '#b5b5b5', // Inactive titlebar end
          text: '#000000', // Standard text
        }
      },
      fontFamily: {
        pixel: ['"VT323"', 'monospace']
      },
      boxShadow: {
        'win98-outset': 'inset 1px 1px #ffffff, inset -1px -1px #000000, inset 2px 2px #dfdfdf, inset -2px -2px #808080',
        'win98-inset': 'inset 1px 1px #808080, inset -1px -1px #ffffff, inset 2px 2px #000000, inset -2px -2px #dfdfdf',
      }
    },
  },
  plugins: [],
}
