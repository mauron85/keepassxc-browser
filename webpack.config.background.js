const path = require('path');

module.exports = {
  entry: './src/background/index.ts',
  output: {
    path: path.join(__dirname, 'dist', 'background'),
    filename: 'index.js'
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};
