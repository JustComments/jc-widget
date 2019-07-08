module.exports = {
  verbose: true,
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    TIMEAGO_LOCALE_MODULE: 'timeago.js/locales/en',
  },
  transform: {
    '\\.js$': '<rootDir>/node_modules/babel-jest',
  },
};
