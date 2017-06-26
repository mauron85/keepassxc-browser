const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/popups/index.js',
  output: {
    filename: 'popup.js',
    path: path.join(__dirname, 'dist', 'popups'),
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['src', 'node_modules']
  },
  devServer: {
    port: 8080,
    hot: true,
    contentBase: path.resolve(__dirname, 'src', 'popups'),
    publicPath: '/'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin() // Enable HMR
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};
