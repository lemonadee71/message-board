/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.njk'],
  theme: {
    extend: {},
  },
  // eslint-disable-next-line
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
