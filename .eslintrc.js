module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    __: 'readonly',
    grecaptcha: 'readonly',
    CORE_URL: 'readonly',
    API_ENDPOINT: 'readonly',
    TWITTER_URL: 'readonly',
    FB_URL: 'readonly',
    PUSH_URL: 'readonly',
    API_ENDPOINT: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      impliedStrict: true,
      experimentalObjectRestSpread: true,
      experimentalDecorators: true,
      jsx: true,
    },
  },
  settings: {
    react: {
      pragma: 'h',
    },
  },
  rules: {
    'no-console': 0,
  },
};
