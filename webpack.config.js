const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  externals: {
    'cancelable-promise-jq': 'cancelable-promise-jq',
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'bundle.js',
    libraryTarget: 'umd',
    library: 'async-callbacks-manager',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'async-callbacks-manager': path.resolve(
        __dirname,
        'node_modules/async-callbacks-manager/package.json'
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
              plugins: [
                '@babel/plugin-transform-modules-commonjs',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-export-namespace-from',
              ],
            },
          },
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
