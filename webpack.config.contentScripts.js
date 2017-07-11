const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/content_scripts/index.tsx',
  output: {
    path: path.join(__dirname, 'dist', 'content_scripts'),
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
      {
        // Issue: https://github.com/madrobby/zepto/pull/1244
        test: require.resolve('zepto'),
        use: {
          loader: 'imports-loader',
          options: 'this=>window'
        }
      },
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, loader: 'babel-loader!ts-loader' }
    ]
  }
};
