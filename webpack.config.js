const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
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
    RECAPTCHA_KEY: '6Lc9nTEUAAAAABlX72vOhEVdBUX_ULUY88e7Chkl',
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
            {
              loader: 'style-loader',
              options: {
                attributes: {
                  id: 'jcStyle',
                },
              },
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: !env.production
                    ? '[name]_[local]___[hash:base64:10]'
                    : '[sha512:hash:base64:7]',
                  hashPrefix: 'jc',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('postcss-nested')(),
                  require('postcss-autoreset')({
                    rulesMatcher: (rule) => {
                      return rule.selector.match(
                        /^:global\([.]just-comments\)\s+[.]\w+$/,
                      );
                    },
                    reset: {
                      margin: 0,
                      padding: 0,
                      border: 'unset',
                      textAlign: 'left',
                      boxShadow: 'unset',
                      transition: 'unset',
                      fontWeight: 'normal',
                      textDecoration: 'none',
                      width: 'unset',
                      backgroundImage: 'unset',
                      backgroundPosition: 'unset',
                      backgroundRepeat: 'unset',
                      borderRadius: 'unset',
                    },
                  }),
                  require('autoprefixer')(),
                  require('cssnano')({
                    preset: 'default',
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
            /TIMEAGO_LOCALE_MODULE/,
            'timeago.js/esm/lang/' + bundle.timeAgoLocale,
          ),
          new webpack.NormalModuleReplacementPlugin(
            /BUNDLE_LOCALE_MODULE/,
            './locales/' + bundle.textLocale,
          ),
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
