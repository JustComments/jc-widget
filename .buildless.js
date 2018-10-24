const ejs = require('buildless-ejs-transform');
const jwt = require('jsonwebtoken');
const user = {
  apiKey: 'development',
  userId: 'alex',
  username: 'Alex Rudenko',
  userEmail: 'alex@just-comments.com',
};
const token = jwt.sign(user, 'development', {
  algorithm: 'HS256',
});

module.exports = {
  port: 3333,
  environment: {
    dev: { token },
    prod: { token },
  },
  transforms: [
    {
      test: /\.(html)$/,
      fn: ejs,
    },
  ],
};
