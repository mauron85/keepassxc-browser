const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/background/index.ts',
  output: {
    path: path.join(__dirname, 'dist', 'background'),
    filename: 'index.js'
  },
  devtool: 'inline-source-map',
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};
