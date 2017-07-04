const path = require('path');

module.exports = {
  verbose: true,
  globals: {
    __TS_CONFIG__: 'jest.tsconfig.json'
  },
  rootDir: path.join(__dirname, 'src'),
  projects: ['<rootDir>/background'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx|js)$': path.join(
      __dirname,
      'node_modules',
      'ts-jest',
      'preprocessor.js'
    )
  },
  testRegex: '/__tests__/.*\\.(ts|tsx|js)$'
};
