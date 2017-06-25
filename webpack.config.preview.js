const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: [
      './src/options/index.js',
    ]
  },
  output: {
    path: path.join(__dirname, 'preview'),
    filename: 'main.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['src', 'node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('preview')
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, 'src') // important for performance!
        ],
        use: [
          {
            loader: 'babel-loader',
            query: { cacheDirectory: true }
          }
        ]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  }
};
