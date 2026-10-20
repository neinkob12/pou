// Farben und Schriften kommen aus src/lib/theme.ts (Tailwind lädt TS-Dateien über jiti).
const { colors, fonts } = require('./src/lib/theme.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        heading: [fonts.heading],
        body: [fonts.body],
        'body-bold': [fonts.bodyBold],
      },
    },
  },
  plugins: [],
};
