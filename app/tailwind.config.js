module.exports = {
   mode: 'jit',
   purge: ['./src/jsx/**/*.js'],
   prefix: 'tw-',
   important: true,
   darkMode: false, // or 'media' or 'class'
   theme: {
      extend: {},
   },
   variants: {
      extend: {
         fontWeight: {
            bold: 600,
         },
      },
   },
   plugins: [],
};
