const path = require('path');

module.exports = {
  entry: './src/content_scripts/index.ts',
  output: {
    path: path.join(__dirname, 'dist', 'content_scripts'),
    filename: 'index.js'
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
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
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};
