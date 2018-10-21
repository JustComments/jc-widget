const path = require('path');
const webpack = require('webpack');
const NODE_ENV = process.env.NODE_ENV;
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const I18nPlugin = require('i18n-webpack-plugin');
const localizedBundles = require('./src/locales').bundles;

Object.keys(localizedBundles).forEach((bundleKey) => {
  const bundle = localizedBundles[bundleKey];
  bundle.translations = require('./src/locales/' + bundle.textLocale);
});

const plugins = [
  new webpack.DefinePlugin({
    ENDPOINT: JSON.stringify(process.env.ENDPOINT || 'localhost:3000'),
    PROTO: JSON.stringify(process.env.PROTO || 'http'),
    GUEST_SECRET: JSON.stringify(process.env.GUEST_SECRET || 'guest'),
    PUSH_URL: JSON.stringify(
      process.env.PUSH_URL || 'http://localhost:8080/push.html',
    ),
    SELF_URL: JSON.stringify(
      process.env.SELF_URL || 'http://localhost:3333/dist/core.js',
    ),
    TWITTER_START_URL: JSON.stringify(
      process.env.TWITTER_START_URL ||
        'http://127.0.0.1:8080/twitter-start.html',
    ),
  }),
];

const standardOptions = {
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  devtool: NODE_ENV === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]--[hash:base64:5]',
            },
          },
        ],
      },
    ],
  },
};

module.exports = [
  ...Object.keys(localizedBundles).map((bundleKey) => {
    const bundle = localizedBundles[bundleKey];
    return {
      entry: ['promise-polyfill/src/polyfill', 'whatwg-fetch', './src/core.js'],
      output: {
        filename: `core.${bundle.textLocale}.js`,
        path: path.resolve(__dirname, 'dist'),
      },
      plugins: [
        ...plugins,
        new webpack.DefinePlugin({
          BUNDLE_LOCALE: JSON.stringify(bundle.textLocale),
        }),
        new webpack.NormalModuleReplacementPlugin(
          /TIMEAGO_LOCALE/,
          'timeago.js/locales/' + bundle.timeAgoLocale,
        ),
        new I18nPlugin(bundle.translations),
        ...(NODE_ENV !== 'development'
          ? [
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: `size.${bundle.textLocale}.html`,
              }),
            ]
          : []),
      ],
      ...standardOptions,
    };
  }),
  {
    entry: {
      w: './src/w.js',
      auth: './src/auth.js',
    },
    output: {
      filename: `[name].js`,
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      ...plugins,
      ...(NODE_ENV !== 'development'
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: `size.html`,
            }),
          ]
        : []),
    ],
    ...standardOptions,
  },
];
