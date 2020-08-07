const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FailOnErrorsPlugin = require('fail-on-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CNAMEWebpackPlugin = require('cname-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

module.exports = () => {
  let plugins = [];
  let config = {};
  if (env === 'production') {
    config = {
      loggingLevel: 'normal',
      outputFileName: 'public/[name].[contenthash].js',
      externalsFileExtension: '.min.js',
      externalsDirectory: 'externalsProd',
    };
    plugins = plugins.concat([
      new CleanWebpackPlugin(),
      new CNAMEWebpackPlugin({
        domain: 'myvision.ai',
      })]);
  } else {
    config = {
      loggingLevel: { assets: false, modules: false, children: false },
      outputFileName: 'public/[name].js',
      externalsFileExtension: '.js',
      externalsDirectory: 'externalsDev',
    };
  }
  plugins = plugins.concat([
    new FailOnErrorsPlugin({
      failOnErrors: true,
      failOnWarnings: true,
    }),
    new HtmlWebpackPlugin({
      externalsFileExtension: config.externalsFileExtension,
      template: 'src/devIndexTemplate.html',
      minify: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/css', to: 'public/assets/css' },
        { from: './src/assets/images', to: 'public/assets/images' },
        { from: './src/assets/svg', to: 'public/assets/svg' },
        { from: `./src/assets/externals/${config.externalsDirectory}`, to: 'public/assets/externals' },
      ],
    }),
  ]);
  return {
    entry: {
      browserSupportBundle: './src/browserSupport/index.js',
      appBundle: './src/app/index.js',
    },
    output: {
      filename: config.outputFileName,
      path: __dirname,
    },
    externals: {
      fabric: 'fabric',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
            {
              loader: 'eslint-loader',
            },
          ],
        },
      ],
    },
    mode: env,
    stats: config.loggingLevel,
    plugins,
    performance: {
      maxEntrypointSize: 340000,
      maxAssetSize: 340000,
    },
  };
};