/* eslint-disable import/no-extraneous-dependencies */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.njk'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({ strategy: 'base' }),
  ],
};
