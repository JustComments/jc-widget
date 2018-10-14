const ejs = require('buildless-ejs-transform');

module.exports = {
  port: 3333,
  environment: {
    dev: {},
    prod: {},
  },
  transforms: [
    {
      test: /\.(html)$/,
      fn: ejs,
    },
  ],
};
