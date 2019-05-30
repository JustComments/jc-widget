const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const I18nPlugin = require('i18n-webpack-plugin');
const localizedBundles = require('./src/locales').bundles;

Object.keys(localizedBundles).forEach((bundleKey) => {
  const bundle = localizedBundles[bundleKey];
  bundle.translations = require('./src/locales/' + bundle.textLocale);
});

module.exports = function(env, args) {
  const skipReports = args.skipReports !== 'false';
  const locale = args.locale || null;
  const host = 'http://localhost';
  const defineParams = {
    API_ENDPOINT: args.endpoint || `${host}:3000`,
    CORE_URL: args.coreUrl || `${host}:3333/dist/core2.js`,
    GUEST_SECRET: args.guestSecret || 'guest',
    PUSH_URL: args.pushUrl || `${host}:8080/push.html`,
    TWITTER_URL: args.twitterUrl || `${host}:8080/twitter-start.html`,
    FB_URL: args.fbUrl || `${host}:8080/fb-start.html`,
  };
  const plugins = [
    new webpack.DefinePlugin(
      Object.keys(defineParams).reduce((acc, key) => {
        acc[key] = JSON.stringify(defineParams[key]);
        return acc;
      }, defineParams),
    ),
  ];

  const standardOptions = {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : 'source-map',
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
                // importLoaders: 1,
                modules: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('postcss-autoreset')({
                    rulesMatcher: (rule) => rule.selector.match(/^[.]\w+$/),
                    reset: {
                      margin: 0,
                      padding: 0,
                      borderRadius: 0,
                      textAlign: 'left',
                    },
                  }),
                  require('autoprefixer')({
                    browsers: ['last 2 versions', 'safari >= 7'],
                  }),
                ],
              },
            },
          ],
        },
      ],
    },
  };

  const bundleKeys = Object.keys(localizedBundles).filter((bundleKey) => {
    if (!locale) {
      return true;
    }
    return bundleKey === locale;
  });

  return [
    ...bundleKeys.map((bundleKey) => {
      const bundle = localizedBundles[bundleKey];
      return {
        entry: ['./src/core.js'],
        output: {
          filename: `core2.${bundle.textLocale}.js`,
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
          ...(!skipReports
            ? [
                new BundleAnalyzerPlugin({
                  analyzerMode: 'static',
                  reportFilename: `reports/size.${bundle.textLocale}.html`,
                }),
              ]
            : []),
        ],
        ...standardOptions,
      };
    }),
    {
      entry: {
        w2: './src/w.js',
        auth2: './src/auth.js',
      },
      output: {
        filename: `[name].js`,
        path: path.resolve(__dirname, 'dist'),
      },
      plugins: [
        ...plugins,
        ...(!skipReports
          ? [
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: `reports/size.html`,
              }),
            ]
          : []),
      ],
      ...standardOptions,
    },
  ];
};
